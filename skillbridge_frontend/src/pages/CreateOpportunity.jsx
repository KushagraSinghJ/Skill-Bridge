import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Save } from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';

const CreateOpportunity = () => {
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
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        try {
            await api.post('/opportunities', { ...formData, required_skills: skills });
            navigate('/ngo-dashboard');
        } catch (err) {
            console.error('Error creating opportunity', err);
            alert('Failed to create opportunity');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Create Opportunity</h1>
                <p className="text-slate-500 mt-2">Publish a new volunteering role for your organization.</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Opportunity Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            placeholder="e.g. Frontend Developer for Education App"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Description</label>
                        <textarea
                            name="description"
                            required
                            rows="5"
                            placeholder="Describe the role, impact, and expectations..."
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Duration</label>
                            <input
                                type="text"
                                name="duration"
                                placeholder="e.g. 3 months, Ongoing"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Location</label>
                            <input
                                type="text"
                                name="location"
                                placeholder="e.g. Remote, Delhi, India"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Required Skills</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={skillInput}
                                placeholder="Add a skill..."
                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                className="bg-slate-100 p-3 rounded-lg text-slate-600 hover:bg-slate-200 transition"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {skills.map(skill => (
                                <span key={skill} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100 flex items-center gap-2">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Status</label>
                        <select
                            name="status"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-white"
                            onChange={handleChange}
                            defaultValue="open"
                        >
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/ngo-dashboard')}
                            className="flex-1 px-6 py-3 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex justify-center items-center gap-2 bg-blue-600 px-6 py-3 rounded-lg text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? 'Creating...' : 'Create Opportunity'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateOpportunity;
