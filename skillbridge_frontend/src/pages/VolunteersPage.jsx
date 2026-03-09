import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, MapPin, MessageSquare, Search, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import api from '../services/api';

const VolunteersPage = () => {
    const navigate = useNavigate();
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadVolunteers = async () => {
            try {
                const res = await api.get('/users/volunteers?limit=200');
                setVolunteers(res.data || []);
            } catch (err) {
                console.error('Error loading volunteers', err);
            } finally {
                setLoading(false);
            }
        };
        loadVolunteers();
    }, []);

    const filteredVolunteers = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return volunteers;
        return volunteers.filter((volunteer) => {
            const name = (volunteer.name || '').toLowerCase();
            const email = (volunteer.email || '').toLowerCase();
            const location = (volunteer.location || '').toLowerCase();
            const skills = (volunteer.skills || []).join(' ').toLowerCase();
            return (
                name.includes(q) ||
                email.includes(q) ||
                location.includes(q) ||
                skills.includes(q)
            );
        });
    }, [volunteers, searchTerm]);

    const openChatWithVolunteer = (volunteer) => {
        navigate('/messages', {
            state: {
                partner: {
                    id: volunteer.id,
                    name: volunteer.name || 'Volunteer',
                },
            },
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">All Volunteers</h1>
                    <p className="text-sm text-slate-500 mt-1">Browse volunteer profiles and start conversations.</p>
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
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, location, or skill"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-md border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </Card>

            <div className="mt-6">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 size={26} className="animate-spin text-blue-600" />
                    </div>
                ) : filteredVolunteers.length === 0 ? (
                    <Card>
                        <p className="text-sm text-slate-500 text-center py-8">No volunteers found.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredVolunteers.map((volunteer) => (
                            <Card key={volunteer.id} className="h-full">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                            {(volunteer.name || 'V').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">{volunteer.name || 'Volunteer'}</p>
                                            <p className="text-xs text-slate-500 truncate">{volunteer.email || 'No email'}</p>
                                        </div>
                                    </div>
                                    <UserRound size={16} className="text-slate-300" />
                                </div>

                                <div className="mt-3 text-xs text-slate-600 inline-flex items-center gap-1">
                                    <MapPin size={12} />
                                    {volunteer.location || 'Location not set'}
                                </div>

                                <p className="mt-3 text-xs text-slate-600 line-clamp-3">
                                    {volunteer.bio || 'No bio provided.'}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {(volunteer.skills || []).slice(0, 6).map((skill) => (
                                        <Badge key={`${volunteer.id}-${skill}`} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => openChatWithVolunteer(volunteer)}
                                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                                >
                                    <MessageSquare size={14} />
                                    Message
                                </button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteersPage;
