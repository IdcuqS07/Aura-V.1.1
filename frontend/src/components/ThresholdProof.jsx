import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const ThresholdProof = () => {
    const [formData, setFormData] = useState({
        wallet_address: '',
        github_verified: false,
        twitter_verified: false,
        wallet_age_days: 0,
        transaction_count: 0,
        threshold: 50
    });
    const [score, setScore] = useState(null);
    const [proof, setProof] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

    const calculateScore = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                github_verified: formData.github_verified,
                twitter_verified: formData.twitter_verified,
                wallet_age_days: formData.wallet_age_days,
                transaction_count: formData.transaction_count
            });
            const res = await axios.get(`${API_URL}/api/threshold/score/${formData.wallet_address}?${params}`);
            setScore(res.data);
        } catch (error) {
            console.error('Error calculating score:', error);
        }
        setLoading(false);
    };

    const generateProof = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/threshold/generate`, formData);
            setProof(res.data);
        } catch (error) {
            console.error('Error generating proof:', error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen pt-20 px-4 py-8 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">ZK Threshold Proof</h1>
                    <p className="text-gray-400">Prove your score ≥ threshold without revealing the actual score</p>
                </div>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">User Credentials</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Wallet Address"
                            value={formData.wallet_address}
                            onChange={(e) => setFormData({...formData, wallet_address: e.target.value})}
                            className="bg-white/10 border-white/20 text-white"
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center space-x-2 text-white cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.github_verified}
                                    onChange={(e) => setFormData({...formData, github_verified: e.target.checked})}
                                    className="w-4 h-4"
                                />
                                <span>GitHub Verified (30 pts)</span>
                            </label>
                            
                            <label className="flex items-center space-x-2 text-white cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.twitter_verified}
                                    onChange={(e) => setFormData({...formData, twitter_verified: e.target.checked})}
                                    className="w-4 h-4"
                                />
                                <span>Twitter Verified (20 pts)</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-white text-sm mb-2 block">Wallet Age (days)</label>
                                <Input
                                    type="number"
                                    value={formData.wallet_age_days}
                                    onChange={(e) => setFormData({...formData, wallet_age_days: parseInt(e.target.value) || 0})}
                                    className="bg-white/10 border-white/20 text-white"
                                />
                            </div>
                            
                            <div>
                                <label className="text-white text-sm mb-2 block">Transaction Count</label>
                                <Input
                                    type="number"
                                    value={formData.transaction_count}
                                    onChange={(e) => setFormData({...formData, transaction_count: parseInt(e.target.value) || 0})}
                                    className="bg-white/10 border-white/20 text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-white text-sm mb-2 block">Threshold Score</label>
                            <Input
                                type="number"
                                value={formData.threshold}
                                onChange={(e) => setFormData({...formData, threshold: parseInt(e.target.value) || 50})}
                                className="bg-white/10 border-white/20 text-white"
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button onClick={calculateScore} disabled={loading} className="flex-1">
                                Calculate Score
                            </Button>
                            <Button onClick={generateProof} disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700">
                                Generate ZK Proof
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {score && (
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Score Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center mb-6">
                                <div className="text-5xl font-bold text-purple-400">{score.total_score}</div>
                                <div className="text-gray-400">out of {score.max_score}</div>
                            </div>
                            
                            <div className="space-y-3">
                                {Object.entries(score.breakdown).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                        <span className="text-white capitalize">{key.replace('_', ' ')}</span>
                                        <Badge variant="secondary">{value} pts</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {proof && (
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                {proof.is_valid ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                                ZK Proof Result
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className={`p-4 rounded-lg ${proof.is_valid ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                <div className="text-white font-semibold">{proof.message}</div>
                                <div className="text-sm text-gray-300 mt-1">
                                    Threshold: {proof.threshold} points
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div>
                                    <div className="text-gray-400 text-sm">Proof Hash</div>
                                    <div className="text-white font-mono text-xs break-all">{proof.proof_hash}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Nullifier</div>
                                    <div className="text-white font-mono text-xs break-all">{proof.nullifier}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ThresholdProof;
