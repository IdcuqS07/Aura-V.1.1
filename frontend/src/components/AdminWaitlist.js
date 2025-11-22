import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Loader2, Shield } from 'lucide-react';
import { useWallet } from './WalletContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:9000' : 'https://www.aurapass.xyz');

// Admin wallets (deployer wallet)
const ADMIN_WALLETS = [
  '0xc3ece9ac328cb232ddb0bc677d2e980a1a3d3974', // Deployer
];

const AdminWaitlist = () => {
  const { address, isConnected } = useWallet();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  
  const isAdmin = isConnected && ADMIN_WALLETS.includes(address?.toLowerCase());

  useEffect(() => {
    loadWaitlist();
  }, []);

  const loadWaitlist = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/waitlist`);
      setEntries(response.data);
    } catch (err) {
      console.error('Failed to load waitlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (entryId) => {
    setProcessing(entryId);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/waitlist/${entryId}/approve`);
      if (response.data.success && response.data.tx_hash) {
        const explorerUrl = `https://amoy.polygonscan.com/tx/${response.data.tx_hash}`;
        if (window.confirm('Approved! View transaction on explorer?')) {
          window.open(explorerUrl, '_blank');
        }
      }
      await loadWaitlist();
    } catch (err) {
      alert('Failed to approve: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (entryId) => {
    setProcessing(entryId);
    try {
      await axios.post(`${BACKEND_URL}/api/waitlist/${entryId}/reject`);
      await loadWaitlist();
    } catch (err) {
      alert('Failed to reject: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const statusColors = {
    pending: { bg: 'bg-yellow-900/20', border: 'border-yellow-500/50', text: 'text-yellow-400', icon: Clock },
    approved: { bg: 'bg-green-900/20', border: 'border-green-500/50', text: 'text-green-400', icon: CheckCircle },
    rejected: { bg: 'bg-red-900/20', border: 'border-red-500/50', text: 'text-red-400', icon: XCircle }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-20 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-yellow-900/20 border-yellow-500/50">
            <CardContent className="py-8 text-center">
              <Shield className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
              <p className="text-gray-300 mb-4">Please connect your admin wallet to access this page</p>
              <Button onClick={() => window.location.href = '/'} className="bg-purple-600 hover:bg-purple-700">
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-red-900/20 border-red-500/50">
            <CardContent className="py-8 text-center">
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-gray-300 mb-4">Your wallet is not authorized to access admin panel</p>
              <p className="text-sm text-gray-400 font-mono mb-4">{address}</p>
              <Button onClick={() => window.location.href = '/'} className="bg-purple-600 hover:bg-purple-700">
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Minter Waitlist</h1>

        <div className="grid gap-4">
          {entries.map((entry) => {
            const status = statusColors[entry.status];
            const StatusIcon = status.icon;

            return (
              <Card key={entry.id} className={`${status.bg} border ${status.border}`}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <StatusIcon className={`h-5 w-5 ${status.text}`} />
                        <span className={`font-medium ${status.text} uppercase text-sm`}>{entry.status}</span>
                      </div>
                      <p className="text-white font-mono text-sm mb-1">{entry.wallet_address}</p>
                      {entry.email && <p className="text-gray-400 text-sm mb-1">📧 {entry.email}</p>}
                      {entry.reason && <p className="text-gray-300 text-sm mt-2">{entry.reason}</p>}
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>
                      {entry.status === 'approved' && entry.tx_hash && (
                        <div className="mt-2">
                          <a 
                            href={`https://amoy.polygonscan.com/tx/${entry.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                          >
                            <span>🔗</span>
                            <span>View on Explorer</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {entry.status === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <Button
                          onClick={() => handleApprove(entry.id)}
                          disabled={processing === entry.id}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {processing === entry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleReject(entry.id)}
                          disabled={processing === entry.id}
                          className="bg-red-600 hover:bg-red-700"
                          size="sm"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {entries.length === 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-8 text-center">
                <p className="text-gray-400">No waitlist entries yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWaitlist;
