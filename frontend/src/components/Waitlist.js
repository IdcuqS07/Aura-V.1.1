import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWallet } from './WalletContext';
import { CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:9000' : 'https://www.aurapass.xyz');

const Waitlist = () => {
  const { address, isConnected } = useWallet();
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${BACKEND_URL}/api/waitlist`, {
        wallet_address: address,
        email: email,
        reason: reason
      });

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-20 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-green-900/20 border-green-500/50">
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">You're on the waitlist!</h2>
              <p className="text-gray-300">We'll notify you when your wallet is approved for minting.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Join Minter Waitlist</CardTitle>
            <p className="text-gray-400">Get approved to mint ZK-ID badges</p>
          </CardHeader>
          <CardContent>
            {!isConnected && (
              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
                <p className="text-yellow-400">⚠️ Please connect your wallet first</p>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Wallet Address</label>
                <Input
                  value={address || 'Not connected'}
                  disabled
                  className="bg-slate-700 border-slate-600 text-gray-300"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Email (Optional)</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Why do you want to mint? (Optional)</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tell us about your use case..."
                  rows={4}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={!isConnected || loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Join Waitlist'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Waitlist;
