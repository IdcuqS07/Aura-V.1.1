import React from 'react';
import { useWallet } from '../components/WalletContext';
import DeFiPositions from '../components/DeFiPositions';
import RealtimeAnalytics from '../components/RealtimeAnalytics';
import { Shield, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { address, isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-16 px-4 py-8">
        <div className="max-w-6xl mx-auto text-center py-20">
          <Shield className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Connect Wallet</h1>
          <p className="text-gray-400">Connect your wallet to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Your complete DeFi portfolio and analytics</p>
        </div>

        {/* Real-time Analytics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Protocol Analytics
          </h2>
          <RealtimeAnalytics />
        </div>

        {/* DeFi Positions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Your DeFi Positions</h2>
          <DeFiPositions walletAddress={address} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
