import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Plus, Save, Loader2, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';

const EditOpportunity = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        location: '',
        status: 'open',
    });
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchOpportunity = async () => {
            try {
                // Fetch all opps and find the one we need (or add a specific GET endpoint if needed)
                // For now, let's try getting it directly if the backend supports GET /{id}
                const res = await api.get('/opportunities/ngo');
                const opp = res.data.find(o => o.id === id);

                if (opp) {
                    setFormData({
                        title: opp.title,
                        description: opp.description,
                        duration: opp.duration,
                        location: opp.location,
                        status: opp.status,
                    });
                    setSkills(opp.required_skills || []);
                } else {
                    alert('Opportunity not found');
                    navigate('/ngo-dashboard');
                }
            } catch (err) {
                console.error('Error fetching opportunity', err);
                alert('Failed to load opportunity data');
                navigate('/ngo-dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchOpportunity();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addSkill = () => {
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/opportunities/${id}`, { ...formData, required_skills: skills });
            alert('Opportunity updated successfully!');
            navigate('/ngo-dashboard');
        } catch (err) {
            console.error('Error updating opportunity', err);
            alert('Failed to update opportunity');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 bg-slate-50 min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/ngo-dashboard')}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Edit Opportunity</h1>
                    <p className="text-slate-500 mt-1">Update the details for your volunteering role.</p>
                </div>
            </div>

            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Opportunity Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            placeholder="e.g. Frontend Developer for Education App"
                            className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Description</label>
                        <textarea
                            name="description"
                            required
                            rows="6"
                            value={formData.description}
                            placeholder="Describe the role, impact, and expectations..."
                            className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm resize-none"
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Duration</label>
                            <input
                                type="text"
                                name="duration"
                                value={formData.duration}
                                placeholder="e.g. 3 months, Ongoing"
                                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                placeholder="e.g. Remote, Delhi, India"
                                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Required Skills</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={skillInput}
                                placeholder="Add a skill and press Enter"
                                className="flex-1 px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm"
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                className="bg-slate-100 p-3.5 rounded-xl text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all shadow-sm"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2.5 mt-4">
                            {skills.map(skill => (
                                <span key={skill} className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-100 flex items-center gap-2 group hover:bg-blue-100 transition-colors">
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        className="text-blue-400 group-hover:text-blue-600 hover:scale-110 transition-all font-black"
                                    >
                                        <X size={16} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Work Status</label>
                        <div className="relative">
                            <select
                                name="status"
                                value={formData.status}
                                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm bg-white appearance-none cursor-pointer font-medium"
                                onChange={handleChange}
                            >
                                <option value="open">Open (Accepting Applications)</option>
                                <option value="closed">Closed (Project Finished/Full)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Plus size={20} className="rotate-45" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/ngo-dashboard')}
                            className="flex-1 px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                            Discard Changes
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 flex justify-center items-center gap-2 bg-blue-600 px-6 py-4 rounded-xl text-white font-black shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={24} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default EditOpportunity;
