import React, { useState, useEffect } from 'react';
import { Network, Activity, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://api.aurapass.xyz';

const CHAINS = {
  polygon_amoy: { name: 'Polygon Amoy', color: 'bg-purple-500', icon: '⬡' },
  ethereum_sepolia: { name: 'Ethereum Sepolia', color: 'bg-blue-500', icon: '◆' },
  bsc_testnet: { name: 'BSC Testnet', color: 'bg-yellow-500', icon: '◉' },
  arbitrum_sepolia: { name: 'Arbitrum Sepolia', color: 'bg-cyan-500', icon: '◭' },
  optimism_sepolia: { name: 'Optimism Sepolia', color: 'bg-red-500', icon: '◈' }
};

const CrossChainExplorer = ({ walletAddress }) => {
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedChain, setSelectedChain] = useState('all');

  useEffect(() => {
    if (walletAddress) {
      fetchMultiChainData();
    }
  }, [walletAddress]);

  const fetchMultiChainData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/multichain/passport/${walletAddress}`
      );
      const data = await response.json();
      setPassportData(data);
    } catch (error) {
      console.error('Failed to fetch multi-chain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (isActive) => {
    return isActive ? (
      <CheckCircle className="w-5 h-5 text-green-400" />
    ) : (
      <XCircle className="w-5 h-5 text-red-400" />
    );
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-5 h-5 animate-spin text-cyan-400" />
            <span className="text-gray-400">Loading cross-chain data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!passportData) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <p className="text-gray-400 text-center">
            Connect wallet to view cross-chain passport data
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredChains = selectedChain === 'all' 
    ? passportData.chains 
    : passportData.chains.filter(c => c.chain === selectedChain);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Network className="w-6 h-6 text-cyan-400" />
            Cross-Chain Passport Explorer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Total Chains</p>
              <p className="text-2xl font-bold text-white">{passportData.total_chains}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Most Recent Score</p>
              <p className="text-2xl font-bold text-cyan-400">
                {passportData.most_recent?.credit_score || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Last Updated</p>
              <p className="text-sm font-medium text-white">
                {passportData.most_recent 
                  ? formatTimestamp(passportData.most_recent.last_updated)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chain Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedChain('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            selectedChain === 'all'
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All Chains
        </button>
        {Object.entries(CHAINS).map(([key, chain]) => (
          <button
            key={key}
            onClick={() => setSelectedChain(key)}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              selectedChain === key
                ? `${chain.color} text-white`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span>{chain.icon}</span>
            {chain.name}
          </button>
        ))}
      </div>

      {/* Chain Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChains.map((chainData, index) => {
          const chainInfo = CHAINS[chainData.chain];
          return (
            <Card key={index} className="bg-gray-900 border-gray-800 hover:border-cyan-500 transition">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{chainInfo.icon}</span>
                    <span className="text-white text-lg">{chainInfo.name}</span>
                  </div>
                  {getStatusIcon(chainData.is_active)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Credit Score</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {chainData.credit_score}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Chain ID</p>
                  <p className="text-white font-mono">{chainData.chain_id}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Last Updated</p>
                  <p className="text-white text-sm">
                    {formatTimestamp(chainData.last_updated)}
                  </p>
                </div>
                
                <a
                  href={`${chainData.explorer}/address/${chainData.owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Explorer
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sync Status */}
      {passportData.chains.length > 1 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-cyan-400" />
              Synchronization Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {passportData.chains.map((chain, index) => {
                const isSynced = chain.credit_score === passportData.most_recent?.credit_score;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{CHAINS[chain.chain].icon}</span>
                      <span className="text-white">{CHAINS[chain.chain].name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSynced ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-green-400 text-sm">Synced</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 text-yellow-400" />
                          <span className="text-yellow-400 text-sm">Out of Sync</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CrossChainExplorer;
