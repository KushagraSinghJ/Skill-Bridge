import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, ClipboardList, Clock, LogOut, User as UserIcon, Check, X, MessageSquare, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import MatchSuggestionsPanel from '../components/MatchSuggestionsPanel';

const NGODashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState([]);
    const [stats, setStats] = useState({
        activeOpps: 0,
        applications: 0,
        volunteers: 0,
        pending: 0
    });

    const [applications, setApplications] = useState([]);
    const [updatingAppId, setUpdatingAppId] = useState(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const openChat = (partner = null) => {
        navigate('/messages', partner ? { state: { partner } } : undefined);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats
                const statsRes = await api.get('/users/stats');
                setStats({
                    activeOpps: statsRes.data.activeOpps,
                    applications: statsRes.data.pendingApps, // Using pending apps as 'Applications' count for now
                    volunteers: statsRes.data.totalVolunteers,
                    pending: statsRes.data.pendingApps
                });

                const oppsRes = await api.get('/opportunities/ngo');
                setOpportunities(oppsRes.data || []);

                // Fetch recent applications
                const appsRes = await api.get('/applications/ngo');
                setApplications(appsRes.data);

                const notificationsRes = await api.get('/notifications/');
                const unreadCount = (notificationsRes.data || []).filter((item) => !item.is_read).length;
                setUnreadNotifications(unreadCount);
            } catch (err) {
                console.error('Error fetching dashboard data', err);
            }
        };
        fetchDashboardData();
    }, []);



    const handleApplicationStatus = async (applicationId, status) => {
        setUpdatingAppId(applicationId);
        try {
            await api.patch(`/applications/${applicationId}/status`, { status });
            const wasPending = applications.find((app) => app.id === applicationId)?.status === 'pending';
            setApplications((prev) =>
                prev.map((app) => {
                    return app.id === applicationId ? { ...app, status } : app;
                })
            );
            if (wasPending) {
                setStats((prev) => ({
                    ...prev,
                    pending: Math.max(0, prev.pending - 1)
                }));
            }
        } catch (err) {
            console.error(`Error updating application to ${status}`, err);
            alert(err.response?.data?.detail || 'Failed to update application status');
        } finally {
            setUpdatingAppId(null);
        }
    };

    const visibleApplications = applications.slice(0, 1);
    const previewOpportunities = opportunities.slice(0, 3);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">NGO Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage your opportunities and connect with volunteers.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition duration-200"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                    <Link
                        to="/create-opportunity"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition duration-200 shadow-lg shadow-blue-100"
                    >
                        <Plus size={20} />
                        <span>Create Opportunity</span>
                    </Link>
                    <button
                        onClick={() => navigate('/notifications')}
                        className="relative flex items-center justify-center bg-white border border-slate-200 text-slate-600 w-11 h-11 rounded-lg hover:bg-slate-50 transition duration-200"
                        title="Notifications"
                    >
                        <Bell size={20} />
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => openChat()}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium transition duration-200"
                    >
                        <MessageSquare size={20} />
                        <span>Messages</span>
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <Card className="border-l-4 border-blue-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Opportunities</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.activeOpps}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-l-4 border-emerald-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Applications</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.applications}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-l-4 border-amber-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Volunteers</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.volunteers}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-l-4 border-rose-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-100 rounded-lg text-rose-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending Apps</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Opportunities Section */}
                <div className="lg:col-span-2">
                    <Card
                        title="Your Opportunities"
                        className="h-full"
                        headerAction={
                            <Link
                                to="/ngo-opportunities"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                            >
                                View Opportunities
                            </Link>
                        }
                    >
                        {previewOpportunities.length === 0 ? (
                            <div className="h-full flex items-center">
                                <p className="text-slate-500 italic">No opportunities posted yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {previewOpportunities.map((opp) => (
                                    <div key={opp.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50/60">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{opp.title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {opp.location || 'Location not set'} • {opp.duration || 'Duration not set'}
                                                </p>
                                            </div>
                                            <Badge variant={opp.status === 'open' ? 'success' : 'danger'}>
                                                {opp.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                <p className="text-xs text-slate-500">Showing latest {previewOpportunities.length} opportunities.</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Applications Sidebar */}
                <div>
                    <Card
                        title="Recent Applications"
                        headerAction={
                            <Link
                                to="/ngo-recent-applications"
                                className="text-sm text-blue-600 font-medium hover:underline"
                            >
                                View All
                            </Link>
                        }
                    >
                        <div className="space-y-4">
                            {applications.length === 0 ? (
                                <p className="text-sm text-slate-500 italic text-center py-4">No applications yet.</p>
                            ) : (
                                visibleApplications.map(app => (
                                    <div key={app.id} className="pb-4 border-b border-slate-100 last:border-0">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                                {(app.volunteer_name || app.volunteer_email || 'V').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{app.volunteer_name || 'Volunteer'}</p>
                                                <p className="text-xs text-slate-500 truncate">{app.volunteer_email || 'No email available'}</p>
                                                <p className="text-xs text-slate-500 mt-1">Applied for {app.opportunity_title}</p>
                                            </div>
                                            <Badge variant={app.status === 'pending' ? 'warning' : app.status === 'accepted' ? 'success' : 'danger'}>
                                                {app.status}
                                            </Badge>
                                        </div>

                                        <div className="mt-2 ml-12 space-y-2">
                                            {app.volunteer_location && (
                                                <p className="text-xs text-slate-600">
                                                    <span className="font-medium">Location:</span> {app.volunteer_location}
                                                </p>
                                            )}
                                            {app.volunteer_bio && (
                                                <p className="text-xs text-slate-600 line-clamp-2">
                                                    <span className="font-medium">Bio:</span> {app.volunteer_bio}
                                                </p>
                                            )}
                                            {!!app.volunteer_skills?.length && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {app.volunteer_skills.slice(0, 4).map((skill) => (
                                                        <Badge key={`${app.id}-${skill}`} variant="secondary">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            {app.cover_letter && (
                                                <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md p-2">
                                                    <span className="font-semibold">Cover Letter:</span> {app.cover_letter}
                                                </p>
                                            )}
                                            {app.relevant_experience && (
                                                <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md p-2">
                                                    <span className="font-semibold">Relevant Experience:</span> {app.relevant_experience}
                                                </p>
                                            )}
                                            {app.availability && (
                                                <p className="text-xs text-slate-700">
                                                    <span className="font-medium">Availability:</span> {app.availability}
                                                </p>
                                            )}
                                        </div>

                                        {app.status === 'pending' && (
                                            <div className="flex items-center gap-1 mt-2 ml-12">
                                                <button
                                                    onClick={() => handleApplicationStatus(app.id, 'accepted')}
                                                    disabled={updatingAppId === app.id}
                                                    className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Accept"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleApplicationStatus(app.id, 'rejected')}
                                                    disabled={updatingAppId === app.id}
                                                    className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Reject"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    <Card title="Quick Actions" className="mt-8">
                        <div className="space-y-2">
                            <Link to="/profile" className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition flex items-center gap-2">
                                <UserIcon size={16} /> Edit NGO Profile
                            </Link>
                            <button
                                onClick={() => navigate('/volunteers')}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition flex items-center gap-2"
                            >
                                <Users size={16} /> View All Volunteers
                            </button>
                        </div>
                    </Card>
                    <div className="mt-8 space-y-8">
                        <MatchSuggestionsPanel role="ngo" onStartChat={openChat} />
                    </div>
                </div>
            </div >
        </div >
    );
};

export default NGODashboard;
