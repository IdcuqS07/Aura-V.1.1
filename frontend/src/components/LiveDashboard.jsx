import React, { useState, useEffect } from 'react';
import websocketService from '../services/websocketService';
import axios from 'axios';

const LiveDashboard = () => {
    const [stats, setStats] = useState({ total_users: 0, total_badges: 0, total_passports: 0, recent_badges_24h: 0 });
    const [blocks, setBlocks] = useState([]);
    const [txs, setTxs] = useState([]);
    const [badges, setBadges] = useState([]);
    
    useEffect(() => {
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
        
        websocketService.connect(API_URL);
        axios.get(`${API_URL}/api/monitor/stats`).then(res => setStats(res.data)).catch(console.error);
        
        websocketService.on('block', (block) => setBlocks(prev => [block, ...prev].slice(0, 5)));
        websocketService.on('transaction', (tx) => setTxs(prev => [tx, ...prev].slice(0, 10)));
        websocketService.on('badge', (badge) => {
            setBadges(prev => [badge, ...prev].slice(0, 10));
            setStats(prev => ({ ...prev, total_badges: prev.total_badges + 1 }));
        });
        websocketService.on('stats', setStats);
        
        return () => websocketService.disconnect();
    }, []);
    
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Live Dashboard</h1>
            
            <div className="grid grid-cols-4 gap-4">
                <StatCard title="Total Users" value={stats.total_users} />
                <StatCard title="Total Badges" value={stats.total_badges} />
                <StatCard title="Total Passports" value={stats.total_passports} />
                <StatCard title="24h Badges" value={stats.recent_badges_24h} />
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-bold mb-4">Recent Blocks</h2>
                <div className="space-y-2">
                    {blocks.map(block => (
                        <div key={block.hash} className="flex justify-between border-b pb-2">
                            <span>Block #{block.number}</span>
                            <span>{block.transactions} txs</span>
                            <span className="text-sm text-gray-500">
                                {new Date(block.timestamp * 1000).toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
                <div className="space-y-2">
                    {txs.map(tx => (
                        <div key={tx.hash} className="flex justify-between border-b pb-2">
                            <span className="font-mono text-sm">{tx.hash.slice(0, 10)}...</span>
                            <span className="text-sm text-gray-500">{tx.timestamp}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-bold mb-4">Recent Badges Minted</h2>
                <div className="space-y-2">
                    {badges.map((badge, idx) => (
                        <div key={idx} className="flex justify-between border-b pb-2">
                            <span className="font-mono text-sm">{badge.txHash.slice(0, 10)}...</span>
                            <span>Block #{badge.blockNumber}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value }) => (
    <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
);

export default LiveDashboard;
