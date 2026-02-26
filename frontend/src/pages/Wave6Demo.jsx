import React, { useState } from 'react';
import { Network, CheckCircle, ExternalLink, Layers, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const CHAINS = [
  {
    name: 'Polygon Amoy',
    chainId: 80002,
    icon: '⬡',
    color: 'bg-purple-500',
    contract: '0x60741D73B27B17506525aFC9563D9Da7edffEDFD',
    explorer: 'https://amoy.polygonscan.com',
    status: 'connected'
  },
  {
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    icon: '◆',
    color: 'bg-blue-500',
    contract: '0xFcf0eA6A3cd1C5A5c26bdD5F5A3Cd28659094844',
    explorer: 'https://sepolia.etherscan.io',
    status: 'connected'
  },
  {
    name: 'BSC Testnet',
    chainId: 97,
    icon: '◉',
    color: 'bg-yellow-500',
    contract: '0x84E0e7Ba2CAD4386016d19ebfB4a7F12fBB58248',
    explorer: 'https://testnet.bscscan.com',
    status: 'connected'
  },
  {
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    icon: '◭',
    color: 'bg-cyan-500',
    contract: '0xb697a2D5F57718c26D55cBC7bE4A5b380465bB0f',
    explorer: 'https://sepolia.arbiscan.io',
    status: 'connected'
  },
  {
    name: 'Optimism Sepolia',
    chainId: 11155420,
    icon: '◈',
    color: 'bg-red-500',
    contract: '0xb697a2D5F57718c26D55cBC7bE4A5b380465bB0f',
    explorer: 'https://sepolia-optimism.etherscan.io',
    status: 'connected'
  }
];

const FEATURES = [
  {
    icon: <Network className="w-6 h-6" />,
    title: 'LayerZero Integration',
    description: 'Secure cross-chain messaging protocol',
    status: 'Complete'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Passport Synchronization',
    description: 'Cross-chain passport data sync',
    status: 'Complete'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Multi-Chain API',
    description: 'Single endpoint for all chains',
    status: 'Complete'
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'Unified Explorer',
    description: 'Cross-chain transactions & status',
    status: 'Complete'
  }
];

const Wave6Demo = () => {
  const [selectedChain, setSelectedChain] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-4">
            <Network className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium">Wave 6: Cross-Chain Foundation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Multi-Chain Infrastructure
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            5 blockchain networks connected via LayerZero for seamless cross-chain passport synchronization
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-cyan-400 mb-2">5</p>
              <p className="text-gray-400">Chains Connected</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-purple-400 mb-2">20</p>
              <p className="text-gray-400">Total Contracts</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-green-400 mb-2">100%</p>
              <p className="text-gray-400">Deployment Success</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-yellow-400 mb-2">4</p>
              <p className="text-gray-400">API Endpoints</p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {FEATURES.map((feature, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 hover:border-cyan-500 transition">
              <CardContent className="p-6">
                <div className="text-cyan-400 mb-3">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{feature.description}</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">{feature.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chains */}
        <Card className="bg-gray-900/50 border-gray-800 mb-12">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-cyan-400" />
              CrossChainPassport Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHAINS.map((chain, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedChain(chain)}
                  className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-cyan-500 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{chain.icon}</span>
                      <span className="text-white font-semibold">{chain.name}</span>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-400">Chain ID</p>
                      <p className="text-white font-mono">{chain.chainId}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400">Contract</p>
                      <p className="text-cyan-400 font-mono text-xs truncate">
                        {chain.contract}
                      </p>
                    </div>
                    
                    <a
                      href={`${chain.explorer}/address/${chain.contract}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Explorer
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">LayerZero Integration</p>
                    <p className="text-gray-400 text-sm">Secure cross-chain messaging protocol</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Passport Synchronization</p>
                    <p className="text-gray-400 text-sm">Real-time cross-chain data sync</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">State Consistency</p>
                    <p className="text-gray-400 text-sm">Timestamp-based conflict resolution</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Fee Estimation</p>
                    <p className="text-gray-400 text-sm">Real-time LayerZero cost calculation</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-cyan-400 font-mono text-sm mb-1">GET /api/multichain/chains</p>
                  <p className="text-gray-400 text-xs">List all supported chains</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-cyan-400 font-mono text-sm mb-1">GET /api/multichain/passport/:wallet</p>
                  <p className="text-gray-400 text-xs">Aggregate passport data</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-cyan-400 font-mono text-sm mb-1">GET /api/multichain/sync-status/:wallet</p>
                  <p className="text-gray-400 text-xs">Check sync status</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-cyan-400 font-mono text-sm mb-1">POST /api/multichain/estimate-sync-fee</p>
                  <p className="text-gray-400 text-xs">Estimate LayerZero fees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wave6Demo;
