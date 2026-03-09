import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import api from '../services/api';
import Card from '../components/common/Card';

const formatNotificationTime = (isoDate) => {
    try {
        const date = new Date(isoDate);
        return date.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return isoDate;
    }
};

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications/');
            setNotifications(res.data || []);
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
            console.error('Error marking all notifications as read', err);
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
        <div className="max-w-5xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Notifications</h1>
                    <p className="text-sm text-slate-500 mt-1">View all notifications with timestamps.</p>
                </div>
                <Link
                    to="/ngo-dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-100"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>
            </div>

            <Card
                headerAction={
                    <div className="flex items-center gap-3">
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
                    <p className="text-sm text-slate-500 italic text-center py-8">No notifications yet.</p>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-3 rounded-md border ${
                                    notification.is_read ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-200'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                                        <p className="text-sm text-slate-600 mt-0.5">{notification.body}</p>
                                        <p className="text-xs text-slate-500 mt-2">
                                            {formatNotificationTime(notification.created_at)}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <button
                                            type="button"
                                            onClick={() => markOneRead(notification.id)}
                                            className="text-xs font-semibold text-blue-600 hover:underline shrink-0"
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
        </div>
    );
};

export default NotificationsPage;
