import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, Award, TrendingUp, Activity } from 'lucide-react';

const RealtimeAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch from The Graph subgraph
        const subgraphUrl = process.env.REACT_APP_SUBGRAPH_URL || 
          'https://api.studio.thegraph.com/query/1716185/aura-protocol/v0.1.0';
        
        const query = `
          query {
            globalStats(id: "global") {
              totalBadges
              totalPassports
              totalUsers
              averageCreditScore
              lastUpdated
            }
            badges(first: 5, orderBy: issuedAt, orderDirection: desc) {
              tokenId
              badgeType
              issuedAt
            }
          }
        `;

        const response = await fetch(subgraphUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });

        const data = await response.json();
        
        if (data.data) {
          setStats(data.data);
        } else {
          // Fallback to backend API
          const backendResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics`);
          const backendData = await backendResponse.json();
          setStats({ globalStats: backendData, badges: [] });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Fallback to backend
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics`);
          const data = await response.json();
          setStats({ globalStats: data, badges: [] });
        } catch (err) {
          console.error('Fallback failed:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const globalStats = stats?.globalStats || {};
  const totalUsers = globalStats.totalUsers || globalStats.total_users || 0;
  const totalBadges = globalStats.totalBadges || globalStats.verified_users || 0;
  const totalPassports = globalStats.totalPassports || globalStats.total_credit_passports || 0;
  const avgScore = globalStats.averageCreditScore || globalStats.average_credit_score || 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-3xl font-bold">{totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Badges Minted</p>
                <p className="text-3xl font-bold">{totalBadges.toLocaleString()}</p>
              </div>
              <Award className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Passports</p>
                <p className="text-3xl font-bold">{totalPassports.toLocaleString()}</p>
              </div>
              <Activity className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Credit Score</p>
                <p className="text-3xl font-bold">{Math.round(avgScore)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {stats?.badges && stats.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.badges.map((badge, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Badge #{badge.tokenId}</p>
                    <p className="text-sm text-gray-500">{badge.badgeType}</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(badge.issuedAt * 1000).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Source Indicator */}
      <div className="text-center text-sm text-gray-500">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live data from The Graph
        </span>
      </div>
    </div>
  );
};

export default RealtimeAnalytics;
