import React, { useState, useEffect } from 'react';
import { Clock, Award, TrendingUp, Activity } from 'lucide-react';

const GraphDataDisplay = ({ walletAddress }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (walletAddress) {
      fetchGraphData();
    }
  }, [walletAddress]);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const [activity, badges, history, passport] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/graph/defi-activity/${walletAddress}`).then(r => r.json()),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/graph/badges/${walletAddress}`).then(r => r.json()),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/graph/score-history/${walletAddress}`).then(r => r.json()),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/graph/passport/${walletAddress}`).then(r => r.json()).catch(() => null)
      ]);

      setData({
        activity: activity.data || {},
        badges: badges.badges || [],
        history: history.history || [],
        passport: passport?.passport || null
      });
    } catch (error) {
      console.error('Error fetching graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-700">
        {['overview', 'badges', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold">DeFi Activity</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Badges</span>
                <span className="font-semibold">{data.activity.total_badges || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Credit Score</span>
                <span className="font-semibold text-green-400">{data.activity.credit_score || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">On-chain Activity</span>
                <span className="font-semibold">{data.activity.onchain_activity || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Award className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold">Badge Breakdown</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(data.activity.badge_breakdown || {}).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-400 capitalize">{type}</span>
                  <span className="bg-purple-900/50 px-3 py-1 rounded-full text-sm">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <Award className="w-6 h-6 text-yellow-400" />
            <span>Badge Timeline ({data.badges.length})</span>
          </h3>
          
          {data.badges.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No badges found</div>
          ) : (
            <div className="space-y-3">
              {data.badges.map((badge, idx) => (
                <div key={badge.id || idx} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold capitalize">{badge.badgeType || 'Unknown'}</h4>
                          <p className="text-sm text-gray-400">Token #{badge.tokenId}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 font-mono truncate">
                        Proof: {badge.zkProofHash?.slice(0, 20)}...
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {new Date(badge.mintedAt * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <span>Score History ({data.history.length})</span>
          </h3>

          {data.history.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No score updates found</div>
          ) : (
            <div className="space-y-3">
              {data.history.map((update, idx) => {
                const scoreDiff = update.newScore - update.oldScore;
                const isIncrease = scoreDiff > 0;
                
                return (
                  <div key={update.id || idx} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isIncrease ? 'bg-green-900/30' : 'bg-red-900/30'
                        }`}>
                          <TrendingUp className={`w-6 h-6 ${
                            isIncrease ? 'text-green-400' : 'text-red-400 rotate-180'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">{update.oldScore}</span>
                            <span className="text-gray-600">→</span>
                            <span className="font-semibold text-lg">{update.newScore}</span>
                            <span className={`text-sm ${isIncrease ? 'text-green-400' : 'text-red-400'}`}>
                              ({isIncrease ? '+' : ''}{scoreDiff})
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(update.timestamp * 1000).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GraphDataDisplay;
