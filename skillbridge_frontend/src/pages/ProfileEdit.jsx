import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User, Globe, MapPin, AlignLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/common/Card';

const ProfileEdit = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        skills: user?.skills?.join(', ') || '',
        location: user?.location || '',
        bio: user?.bio || '',
        organization_name: user?.organization_name || '',
        organization_description: user?.organization_description || '',
        website_url: user?.website_url || '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToLink = {
                ...formData,
                skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
            };
            await api.put('/users/profile', dataToLink);
            // Update local storage user data
            const updatedUser = { ...user, ...dataToLink };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert('Profile updated successfully!');
            navigate(user.role === 'ngo' ? '/ngo-dashboard' : '/volunteer-dashboard');
            window.location.reload(); // Quick refresh to update context
        } catch (err) {
            console.error('Error updating profile', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
                    <User size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
                    <p className="text-slate-500 italic">Tell us more about yourself or your organization.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card title="General Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 mt-6">
                        <label className="text-sm font-semibold text-slate-700">Bio / About</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3 top-3 text-slate-400" size={18} />
                            <textarea
                                name="bio"
                                rows="4"
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                placeholder="Share your passion..."
                            ></textarea>
                        </div>
                    </div>

                    {user?.role === 'volunteer' && (
                        <div className="space-y-2 mt-6">
                            <label className="text-sm font-semibold text-slate-700">Skills (Comma separated)</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                placeholder="e.g. Photoshop, JavaScript, Teaching"
                            />
                        </div>
                    )}
                </Card>

                {user?.role === 'ngo' && (
                    <Card title="Organization Details">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Organization Name</label>
                                <input
                                    type="text"
                                    name="organization_name"
                                    value={formData.organization_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Organization Description</label>
                                <textarea
                                    name="organization_description"
                                    rows="3"
                                    value={formData.organization_description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                ></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Website URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="url"
                                        name="website_url"
                                        value={formData.website_url}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                    >
                        Go Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex justify-center items-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                    >
                        <Save size={20} />
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileEdit;
