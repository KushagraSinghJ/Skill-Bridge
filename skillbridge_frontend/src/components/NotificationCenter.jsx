import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';

import api from '../services/api';
import Card from './common/Card';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications/');
            setNotifications(res.data);
        } catch (err) {
            console.error('Error loading notifications', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 20000);
        const token = localStorage.getItem('token');
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const ws = token ? new WebSocket(`${protocol}://localhost:8000/ws/chat?token=${encodeURIComponent(token)}`) : null;
        if (ws) {
            ws.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    if (payload.type !== 'notification') return;
                    setNotifications((prev) => {
                        if (prev.some((item) => item.id === payload.data.id)) return prev;
                        return [payload.data, ...prev];
                    });
                } catch (err) {
                    console.error('Invalid notification payload', err);
                }
            };
        }
        return () => {
            clearInterval(interval);
            if (ws) ws.close();
        };
    }, []);

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.is_read).length,
        [notifications]
    );

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Error marking notifications as read', err);
        }
    };

    const markOneRead = async (notificationId) => {
        try {
            await api.patch(`/notifications/${notificationId}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
            );
        } catch (err) {
            console.error('Error marking notification as read', err);
        }
    };

    return (
        <Card
            title="Notifications"
            headerAction={
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                        <Bell size={14} />
                        {unreadCount} unread
                    </span>
                    <button
                        type="button"
                        onClick={markAllRead}
                        className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                        <CheckCheck size={13} />
                        Mark all
                    </button>
                </div>
            }
        >
            {notifications.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-4">No notifications yet.</p>
            ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                    {notifications.slice(0, 10).map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-2 rounded-md border ${
                                notification.is_read ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-200'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs font-semibold text-slate-800">{notification.title}</p>
                                    <p className="text-xs text-slate-600">{notification.body}</p>
                                </div>
                                {!notification.is_read && (
                                    <button
                                        type="button"
                                        onClick={() => markOneRead(notification.id)}
                                        className="text-[10px] font-semibold text-blue-600 hover:underline"
                                    >
                                        Read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default NotificationCenter;
