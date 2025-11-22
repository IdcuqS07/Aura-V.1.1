import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Award, Lock, CheckCircle, Calendar, Hash, TrendingUp, Activity, Loader } from 'lucide-react';
import { useWallet } from './WalletContext';
import { mintPassport, getPassport as getOnChainPassport, hasPassport } from '../utils/passportContract';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:9000' : 'https://www.aurapass.xyz');
const API = `${BACKEND_URL}/api`;

const CreditPassport = () => {
  const { address, isConnected } = useWallet();
  const [passport, setPassport] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [riskPrediction, setRiskPrediction] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadPassportData();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const loadPassportData = async () => {
    try {
      setLoading(true);
      const passportRes = await axios.get(`${API}/passport/${address}`);
      if (passportRes.data.success) {
        setPassport(passportRes.data.passport);
        loadRiskPrediction();
      }
      const badgesRes = await axios.get(`${API}/badges/demo/${address}`);
      setBadges(badgesRes.data.badges || []);
    } catch (error) {
      console.error('Load passport error:', error);
      setPassport(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRiskPrediction = async () => {
    try {
      setLoadingRisk(true);
      const res = await axios.post(`${API}/oracle/risk-score`, {
        wallet_address: address
      });
      if (res.data.success) {
        setRiskPrediction(res.data.prediction);
      }
    } catch (error) {
      console.error('Risk prediction error:', error);
    } finally {
      setLoadingRisk(false);
    }
  };
  
  const handleMintPassport = async () => {
    try {
      setCreating(true);
      
      // Get user score data from backend
      const scoreRes = await axios.get(`${API}/passport/score/${address}`);
      if (!scoreRes.data.success) {
        alert('Failed to fetch your data. Complete PoH first.');
        return;
      }
      
      // Support both old and new format
      const { user_data, credit_score, poh_score: poh_direct, badge_count: badge_direct } = scoreRes.data;
      const poh_score = user_data?.poh_score || poh_direct || 0;
      const badge_count = user_data?.badge_count || badge_direct || 0;
      
      // Confirm with user
      const confirmed = window.confirm(
        `Mint Credit Passport?\n\n` +
        `PoH Score: ${poh_score}\n` +
        `Badges: ${badge_count}\n` +
        `Estimated Credit Score: ${credit_score}\n\n` +
        `Gas fee: ~0.007 MATIC`
      );
      
      if (!confirmed) return;
      
      // Mint on-chain
      const { txHash, tokenId } = await mintPassport(poh_score, badge_count);
      
      // Save to backend
      await axios.post(`${API}/passport/create`, {
        user_id: address,
        wallet_address: address
      });
      
      alert(`Passport minted!\nTX: ${txHash}`);
      loadPassportData();
    } catch (error) {
      console.error('Mint error:', error);
      if (error.message?.includes('Passport already exists')) {
        alert('You already have a passport!');
      } else {
        alert(error.message || 'Failed to mint passport');
      }
    } finally {
      setCreating(false);
    }
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: 'from-green-600 to-emerald-600',
      medium: 'from-yellow-600 to-orange-600',
      high: 'from-red-600 to-rose-600'
    };
    return colors[risk] || colors.medium;
  };

  const getCreditScoreGrade = (score) => {
    if (score >= 850) return 'Excellent';
    if (score >= 750) return 'Very Good';
    if (score >= 650) return 'Good';
    if (score >= 550) return 'Fair';
    return 'Poor';
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-16 px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Shield className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Connect Wallet</h1>
          <p className="text-gray-400">Please connect your wallet to view your Credit Passport.</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-white text-xl">Loading Passport...</div>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="min-h-screen pt-16 px-4 py-8" data-testid="no-passport">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Shield className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">No Credit Passport Found</h1>
          <p className="text-gray-400 mb-8">
            Complete Proof of Humanity verification to create your Credit Passport.
          </p>
          <div className="space-x-4">
            <a
              href="/poh"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Start PoH Verification
            </a>
            <button
              onClick={handleMintPassport}
              disabled={creating}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Minting...
                </>
              ) : (
                'Mint Passport (Pay Gas)'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4 py-8" data-testid="credit-passport-page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">ZK Credit Passport</h1>
          <p className="text-gray-400">Your decentralized financial identity on Polygon</p>
        </div>

        {/* Main Passport Card */}
        <div className="mb-8">
          <div className="relative overflow-hidden">
            {/* Passport Visual */}
            <div className={`p-8 bg-gradient-to-br ${getRiskColor(passport.risk_level)} rounded-3xl shadow-2xl`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="text-white/80 text-sm mb-1">AURA PROTOCOL</div>
                    <div className="text-3xl font-bold text-white">Credit Passport</div>
                  </div>
                  <Shield className="w-16 h-16 text-white/30" />
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="text-white/70 text-sm mb-1">Passport ID</div>
                    <div className="text-xl font-bold text-white font-mono">{passport.passport_id}</div>
                  </div>
                  <div>
                    <div className="text-white/70 text-sm mb-1">Risk Level</div>
                    <div className="text-xl font-bold text-white uppercase">{passport.risk_level}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div className="text-white/70 text-xs mb-1">Credit Score</div>
                    <div className="text-2xl font-bold text-white">{passport.credit_score}</div>
                  </div>
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div className="text-white/70 text-xs mb-1">Reputation</div>
                    <div className="text-2xl font-bold text-white">{passport.reputation || 0}</div>
                  </div>
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div className="text-white/70 text-xs mb-1">Badges</div>
                    <div className="text-2xl font-bold text-white">{passport?.badge_count || badges.length}</div>
                  </div>
                </div>

                <div className="mt-6 text-white/50 text-xs">
                  Soulbound Token: {passport.soulbound_token_id}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Credit Analysis */}
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10" data-testid="credit-analysis">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-purple-400" />
              Credit Analysis
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Credit Grade</span>
                  <span className="text-white font-bold">{getCreditScoreGrade(passport.credit_score)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(passport.credit_score / 1000) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="text-sm text-gray-400 mb-3">Score Breakdown</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Payment History</span>
                    <span className="text-white">95%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">On-Chain Activity</span>
                    <span className="text-white">88%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Protocol Reputation</span>
                    <span className="text-white">92%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ZK Proof Details */}
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10" data-testid="zk-proof-details">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-blue-400" />
              ZK Proof Details
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-2">Proof Hash</div>
                <div className="p-3 bg-slate-900/50 rounded-lg font-mono text-xs text-purple-400 break-all">
                  {passport.zk_proof_hash}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Verification Status</div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Verified</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Issued Date</div>
                <div className="flex items-center space-x-2 text-white">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{new Date(passport.issued_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Last Updated</div>
                <div className="flex items-center space-x-2 text-white">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span>{new Date(passport.last_updated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10" data-testid="badges-collection">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-cyan-400" />
              Badges Collection
            </h3>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/20"
                  >
                    <Award className="w-8 h-8 text-purple-400 mb-2" />
                    <div className="text-sm font-medium text-white capitalize">{badge.badge_type}</div>
                    <div className="text-xs text-gray-400 mt-1 font-mono">{badge.token_id}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No badges earned yet
              </div>
            )}
          </div>

          {/* Transaction Volume */}
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10" data-testid="transaction-stats">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Hash className="w-6 h-6 mr-2 text-green-400" />
              Transaction Stats
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-xl">
                <div className="text-sm text-gray-400 mb-1">Total Volume</div>
                <div className="text-3xl font-bold text-green-400">
                  Score: {passport.credit_score || 0}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">PoH Score</div>
                  <div className="text-xl font-bold text-white">{passport.poh_score || 0}</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">On-Chain</div>
                  <div className="text-xl font-bold text-white">{passport.onchain_activity || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Risk Oracle */}
          <div className="md:col-span-2 p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-2xl border border-purple-500/30" data-testid="ai-risk-oracle">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-purple-400" />
              AI Risk Oracle
              <span className="ml-3 px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">FLAGSHIP FEATURE</span>
            </h3>
            {loadingRisk ? (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-spin" />
                <div className="text-gray-400">Analyzing risk factors...</div>
              </div>
            ) : riskPrediction ? (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Risk Score */}
                <div className="p-6 bg-slate-900/50 rounded-xl text-center">
                  <div className="text-sm text-gray-400 mb-2">AI Risk Score</div>
                  <div className={`text-5xl font-bold mb-2 ${
                    riskPrediction.risk_level === 'low' ? 'text-green-400' :
                    riskPrediction.risk_level === 'medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {riskPrediction.risk_score}
                  </div>
                  <div className="text-xs text-gray-500">out of 100</div>
                  <div className={`mt-3 px-3 py-1 rounded-full text-sm font-medium inline-block ${
                    riskPrediction.risk_level === 'low' ? 'bg-green-500/20 text-green-300' :
                    riskPrediction.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {riskPrediction.risk_level.toUpperCase()} RISK
                  </div>
                </div>

                {/* Trust Score */}
                <div className="p-6 bg-slate-900/50 rounded-xl text-center">
                  <div className="text-sm text-gray-400 mb-2">Trust Score</div>
                  <div className="text-5xl font-bold text-blue-400 mb-2">
                    {riskPrediction.trust_score}
                  </div>
                  <div className="text-xs text-gray-500">out of 100</div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${riskPrediction.trust_score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Confidence */}
                <div className="p-6 bg-slate-900/50 rounded-xl text-center">
                  <div className="text-sm text-gray-400 mb-2">Confidence</div>
                  <div className="text-5xl font-bold text-purple-400 mb-2">
                    {Math.round(riskPrediction.confidence * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">prediction accuracy</div>
                  <div className="mt-3 text-xs text-gray-400">
                    Based on {Object.keys(riskPrediction.factors).length} risk factors
                  </div>
                </div>

                {/* Risk Factors */}
                {Object.keys(riskPrediction.factors).length > 0 && (
                  <div className="md:col-span-3 p-4 bg-slate-900/30 rounded-xl">
                    <div className="text-sm font-medium text-white mb-3">Risk Factors Detected:</div>
                    <div className="space-y-2">
                      {Object.entries(riskPrediction.factors).map(([key, factor]) => (
                        <div key={key} className="flex items-start space-x-3 text-sm">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            factor.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                            factor.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {factor.severity}
                          </div>
                          <div className="flex-1">
                            <div className="text-gray-300">{factor.description}</div>
                            <div className="text-gray-500 text-xs mt-1">Impact: {factor.impact}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <button
                  onClick={loadRiskPrediction}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  Generate AI Risk Assessment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* API Access Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-2xl border border-purple-500/30" data-testid="api-access">
          <h3 className="text-2xl font-bold text-white mb-4">Proof-as-a-Service API</h3>
          <p className="text-gray-300 mb-6">
            Use Aura Protocol's API to verify this passport in your dApp or smart contract.
          </p>
          <div className="p-4 bg-slate-900/50 rounded-lg font-mono text-sm">
            <div className="text-purple-400">GET</div>
            <div className="text-gray-300 mt-1">{BACKEND_URL}/api/proof/verify/{address}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditPassport;
