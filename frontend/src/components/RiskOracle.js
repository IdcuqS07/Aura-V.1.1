import React, { useState, useEffect } from 'react';
import { Brain, TrendingDown, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWallet } from './WalletContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://159.65.134.137:9000';

const RiskOracle = () => {
  const { address, isConnected } = useWallet();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const getRiskScore = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/oracle/risk-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address })
      });
      
      const data = await response.json();
      if (data.success) {
        setPrediction(data.prediction);
      }
    } catch (error) {
      console.error('Risk score error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      getRiskScore();
    }
  }, [isConnected, address]);

  const getRiskColor = (level) => {
    const colors = {
      low: 'from-green-600 to-emerald-600',
      medium: 'from-yellow-600 to-orange-600',
      high: 'from-red-600 to-rose-600'
    };
    return colors[level] || colors.medium;
  };

  const getRiskIcon = (level) => {
    if (level === 'low') return <CheckCircle className="w-12 h-12 text-green-400" />;
    if (level === 'medium') return <AlertTriangle className="w-12 h-12 text-yellow-400" />;
    return <TrendingDown className="w-12 h-12 text-red-400" />;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-16 px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Brain className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">AI Risk Oracle</h1>
          <p className="text-gray-400">Connect wallet to get AI-powered risk assessment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">AI Risk Oracle</h1>
          </div>
          <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
            The Future of Trust is Trustless — and It Starts with Aura
          </p>
          <p className="text-gray-400 text-lg">
            AI-Powered Risk Assessment
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Analyzing risk profile...</p>
          </div>
        ) : prediction ? (
          <div className="space-y-6">
            {/* Risk Score Card */}
            <div className={`p-8 bg-gradient-to-br ${getRiskColor(prediction.risk_level)} rounded-3xl shadow-2xl`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-white/80 text-sm mb-1">AI RISK SCORE</div>
                  <div className="text-6xl font-bold text-white">{prediction.risk_score}</div>
                  <div className="text-white/90 text-lg mt-2 uppercase">{prediction.risk_level} RISK</div>
                </div>
                <div>{getRiskIcon(prediction.risk_level)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-white/70 text-xs mb-1">Trust Score</div>
                  <div className="text-2xl font-bold text-white">{prediction.trust_score}</div>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-white/70 text-xs mb-1">Confidence</div>
                  <div className="text-2xl font-bold text-white">{(prediction.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            {Object.keys(prediction.factors).length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-yellow-400" />
                  Risk Factors Identified
                </h3>
                <div className="space-y-3">
                  {Object.entries(prediction.factors).map(([key, factor]) => (
                    <div key={key} className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          factor.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                          factor.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {factor.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{factor.description}</p>
                      <div className="mt-2 text-xs text-gray-500">Impact: {factor.impact}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-purple-900/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-bold text-white mb-2">How It Works</h3>
              <p className="text-gray-300 text-sm">
                Aura's AI Risk Oracle analyzes your PoH score, badge collection, on-chain activity, 
                and behavioral patterns to predict credit risk. This score helps DeFi protocols make 
                better lending decisions.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
            <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Complete PoH verification to get risk assessment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskOracle;
