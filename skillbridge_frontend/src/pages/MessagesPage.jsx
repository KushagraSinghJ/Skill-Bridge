import React from 'react';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import ChatInterface from '../components/ChatInterface';
import { useAuth } from '../context/AuthContext';

const MessagesPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const initialPartner = location.state?.partner || null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 inline-flex items-center gap-2">
                        <MessageSquare size={26} />
                        Messages
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time chat with volunteers and NGOs.</p>
                </div>
                <Link
                    to={user?.role === 'ngo' ? '/ngo-dashboard' : '/volunteer-dashboard'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-100"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>
            </div>
            <ChatInterface currentUser={user} initialPartner={initialPartner} />
        </div>
    );
};

export default MessagesPage;
