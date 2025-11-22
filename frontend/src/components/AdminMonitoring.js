import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Key, Award, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminMonitoring = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, keysRes, badgesRes, analyticsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:9000' : 'https://www.aurapass.xyz')}/api/users`),
        fetch(`${process.env.REACT_APP_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:9000' : 'https://www.aurapass.xyz')}/api/admin/api-keys`),
        fetch(`${process.env.REACT_APP_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:9000' : 'https://www.aurapass.xyz')}/api/admin/recent-badges`),
        fetch(`${process.env.REACT_APP_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:9000' : 'https://www.aurapass.xyz')}/api/analytics`)
      ]);

      const users = usersRes.ok ? await usersRes.json() : [];
      const keys = keysRes.ok ? await keysRes.json() : [];
      const badges = badgesRes.ok ? await badgesRes.json() : [];
      const analytics = analyticsRes.ok ? await analyticsRes.json() : {};

      setData({ users, keys, badges, analytics });
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading monitoring data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Monitoring</h1>
            <p className="text-gray-400">Real-time activity dashboard</p>
          </div>
          <Button onClick={loadData} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white">{data?.users?.length || 0}</p>
                </div>
                <Users className="h-10 w-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">API Keys</p>
                  <p className="text-3xl font-bold text-white">{data?.keys?.length || 0}</p>
                </div>
                <Key className="h-10 w-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Badges Issued</p>
                  <p className="text-3xl font-bold text-white">{data?.badges?.length || 0}</p>
                </div>
                <Award className="h-10 w-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Verified Users</p>
                  <p className="text-3xl font-bold text-white">{data?.analytics?.verified_users || 0}</p>
                </div>
                <Activity className="h-10 w-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 text-gray-400">Username</th>
                    <th className="text-left py-3 text-gray-400">Wallet</th>
                    <th className="text-left py-3 text-gray-400">Verified</th>
                    <th className="text-left py-3 text-gray-400">Credit Score</th>
                    <th className="text-left py-3 text-gray-400">Created</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {data?.users?.slice(0, 10).map((user) => (
                    <tr key={user.id} className="border-b border-slate-700">
                      <td className="py-3">{user.username}</td>
                      <td className="py-3 font-mono text-xs">{user.wallet_address?.slice(0, 10)}...</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${user.is_verified ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {user.is_verified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3">{user.credit_score}</td>
                      <td className="py-3 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* API Key Usage */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">API Key Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 text-gray-400">API Key</th>
                    <th className="text-left py-3 text-gray-400">Tier</th>
                    <th className="text-left py-3 text-gray-400">Requests Used</th>
                    <th className="text-left py-3 text-gray-400">Rate Limit</th>
                    <th className="text-left py-3 text-gray-400">Created</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {data?.keys?.slice(0, 10).map((key) => (
                    <tr key={key.api_key} className="border-b border-slate-700">
                      <td className="py-3 font-mono text-xs">{key.api_key?.slice(0, 20)}...</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          key.tier === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                          key.tier === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {key.tier}
                        </span>
                      </td>
                      <td className="py-3">{key.requests_used || 0}</td>
                      <td className="py-3">{key.rate_limit}</td>
                      <td className="py-3 text-xs">{new Date(key.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMonitoring;
