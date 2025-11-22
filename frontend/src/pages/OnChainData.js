import React, { useState } from 'react';
import { Database, Search, BarChart3 } from 'lucide-react';
import GraphDataDisplay from '../components/GraphDataDisplay';

const OnChainData = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [globalStats, setGlobalStats] = useState(null);

  const handleSearch = () => {
    if (searchAddress.trim()) {
      setWalletAddress(searchAddress.trim());
    }
  };

  const loadGlobalStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/graph/stats`);
      const data = await response.json();
      setGlobalStats(data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  React.useEffect(() => {
    loadGlobalStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Database className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold">On-Chain Data Explorer</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Powered by The Graph - Real-time blockchain indexing
          </p>
        </div>

        {/* Global Stats */}
        {globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Total Users</div>
              <div className="text-3xl font-bold">{globalStats.totalUsers || 0}</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Total Badges</div>
              <div className="text-3xl font-bold text-yellow-400">{globalStats.totalBadges || 0}</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Total Passports</div>
              <div className="text-3xl font-bold text-purple-400">{globalStats.totalPassports || 0}</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Avg Score</div>
              <div className="text-3xl font-bold text-green-400">{globalStats.averageScore || 0}</div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter wallet address (0x...)"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Data Display */}
        {walletAddress && (
          <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Wallet Data</h2>
              <p className="text-gray-400 font-mono text-sm">{walletAddress}</p>
            </div>
            <GraphDataDisplay walletAddress={walletAddress} />
          </div>
        )}

        {/* Info */}
        {!walletAddress && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              Enter a wallet address to view on-chain data
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnChainData;
