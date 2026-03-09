import React, { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, Clock, Briefcase, Loader2, CheckCircle, X } from 'lucide-react';

import api from '../services/api';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';

const initialApplicationForm = {
    cover_letter: '',
    relevant_experience: '',
    availability: '',
};

const BrowseOpportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [applicationStatusByOpportunity, setApplicationStatusByOpportunity] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [durationFilter, setDurationFilter] = useState('');
    const [applying, setApplying] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [applicationForm, setApplicationForm] = useState(initialApplicationForm);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [oppsRes, appsRes] = await Promise.all([
                    api.get('/opportunities/'),
                    api.get('/applications/my'),
                ]);

                setOpportunities(oppsRes.data);
                setApplicationStatusByOpportunity(
                    appsRes.data.reduce((acc, app) => {
                        acc[app.opportunity_id] = app.status;
                        return acc;
                    }, {})
                );
            } catch (err) {
                setMessage(err.response?.data?.detail || 'Failed to load opportunities');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredOpportunities = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        const skillValue = skillFilter.trim().toLowerCase();
        const locationValue = locationFilter.trim().toLowerCase();
        const durationValue = durationFilter.trim().toLowerCase();

        return opportunities.filter((opp) => {
            const title = (opp.title || '').toLowerCase();
            const description = (opp.description || '').toLowerCase();
            const organization = (opp.organization_name || opp.ngo_name || '').toLowerCase();
            const location = (opp.location || '').toLowerCase();
            const duration = (opp.duration || '').toLowerCase();
            const skills = (opp.required_skills || []).map((s) => s.toLowerCase());

            const matchesSearch =
                !searchValue ||
                title.includes(searchValue) ||
                description.includes(searchValue) ||
                organization.includes(searchValue) ||
                skills.some((skill) => skill.includes(searchValue));

            const matchesSkill =
                !skillValue || skills.some((skill) => skill.includes(skillValue));

            const matchesLocation = !locationValue || location.includes(locationValue);
            const matchesDuration = !durationValue || duration.includes(durationValue);

            return matchesSearch && matchesSkill && matchesLocation && matchesDuration;
        });
    }, [opportunities, searchTerm, skillFilter, locationFilter, durationFilter]);

    const openApplyForm = (opportunity) => {
        setSelectedOpportunity(opportunity);
        setApplicationForm(initialApplicationForm);
        setMessage('');
    };

    const closeApplyForm = () => {
        setSelectedOpportunity(null);
        setApplicationForm(initialApplicationForm);
    };

    const handleApplicationChange = (e) => {
        const { name, value } = e.target;
        setApplicationForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitApplication = async (e) => {
        e.preventDefault();
        if (!selectedOpportunity) return;

        setApplying(true);
        setMessage('');
        try {
            await api.post('/applications/', {
                opportunity_id: selectedOpportunity.id,
                ...applicationForm,
            });
            setApplicationStatusByOpportunity((prev) => ({
                ...prev,
                [selectedOpportunity.id]: 'pending',
            }));
            closeApplyForm();
            setMessage('Application submitted successfully');
        } catch (err) {
            setMessage(err.response?.data?.detail || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSkillFilter('');
        setLocationFilter('');
        setDurationFilter('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 bg-slate-50 min-h-screen">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Available Opportunities</h1>
                <p className="text-slate-600 mt-3 text-lg">Browse and filter volunteer roles by your preferences.</p>
            </div>

            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative lg:col-span-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title, description, or skills"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <input
                    type="text"
                    placeholder="Filter by skill"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm outline-none"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                />
                <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-100 shadow-sm"
                >
                    Clear Filters
                </button>
                <input
                    type="text"
                    placeholder="Filter by location"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm outline-none"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Filter by duration"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm outline-none"
                    value={durationFilter}
                    onChange={(e) => setDurationFilter(e.target.value)}
                />
            </div>

            {message && (
                <div className="mb-6 p-4 rounded-xl text-center font-medium shadow-sm bg-white border border-slate-200">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredOpportunities.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-xl text-slate-500 font-medium">No opportunities found for these filters.</p>
                    </div>
                ) : (
                    filteredOpportunities.map((opp) => (
                        <div key={opp.id} className="group h-full">
                            <Card className="h-full flex flex-col border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="primary" className="mb-2">{opp.category || 'General'}</Badge>
                                        <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                                            <Briefcase size={20} />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{opp.title}</h3>
                                    <p className="text-blue-600 font-semibold text-sm mb-4">
                                        {opp.organization_name || opp.ngo_name || 'NGO Partner'}
                                    </p>
                                    <p className="text-slate-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                                        {opp.description}
                                    </p>

                                    <div className="space-y-2.5 mb-6">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                            <MapPin size={14} className="text-slate-400" />
                                            {opp.location || 'Location not specified'}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                            <Clock size={14} className="text-slate-400" />
                                            {opp.duration || 'Duration not specified'}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mt-auto">
                                        {(opp.required_skills || []).map((skill) => (
                                            <Badge key={skill} variant="secondary" className="text-[10px] py-0.5">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>

                                {applicationStatusByOpportunity[opp.id] ? (
                                    <button
                                        type="button"
                                        disabled
                                        className={`w-full mt-8 py-3 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2 shadow-md ${
                                            applicationStatusByOpportunity[opp.id] === 'accepted'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : applicationStatusByOpportunity[opp.id] === 'rejected'
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : 'bg-amber-100 text-amber-700'
                                        }`}
                                    >
                                        <CheckCircle size={18} />
                                        {applicationStatusByOpportunity[opp.id].charAt(0).toUpperCase() + applicationStatusByOpportunity[opp.id].slice(1)}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => openApplyForm(opp)}
                                        className="w-full mt-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
                                    >
                                        Apply Now
                                    </button>
                                )}
                            </Card>
                        </div>
                    ))
                )}
            </div>

            {selectedOpportunity && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 px-4 py-8 overflow-y-auto">
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Application Form</h2>
                                <p className="text-slate-600 text-sm mt-1">{selectedOpportunity.title}</p>
                            </div>
                            <button type="button" onClick={closeApplyForm} className="p-2 rounded-lg hover:bg-slate-100">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitApplication} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Cover Letter</label>
                                <textarea
                                    name="cover_letter"
                                    rows="4"
                                    required
                                    value={applicationForm.cover_letter}
                                    onChange={handleApplicationChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Briefly explain why you are a good fit."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Relevant Experience</label>
                                <textarea
                                    name="relevant_experience"
                                    rows="3"
                                    value={applicationForm.relevant_experience}
                                    onChange={handleApplicationChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Share past work, projects, or volunteering experience."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Availability</label>
                                <input
                                    type="text"
                                    name="availability"
                                    value={applicationForm.availability}
                                    onChange={handleApplicationChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="e.g. 8-10 hrs/week, evenings only"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeApplyForm}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={applying}
                                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {applying ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrowseOpportunities;
