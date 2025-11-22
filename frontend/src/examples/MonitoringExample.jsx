import React, { useState, useEffect } from 'react';
import websocketService from '../services/websocketService';

/**
 * Minimal example of real-time monitoring integration
 */
const MonitoringExample = () => {
    const [connected, setConnected] = useState(false);
    const [latestBlock, setLatestBlock] = useState(null);
    const [badgeCount, setBadgeCount] = useState(0);

    useEffect(() => {
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
        
        websocketService.connect(API_URL);
        setConnected(true);

        websocketService.on('block', (block) => setLatestBlock(block));
        websocketService.on('badge', (badge) => {
            setBadgeCount(prev => prev + 1);
            console.log('Badge minted:', badge);
        });

        return () => {
            websocketService.disconnect();
            setConnected(false);
        };
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Real-time Monitoring</h2>
            
            <div className="mb-4">
                <span className={`px-2 py-1 rounded ${connected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {connected ? '🟢 Connected' : '🔴 Disconnected'}
                </span>
            </div>

            {latestBlock && (
                <div className="bg-white p-4 rounded shadow mb-4">
                    <h3 className="font-bold">Latest Block</h3>
                    <p>Block #{latestBlock.number}</p>
                    <p className="text-sm text-gray-500">{latestBlock.transactions} transactions</p>
                </div>
            )}

            <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">Badges Minted</h3>
                <p className="text-3xl">{badgeCount}</p>
            </div>
        </div>
    );
};

export default MonitoringExample;
