import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Loader2, Search, Send } from 'lucide-react';

import api from '../services/api';
import Card from './common/Card';

const ChatInterface = ({ currentUser, initialPartner }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [showThreadOnMobile, setShowThreadOnMobile] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const lastFetchedPartnerIdRef = useRef(null);
    const selectedPartnerIdRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const fallbackSyncIntervalRef = useRef(null);
    const reconnectAttemptRef = useRef(0);
    const heartbeatIntervalRef = useRef(null);

    const selectedPartnerId = selectedPartner?.partner_id || selectedPartner?.id;
    selectedPartnerIdRef.current = selectedPartnerId;

    const fetchConversations = async () => {
        const res = await api.get('/messages/conversations');
        setConversations(res.data);
        return res.data;
    };

    const fetchMessages = async (partnerId, { silent = false } = {}) => {
        if (!partnerId) {
            setMessages([]);
            lastFetchedPartnerIdRef.current = null;
            return;
        }
        const isPartnerChanged = lastFetchedPartnerIdRef.current !== partnerId;
        if (!silent || isPartnerChanged) setLoadingMessages(true);
        try {
            const res = await api.get(`/messages/with/${partnerId}`);
            setMessages(res.data);
            lastFetchedPartnerIdRef.current = partnerId;
        } catch (err) {
            console.error('Error loading messages', err);
        } finally {
            if (!silent || isPartnerChanged) setLoadingMessages(false);
        }
    };

    const normalizedConversations = useMemo(() => {
        if (!initialPartner?.id) return conversations;
        const exists = conversations.some((c) => c.partner_id === initialPartner.id);
        if (exists) return conversations;
        return [{ partner_id: initialPartner.id, partner_name: initialPartner.name, partner_role: 'unknown' }, ...conversations];
    }, [conversations, initialPartner]);

    const filteredConversations = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return normalizedConversations;
        return normalizedConversations.filter((c) =>
            (c.partner_name || '').toLowerCase().includes(q) ||
            (c.last_message || '').toLowerCase().includes(q)
        );
    }, [normalizedConversations, searchTerm]);

    useEffect(() => {
        const load = async () => {
            try {
                const list = await fetchConversations();
                if (list.length > 0 && !initialPartner?.id) {
                    setSelectedPartner((prev) => prev || list[0]);
                }
            } catch (err) {
                console.error('Error loading conversations', err);
            } finally {
                setLoadingConversations(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (initialPartner?.id) {
            setSelectedPartner({ partner_id: initialPartner.id, partner_name: initialPartner.name });
            setShowThreadOnMobile(true);
        }
    }, [initialPartner]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !currentUser?.id) return;

        let disposed = false;
        let ws = null;
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${protocol}://localhost:8000/ws/chat?token=${encodeURIComponent(token)}`;

        const stopFallbackSync = () => {
            if (fallbackSyncIntervalRef.current) {
                clearInterval(fallbackSyncIntervalRef.current);
                fallbackSyncIntervalRef.current = null;
            }
        };

        const stopHeartbeat = () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
                heartbeatIntervalRef.current = null;
            }
        };

        const startFallbackSync = () => {
            if (fallbackSyncIntervalRef.current) return;
            fallbackSyncIntervalRef.current = setInterval(async () => {
                try {
                    await fetchConversations();
                    if (selectedPartnerIdRef.current) {
                        await fetchMessages(selectedPartnerIdRef.current, { silent: true });
                    }
                } catch (err) {
                    console.error('Fallback sync failed', err);
                }
            }, 15000);
        };

        const scheduleReconnect = () => {
            if (disposed || reconnectTimeoutRef.current) return;
            const delay = Math.min(10000, 1000 * (2 ** reconnectAttemptRef.current));
            reconnectAttemptRef.current += 1;
            reconnectTimeoutRef.current = setTimeout(() => {
                reconnectTimeoutRef.current = null;
                connect();
            }, delay);
        };

        const connect = () => {
            if (disposed) return;
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                setWsConnected(true);
                reconnectAttemptRef.current = 0;
                stopFallbackSync();
                stopHeartbeat();
                heartbeatIntervalRef.current = setInterval(() => {
                    if (ws && ws.readyState === WebSocket.OPEN) ws.send('ping');
                }, 20000);
                fetchConversations();
                if (selectedPartnerIdRef.current) {
                    fetchMessages(selectedPartnerIdRef.current, { silent: true });
                }
            };

            ws.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    if (payload.type === 'pong') return;
                    if (payload.type !== 'message') return;
                    const msg = payload.data;
                    const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
                    const partnerName = msg.sender_id === currentUser.id ? msg.receiver_name : msg.sender_name;

                    setConversations((prev) => {
                        const existing = prev.find((c) => c.partner_id === partnerId);
                        const updated = {
                            partner_id: partnerId,
                            partner_name: partnerName,
                            partner_role: existing?.partner_role || 'unknown',
                            last_message: msg.content,
                            last_message_at: msg.created_at,
                        };
                        if (!existing) return [updated, ...prev];
                        return [updated, ...prev.filter((c) => c.partner_id !== partnerId)];
                    });

                    if (selectedPartnerIdRef.current === partnerId) {
                        setMessages((prev) => {
                            if (prev.some((item) => item.id === msg.id)) return prev;
                            return [...prev, msg];
                        });
                    }
                } catch (err) {
                    console.error('Invalid websocket payload', err);
                }
            };

            ws.onclose = () => {
                setWsConnected(false);
                stopHeartbeat();
                startFallbackSync();
                scheduleReconnect();
            };

            ws.onerror = () => {
                ws.close();
            };
        };

        connect();

        return () => {
            disposed = true;
            setWsConnected(false);
            stopHeartbeat();
            stopFallbackSync();
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            if (ws) ws.close();
        };
    }, [currentUser?.id]);

    useEffect(() => {
        fetchMessages(selectedPartnerId);
    }, [selectedPartnerId]);

    useEffect(() => {
        if (!wsConnected || !selectedPartnerId) return;
        const interval = setInterval(async () => {
            try {
                await fetchMessages(selectedPartnerId, { silent: true });
            } catch (err) {
                console.error('Soft refresh failed', err);
            }
        }, 45000);
        return () => clearInterval(interval);
    }, [wsConnected, selectedPartnerId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!selectedPartnerId || !messageText.trim()) return;
        const text = messageText.trim();
        const tempId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const optimisticMsg = {
            id: tempId,
            sender_id: currentUser?.id,
            receiver_id: selectedPartnerId,
            content: text,
            created_at: new Date().toISOString(),
            sender_name: currentUser?.name || 'You',
            receiver_name: selectedPartner?.partner_name || selectedPartner?.name || 'Partner',
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        setConversations((prev) => {
            const updated = {
                partner_id: selectedPartnerId,
                partner_name: selectedPartner?.partner_name || selectedPartner?.name || 'Unknown',
                partner_role: selectedPartner?.partner_role || 'unknown',
                last_message: text,
                last_message_at: optimisticMsg.created_at,
            };
            return [updated, ...prev.filter((c) => c.partner_id !== selectedPartnerId)];
        });
        setMessageText('');
        setSending(true);
        try {
            const res = await api.post('/messages/', {
                receiver_id: selectedPartnerId,
                content: text,
            });
            const msg = res.data;
            setMessages((prev) => {
                const withoutTemp = prev.filter((item) => item.id !== tempId);
                if (withoutTemp.some((item) => item.id === msg.id)) return withoutTemp;
                return [...withoutTemp, msg];
            });
            setConversations((prev) => {
                const updated = {
                    partner_id: selectedPartnerId,
                    partner_name: selectedPartner?.partner_name || selectedPartner?.name || 'Unknown',
                    partner_role: selectedPartner?.partner_role || 'unknown',
                    last_message: msg.content,
                    last_message_at: msg.created_at,
                };
                return [updated, ...prev.filter((c) => c.partner_id !== selectedPartnerId)];
            });
        } catch (err) {
            setMessages((prev) => prev.filter((item) => item.id !== tempId));
            console.error('Error sending message', err);
        } finally {
            setSending(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const selectConversation = (conversation) => {
        setSelectedPartner(conversation);
        setShowThreadOnMobile(true);
    };

    return (
        <Card title="Messages" className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] border border-slate-200 rounded-xl min-h-[500px]">
                <div className={`${showThreadOnMobile ? 'hidden md:block' : 'block'} border-r border-slate-200 bg-white`}>
                    <div className="p-3 border-b border-slate-200">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search conversations..."
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="max-h-[445px] overflow-y-auto p-2">
                        {loadingConversations ? (
                            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-blue-600" size={20} /></div>
                        ) : filteredConversations.length === 0 ? (
                            <p className="text-xs text-slate-500 p-3">No conversations found.</p>
                        ) : (
                            filteredConversations.map((conv) => (
                                <button
                                    key={conv.partner_id}
                                    type="button"
                                    onClick={() => selectConversation(conv)}
                                    className={`w-full text-left p-3 rounded-lg mb-2 border transition ${
                                        selectedPartnerId === conv.partner_id
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{conv.partner_name}</p>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatTimestamp(conv.last_message_at)}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mt-1">{conv.last_message || 'Start conversation'}</p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className={`${showThreadOnMobile ? 'flex' : 'hidden md:flex'} flex-col bg-slate-50`}>
                    {!selectedPartnerId ? (
                        <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
                            Select a conversation to start chatting.
                        </div>
                    ) : (
                        <>
                            <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowThreadOnMobile(false)}
                                    className="md:hidden p-1 rounded hover:bg-slate-100"
                                >
                                    <ArrowLeft size={16} />
                                </button>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-slate-800">{selectedPartner?.partner_name || selectedPartner?.name}</p>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${wsConnected ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        {wsConnected ? 'Live' : 'Syncing'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[380px]">
                                {loadingMessages ? (
                                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={20} /></div>
                                ) : messages.length === 0 ? (
                                    <p className="text-xs text-slate-500 text-center py-10">No messages yet.</p>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                                msg.sender_id === currentUser?.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white border border-slate-200 text-slate-800'
                                            }`}>
                                                <p>{msg.content}</p>
                                                <p className={`text-[10px] mt-1 ${msg.sender_id === currentUser?.id ? 'text-blue-100' : 'text-slate-400'}`}>
                                                    {formatTimestamp(msg.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={sendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !messageText.trim()}
                                    className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-1"
                                >
                                    <Send size={14} />
                                    Send
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default ChatInterface;
