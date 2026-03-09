import React, { useEffect, useState } from 'react';
import { Loader2, MapPin, MessageCircle, Sparkles } from 'lucide-react';

import api from '../services/api';
import Badge from './common/Badge';
import Card from './common/Card';

const MatchSuggestionsPanel = ({ role, onStartChat }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await api.get('/matches/suggestions');
                setMatches(res.data);
            } catch (err) {
                console.error('Error loading matches', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, []);

    return (
        <Card title="Match Suggestions" className="h-full">
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-blue-600" />
                </div>
            ) : matches.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-6">No strong matches right now.</p>
            ) : (
                <div className="space-y-3">
                    {matches.slice(0, 6).map((match, index) => (
                        <div key={`${match.opportunity_id || 'opp'}-${match.volunteer_id || 'vol'}-${index}`} className="p-3 rounded-lg border border-slate-200 bg-white">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">
                                        {role === 'volunteer' ? match.opportunity_title : match.volunteer_name}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {role === 'volunteer' ? (match.ngo_name || 'NGO') : `For ${match.opportunity_title}`}
                                    </p>
                                </div>
                                <Badge variant="primary">Score {match.score}</Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {(match.matching_skills || []).slice(0, 3).map((skill) => (
                                    <Badge key={`${skill}-${index}`} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                    <MapPin size={12} />
                                    {role === 'volunteer' ? (match.location || 'Unknown') : (match.volunteer_location || 'Unknown')}
                                </span>
                                {match.location_match && (
                                    <span className="inline-flex items-center gap-1 text-emerald-600">
                                        <Sparkles size={12} />
                                        Location match
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    onStartChat?.(
                                        role === 'volunteer'
                                            ? { id: match.ngo_id, name: match.ngo_name || 'NGO' }
                                            : { id: match.volunteer_id, name: match.volunteer_name || 'Volunteer' }
                                    )
                                }
                                className="mt-3 w-full py-2 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center justify-center gap-1"
                            >
                                <MessageCircle size={14} />
                                Message
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default MatchSuggestionsPanel;
