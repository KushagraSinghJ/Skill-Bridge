import React, { useEffect, useState } from 'react';
import { Award, Loader2, LogOut, MapPin, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import MatchSuggestionsPanel from '../components/MatchSuggestionsPanel';
import NotificationCenter from '../components/NotificationCenter';

const VolunteerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [impactStats, setImpactStats] = useState({
        applications: 0,
        accepted: 0,
        pending: 0,
        skillsCount: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [recommendedMatches, setRecommendedMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const openChat = (partner = null) => {
        navigate('/messages', partner ? { state: { partner } } : undefined);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, appsRes, matchesRes] = await Promise.all([
                    api.get('/users/stats'),
                    api.get('/applications/my'),
                    api.get('/matches/suggestions?limit=3'),
                ]);
                setImpactStats(statsRes.data);
                setRecentActivity(appsRes.data.slice(0, 5));
                setRecommendedMatches(matchesRes.data || []);
            } catch (err) {
                console.error('Error fetching dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 bg-slate-50 min-h-screen">
            <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Volunteer Dashboard</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">Track progress, view matches, and chat in real-time.</p>
                </div>
                <button
                    onClick={() => {
                        logout();
                        navigate('/');
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
                <button
                    onClick={() => openChat()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                    <MessageSquare size={18} />
                    <span>Messages</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <Card className="text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center text-blue-600 font-bold text-2xl">
                            {user?.name?.charAt(0) || 'V'}
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{user?.name || 'Volunteer'}</h2>
                        <p className="text-slate-500 flex items-center justify-center gap-1 mt-1 text-sm">
                            <MapPin size={14} /> {user?.location || 'Location not set'}
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {user?.skills?.length > 0 ? (
                                user.skills.map((skill) => <Badge key={skill} variant="primary">{skill}</Badge>)
                            ) : (
                                <p className="text-xs text-slate-400 italic">Add skills to improve matching.</p>
                            )}
                        </div>
                        <Link
                            to="/profile"
                            className="block w-full mt-6 bg-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-900 transition font-medium"
                        >
                            Edit Profile
                        </Link>
                    </Card>

                    <Card title="Your Impact">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-xl font-bold text-blue-700">{impactStats.applications}</p>
                                <p className="text-xs font-semibold text-blue-600 mt-1">Applications</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                <p className="text-xl font-bold text-emerald-700">{impactStats.accepted}</p>
                                <p className="text-xs font-semibold text-emerald-600 mt-1">Accepted</p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <p className="text-xl font-bold text-amber-700">{impactStats.pending}</p>
                                <p className="text-xs font-semibold text-amber-600 mt-1">Pending</p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                <p className="text-xl font-bold text-indigo-700">{impactStats.skillsCount}</p>
                                <p className="text-xs font-semibold text-indigo-600 mt-1">Skills</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card title="Recommended Opportunities">
                        {recommendedMatches.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No recommended opportunities right now.</p>
                        ) : (
                            <div className="space-y-3">
                                {recommendedMatches.map((match) => (
                                    <div key={match.opportunity_id} className="border border-slate-200 rounded-lg p-3 bg-white">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{match.opportunity_title}</p>
                                                <p className="text-xs text-slate-500">{match.ngo_name} • {match.location || 'Unknown'}</p>
                                            </div>
                                            <Badge variant="primary">Score {match.score}</Badge>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {(match.matching_skills || []).slice(0, 4).map((skill) => (
                                                <Badge key={`${match.opportunity_id}-${skill}`} variant="secondary">{skill}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link
                            to="/opportunities"
                            className="inline-block mt-4 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                        >
                            Browse All Opportunities
                        </Link>
                    </Card>

                    <Card title="Recent Activity">
                        <div className="space-y-4">
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-slate-500 italic text-center py-3">No recent activity.</p>
                            ) : (
                                recentActivity.map((app) => (
                                    <div key={app.id} className="flex gap-3 items-start">
                                        <div className={`p-2 rounded-lg ${
                                            app.status === 'accepted'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : app.status === 'rejected'
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            <Award size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {app.opportunity_title} - <span className="capitalize">{app.status}</span>
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(app.applied_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <NotificationCenter />
                        <MatchSuggestionsPanel role="volunteer" onStartChat={openChat} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
