import React, { useState, useEffect } from 'react';
import websocketService from '../services/websocketService';
import axios from 'axios';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Activity, Users, Award, FileText, TrendingUp, Zap } from 'lucide-react';

const EnhancedLiveDashboard = () => {
    const [stats, setStats] = useState({ total_users: 0, total_badges: 0, total_passports: 0, recent_badges_24h: 0 });
    const [blocks, setBlocks] = useState([]);
    const [txs, setTxs] = useState([]);
    const [badges, setBadges] = useState([]);
    const [blockHistory, setBlockHistory] = useState([]);
    const [txHistory, setTxHistory] = useState([]);
    const [connected, setConnected] = useState(false);
    
    useEffect(() => {
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
        
        websocketService.connect(API_URL);
        setConnected(true);
        
        axios.get(`${API_URL}/api/monitor/stats`).then(res => setStats(res.data)).catch(console.error);
        
        websocketService.on('block', (block) => {
            setBlocks(prev => [block, ...prev].slice(0, 10));
            setBlockHistory(prev => [...prev, { time: new Date().toLocaleTimeString(), txs: block.transactions, gas: block.gasUsed }].slice(-20));
        });
        
        websocketService.on('transaction', (tx) => {
            setTxs(prev => [tx, ...prev].slice(0, 15));
            setTxHistory(prev => [...prev, { time: new Date().toLocaleTimeString(), count: 1 }].slice(-20));
        });
        
        websocketService.on('badge', (badge) => {
            setBadges(prev => [badge, ...prev].slice(0, 10));
            setStats(prev => ({ ...prev, total_badges: prev.total_badges + 1, recent_badges_24h: prev.recent_badges_24h + 1 }));
        });
        
        websocketService.on('stats', setStats);
        
        return () => websocketService.disconnect();
    }, []);
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Live Monitoring Dashboard
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-sm text-gray-600">{connected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Users} title="Total Users" value={stats.total_users} color="blue" />
                    <StatCard icon={Award} title="Total Badges" value={stats.total_badges} color="purple" />
                    <StatCard icon={FileText} title="Passports" value={stats.total_passports} color="green" />
                    <StatCard icon={TrendingUp} title="24h Badges" value={stats.recent_badges_24h} color="orange" trend="+12%" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Block Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={blockHistory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="txs" stroke="#3b82f6" fill="#93c5fd" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5" />
                                Gas Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={blockHistory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="gas" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Blocks</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {blocks.map(block => (
                                <div key={block.hash} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div>
                                        <div className="font-semibold text-sm">Block #{block.number}</div>
                                        <div className="text-xs text-gray-500">{block.transactions} transactions</div>
                                    </div>
                                    <Badge variant="outline">{new Date(block.timestamp * 1000).toLocaleTimeString()}</Badge>
                                </div>
                            ))}
                            {blocks.length === 0 && <p className="text-center text-gray-400 py-8">Waiting for blocks...</p>}
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {txs.map(tx => (
                                <div key={tx.hash} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-mono text-xs truncate">{tx.hash}</div>
                                        <div className="text-xs text-gray-500">From: {tx.from?.slice(0, 10)}...</div>
                                    </div>
                                    <Badge variant="secondary" className="ml-2">TX</Badge>
                                </div>
                            ))}
                            {txs.length === 0 && <p className="text-center text-gray-400 py-8">Waiting for transactions...</p>}
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Badge Minting</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {badges.map((badge, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:from-purple-100 hover:to-blue-100 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-mono text-xs truncate">{badge.txHash}</div>
                                        <div className="text-xs text-gray-500">Block #{badge.blockNumber}</div>
                                    </div>
                                    <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500">Minted</Badge>
                                </div>
                            ))}
                            {badges.length === 0 && <p className="text-center text-gray-400 py-8">Waiting for badges...</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, title, value, color, trend }) => {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        green: 'from-green-500 to-green-600',
        orange: 'from-orange-500 to-orange-600'
    };
    
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">{title}</p>
                        <p className="text-3xl font-bold">{value.toLocaleString()}</p>
                        {trend && <p className="text-sm text-green-600 mt-1">{trend}</p>}
                    </div>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default EnhancedLiveDashboard;
