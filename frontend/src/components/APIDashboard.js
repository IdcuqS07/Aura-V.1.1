import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Key, Copy, Check, TrendingUp, Clock, DollarSign, Zap } from 'lucide-react';
import { useWallet } from './WalletContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:9000' : 'https://www.aurapass.xyz');

const API = `${BACKEND_URL}/api`;

const APIDashboard = () => {
  const { address, isConnected } = useWallet();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTier, setSelectedTier] = useState('free');
  const [copiedKey, setCopiedKey] = useState('');

  const tiers = [
    {
      name: 'Free',
      value: 'free',
      price: '$0',
      requests: '100/day',
      features: ['Basic API access', 'Community support', 'Public documentation'],
      color: 'from-gray-600 to-gray-700'
    },
    {
      name: 'Pro',
      value: 'pro',
      price: '$29/mo',
      requests: '1,000/day',
      features: ['Priority support', 'Advanced analytics', 'Webhook notifications'],
      color: 'from-purple-600 to-blue-600',
      popular: true
    },
    {
      name: 'Enterprise',
      value: 'enterprise',
      price: '$199/mo',
      requests: '10,000/day',
      features: ['Dedicated support', 'Custom integration', 'SLA guarantee'],
      color: 'from-yellow-600 to-orange-600'
    }
  ];

  useEffect(() => {
    if (isConnected && address) {
      loadAPIKeys();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/api-keys`);
      // Extract api_keys array from response
      const keys = response.data?.api_keys || response.data || [];
      setApiKeys(Array.isArray(keys) ? keys : []);
    } catch (error) {
      console.error('Load API keys error:', error);
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!address) return;
    
    try {
      setCreating(true);
      const response = await axios.post(`${API}/api-keys`, {
        tier: selectedTier,
        user_id: address
      });
      
      if (response.data.api_key) {
        alert(`API Key generated!\n\nKey: ${response.data.api_key}\n\nSave this key securely. You won't be able to see it again.`);
        loadAPIKeys();
      }
    } catch (error) {
      alert('Failed to generate API key: ' + (error.response?.data?.detail || error.message));
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const getTierInfo = (tier) => {
    return tiers.find(t => t.value === tier) || tiers[0];
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-16 px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Key className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Connect Wallet</h1>
          <p className="text-gray-400">Please connect your wallet to access the API Dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">API Dashboard</h1>
          <p className="text-gray-400">Manage your Proof-as-a-Service API keys</p>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.value}
                className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedTier === tier.value
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
                onClick={() => setSelectedTier(tier.value)}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full">
                      POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-white mb-2">{tier.price}</div>
                  <div className="text-purple-400 font-medium">{tier.requests}</div>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-300 text-sm">
                      <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTier(tier.value);
                  }}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    selectedTier === tier.value
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {selectedTier === tier.value ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleGenerateKey}
              disabled={creating}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
            >
              {creating ? 'Generating...' : `Generate ${getTierInfo(selectedTier).name} API Key`}
            </button>
          </div>
        </div>

        {/* API Keys List */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Your API Keys</h2>
          
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No API keys yet. Generate one above to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => {
                const tierInfo = getTierInfo(key.tier);
                const usagePercent = (key.requests_used / key.rate_limit) * 100;
                
                return (
                  <div
                    key={key.api_key}
                    className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 bg-gradient-to-r ${tierInfo.color} text-white text-xs font-bold rounded-full`}>
                            {tierInfo.name.toUpperCase()}
                          </span>
                          {key.is_active ? (
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <code className="text-sm text-purple-400 font-mono bg-slate-900/50 px-3 py-1 rounded">
                            {key.api_key}
                          </code>
                          <button
                            onClick={() => copyToClipboard(key.api_key)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            {copiedKey === key.api_key ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>

                        <div className="text-xs text-gray-500">
                          Created: {new Date(key.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="p-3 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center text-gray-400 text-xs mb-1">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Requests Used
                        </div>
                        <div className="text-xl font-bold text-white">
                          {key.requests_used.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center text-gray-400 text-xs mb-1">
                          <Zap className="w-4 h-4 mr-1" />
                          Rate Limit
                        </div>
                        <div className="text-xl font-bold text-white">
                          {key.rate_limit.toLocaleString()}/day
                        </div>
                      </div>
                      
                      <div className="p-3 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center text-gray-400 text-xs mb-1">
                          <Clock className="w-4 h-4 mr-1" />
                          Remaining
                        </div>
                        <div className="text-xl font-bold text-white">
                          {(key.rate_limit - key.requests_used).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Usage Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Usage</span>
                        <span>{usagePercent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            usagePercent >= 90
                              ? 'bg-red-500'
                              : usagePercent >= 70
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Documentation Links */}
        <div className="p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-2xl border border-purple-500/30">
          <h3 className="text-xl font-bold text-white mb-4">📚 Developer Resources</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/api-docs"
              className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="text-purple-400 font-medium mb-1">API Documentation</div>
              <div className="text-sm text-gray-400">Complete API reference</div>
            </a>
            <a
              href="/integration-guide"
              className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="text-blue-400 font-medium mb-1">Integration Guide</div>
              <div className="text-sm text-gray-400">Quick start & examples</div>
            </a>
            <a
              href="/code-examples"
              className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="text-green-400 font-medium mb-1">Code Examples</div>
              <div className="text-sm text-gray-400">JS, Python, Solidity</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDashboard;
