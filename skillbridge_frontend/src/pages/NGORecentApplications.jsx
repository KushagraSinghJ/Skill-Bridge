import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const NGORecentApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingAppId, setUpdatingAppId] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const appsRes = await api.get('/applications/ngo');
                setApplications(appsRes.data);
            } catch (err) {
                console.error('Error fetching applications', err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const handleApplicationStatus = async (applicationId, status) => {
        setUpdatingAppId(applicationId);
        try {
            await api.patch(`/applications/${applicationId}/status`, { status });
            setApplications((prev) =>
                prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
            );
        } catch (err) {
            console.error(`Error updating application to ${status}`, err);
            alert(err.response?.data?.detail || 'Failed to update application status');
        } finally {
            setUpdatingAppId(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Recent Applications</h1>
                    <p className="text-slate-500 mt-1">Review all volunteer applications in one place.</p>
                </div>
                <Link
                    to="/ngo-dashboard"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>
            </div>

            <Card title="All Recent Applications">
                {loading ? (
                    <p className="text-sm text-slate-500">Loading...</p>
                ) : applications.length === 0 ? (
                    <p className="text-sm text-slate-500 italic text-center py-4">No applications yet.</p>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
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
                                            {app.volunteer_skills.slice(0, 6).map((skill) => (
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
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default NGORecentApplications;
