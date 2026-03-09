import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Edit, Lock, Trash2, Unlock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const NGOOpportunitiesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('yours');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [yourOpportunities, setYourOpportunities] = useState([]);
    const [allOpportunities, setAllOpportunities] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [yourRes, allRes] = await Promise.all([
                    api.get('/opportunities/ngo'),
                    api.get('/opportunities/all'),
                ]);
                setYourOpportunities(yourRes.data || []);
                setAllOpportunities(allRes.data || []);
            } catch (err) {
                console.error('Error loading opportunities', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this opportunity?')) {
            return;
        }
        try {
            await api.delete(`/opportunities/${id}`);
            setYourOpportunities((prev) => prev.filter((o) => o.id !== id));
            setAllOpportunities((prev) => prev.filter((o) => o.id !== id));
            alert('Opportunity deleted successfully');
        } catch (err) {
            console.error('Error deleting opportunity', err);
            alert(err.response?.data?.detail || 'Failed to delete opportunity');
        }
    };

    const handleOpportunityStatus = async (id, status) => {
        const actionText = status === 'closed' ? 'close' : 'reopen';
        if (!window.confirm(`Are you sure you want to ${actionText} this opportunity?`)) {
            return;
        }

        try {
            await api.put(`/opportunities/${id}`, { status });
            setYourOpportunities((prev) => prev.map((opp) => (opp.id === id ? { ...opp, status } : opp)));
            setAllOpportunities((prev) => prev.map((opp) => (opp.id === id ? { ...opp, status } : opp)));
        } catch (err) {
            console.error(`Error updating opportunity to ${status}`, err);
            alert(err.response?.data?.detail || 'Failed to update opportunity status');
        }
    };

    const sourceList = activeTab === 'yours' ? yourOpportunities : allOpportunities;
    const visibleOpportunities = useMemo(
        () => sourceList.filter((opp) => statusFilter === 'all' || opp.status === statusFilter),
        [sourceList, statusFilter]
    );

    const tabCounts = {
        yours: yourOpportunities.length,
        all: allOpportunities.length,
    };

    const filterCounts = {
        all: sourceList.length,
        open: sourceList.filter((o) => o.status === 'open').length,
        closed: sourceList.filter((o) => o.status === 'closed').length,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Opportunities</h1>
                    <p className="text-sm text-slate-500 mt-1">Switch between your opportunities and all NGO opportunities.</p>
                </div>
                <Link
                    to="/ngo-dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-100"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>
            </div>

            <Card>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="inline-flex bg-slate-100 rounded-lg p-1 gap-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('yours')}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition ${activeTab === 'yours' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
                        >
                            Your Opportunities ({tabCounts.yours})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
                        >
                            All Opportunities ({tabCounts.all})
                        </button>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                        {[
                            { id: 'all', label: 'All', count: filterCounts.all },
                            { id: 'open', label: 'Open', count: filterCounts.open },
                            { id: 'closed', label: 'Closed', count: filterCounts.closed },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setStatusFilter(tab.id)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${statusFilter === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {tab.label}
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="mt-6">
                {loading ? (
                    <Card>
                        <p className="text-sm text-slate-500">Loading...</p>
                    </Card>
                ) : visibleOpportunities.length === 0 ? (
                    <Card>
                        <p className="text-sm text-slate-500 text-center py-8">No opportunities found for this view.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {visibleOpportunities.map((opp) => {
                            const isOwner = opp.ngo_id === user?.id;
                            return (
                                <Card key={opp.id}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-slate-800">{opp.title}</h4>
                                            <p className="text-sm text-slate-500">{opp.location || 'Location not set'} • {opp.duration || 'Duration not set'}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                NGO: {opp.organization_name || opp.ngo_name || 'Unknown NGO'}
                                                {isOwner ? ' (You)' : ''}
                                            </p>
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {(opp.required_skills || []).slice(0, 5).map((skill) => (
                                                    <Badge key={`${opp.id}-${skill}`} variant="secondary">{skill}</Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge variant={opp.status === 'open' ? 'success' : 'danger'}>
                                                {opp.status.toUpperCase()}
                                            </Badge>

                                            {isOwner && (
                                                <div className="flex items-center gap-1 ml-1">
                                                    {opp.status === 'open' ? (
                                                        <button
                                                            onClick={() => handleOpportunityStatus(opp.id, 'closed')}
                                                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                            title="Close Opportunity"
                                                        >
                                                            <Lock size={18} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleOpportunityStatus(opp.id, 'open')}
                                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                            title="Reopen Opportunity"
                                                        >
                                                            <Unlock size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => navigate(`/edit-opportunity/${opp.id}`)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(opp.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NGOOpportunitiesPage;
