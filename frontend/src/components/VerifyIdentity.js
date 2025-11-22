import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from './WalletContext';
import { CheckCircle, Globe, Shield, Loader2, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { NETWORK } from '../config/contracts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:9000' : 'https://www.aurapass.xyz');

const VerifyIdentity = () => {
  const { address, isConnected } = useWallet();
  const [verifying, setVerifying] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const verificationMethods = [
    {
      id: 'poh',
      name: 'Proof of Humanity',
      icon: Shield,
      color: 'green',
      description: 'Real verification via GitHub, Twitter & on-chain data',
      badgeType: 'Proof of Humanity',
      isReal: true,
      redirect: '/poh'
    },
    {
      id: 'uniqueness',
      name: 'Proof of Uniqueness',
      icon: Shield,
      color: 'purple',
      description: 'Verify you are a unique human (Demo Mode)',
      badgeType: 'Proof of Uniqueness',
      isDemo: true
    },
    {
      id: 'identity',
      name: 'Identity Verified',
      icon: CheckCircle,
      color: 'blue',
      description: 'Verify your digital identity (Demo Mode)',
      badgeType: 'Identity Verified',
      isDemo: true
    },
    {
      id: 'reputation',
      name: 'Reputation Badge',
      icon: Shield,
      color: 'yellow',
      description: 'Build your on-chain reputation (Demo Mode)',
      badgeType: 'Reputation Badge',
      isDemo: true
    },
    {
      id: 'aura-proof',
      name: 'Aura Proof',
      icon: CheckCircle,
      color: 'green',
      description: 'Zero-knowledge proof verification (Demo Mode)',
      badgeType: 'Aura Proof',
      isDemo: true
    },
    {
      id: 'aura-identity',
      name: 'Aura Identity',
      icon: Globe,
      color: 'indigo',
      description: 'Decentralized identity verification (Demo Mode)',
      badgeType: 'Aura Identity',
      isDemo: true
    }
  ];

  const switchToPolygonAmoy = async () => {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId === NETWORK.chainId) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK],
        });
      } else if (switchError.code === 4001) {
        throw new Error('Please switch to Polygon Amoy network');
      } else {
        throw switchError;
      }
    }
  };

  const handleVerify = async (method) => {
    if (method.redirect) {
      window.location.href = method.redirect;
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setVerifying(true);
    setError('');
    setTxHash('');

    try {
      // For demo badges, use demo endpoint (no blockchain)
      if (method.isDemo) {
        const response = await axios.post(`${BACKEND_URL}/api/badges/demo`, {
          wallet_address: address,
          badge_type: method.badgeType,
          zk_proof_hash: `${method.id}_proof_${Date.now()}`
        });
        
        if (response.data.success) {
          setTxHash(response.data.token_id); // Use token_id as "tx hash" for demo
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 3000);
        } else {
          setError(response.data.message || 'Badge creation failed');
        }
        return;
      }

      // For real badges, mint on-chain
      await switchToPolygonAmoy();

      // User signs message to prove ownership
      const { ethereum } = window;
      const message = `Verify identity for ${method.badgeType} badge\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });

      // Send to backend with signature (backend mints and pays gas)
      const response = await axios.post(`${BACKEND_URL}/api/badges/mint`, {
        wallet_address: address,
        badge_type: method.badgeType,
        zk_proof_hash: `${method.id}_proof_${Date.now()}`,
        message: message,
        signature: signature
      });
      
      if (response.data.success) {
        setTxHash(response.data.tx_hash);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3000);
      } else {
        const errorMsg = response.data.message || 'Minting failed';
        setError(errorMsg);
        if (errorMsg.includes('not authorized') || errorMsg.includes('waitlist')) {
          setTimeout(() => {
            if (window.confirm('You need to be approved first. Go to waitlist page?')) {
              window.location.href = '/waitlist';
            }
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Verification error:', err);
      if (err.code === 4001) {
        setError('User rejected the request');
      } else if (err.message?.includes('network')) {
        setError('Please switch to Polygon Amoy network in your wallet');
      } else {
        const errorMsg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Verification failed';
        setError(errorMsg);
        
        // Redirect to waitlist if not authorized
        if (errorMsg.includes('approved') || errorMsg.includes('waitlist')) {
          setTimeout(() => {
            if (window.confirm('You need to join the waitlist first. Go to waitlist page?')) {
              window.location.href = '/waitlist';
            }
          }, 1500);
        }
      }
    } finally {
      setVerifying(false);
    }
  };



  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Verify Your Identity</h1>
          <p className="text-gray-300">Choose a verification method to earn ZK-ID badges</p>
        </div>

        {!isConnected && (
          <Card className="bg-yellow-900/20 border-yellow-500/50 mb-6">
            <CardContent className="py-4">
              <p className="text-yellow-400">⚠️ Please connect your wallet to verify and mint badges on-chain</p>
            </CardContent>
          </Card>
        )}

        {txHash && (
          <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/50 mb-6 shadow-lg shadow-green-500/20">
            <CardContent className="py-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-400 font-bold text-lg">✅ Badge Minted Successfully!</p>
                    <p className="text-green-300 text-sm">Your ZK-ID badge is now on-chain</p>
                  </div>
                </div>
                
                <div className="p-4 bg-black/30 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-green-300 text-sm font-medium">Transaction Hash:</span>
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">Polygon Amoy</span>
                  </div>
                  <p className="text-green-200 font-mono text-sm break-all">{txHash}</p>
                </div>

                <a
                  href={`https://amoy.polygonscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition font-medium shadow-lg"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>View Transaction on PolygonScan</span>
                </a>

                <p className="text-center text-green-300/80 text-xs">Redirecting to dashboard in 3 seconds...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="bg-red-900/20 border-red-500/50 mb-6">
            <CardContent className="py-4">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {verificationMethods.map((method) => {
            const Icon = method.icon;
            const colorMap = {
              purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', btn: 'bg-purple-600 hover:bg-purple-700', border: 'border-purple-500/50' },
              blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', btn: 'bg-blue-600 hover:bg-blue-700', border: 'border-blue-500/50' },
              yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', btn: 'bg-yellow-600 hover:bg-yellow-700', border: 'border-yellow-500/50' },
              green: { bg: 'bg-green-500/20', text: 'text-green-400', btn: 'bg-green-600 hover:bg-green-700', border: 'border-green-500/50' },
              indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', btn: 'bg-indigo-600 hover:bg-indigo-700', border: 'border-indigo-500/50' },
              gray: { bg: 'bg-gray-500/20', text: 'text-gray-400', btn: 'bg-gray-600 hover:bg-gray-700', border: 'border-gray-500/50' }
            };
            const colors = colorMap[method.color];
            const iconBg = colors.bg;
            const iconColor = colors.text;
            const btnBg = colors.btn;
            
            return (
              <Card key={method.id} className={`bg-slate-800/50 border-slate-700 hover:${colors.border} transition ${method.isReal ? 'ring-2 ring-green-500/30' : ''}`}>
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-3 ${iconBg} rounded-lg`}>
                      <Icon className={`h-8 w-8 ${iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white text-xl">{method.name}</CardTitle>
                      {method.isReal && <span className="text-xs text-green-400 font-semibold">✓ REAL VERIFICATION</span>}
                      {method.isDemo && <span className="text-xs text-gray-400">DEMO MODE</span>}
                    </div>
                  </div>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleVerify(method)}
                    disabled={verifying}
                    className={`w-full ${btnBg}`}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      `Verify with ${method.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-white">Choose Verification Method</p>
                <p className="text-gray-400">Select a verification method to prove your identity</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-white">Complete Verification</p>
                <p className="text-gray-400">Follow the verification process with the selected provider</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-white">Receive ZK Badge</p>
                <p className="text-gray-400">Get a soulbound NFT badge as proof of verification</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">4</div>
              <div>
                <p className="font-medium text-white">Boost Your Credit Score</p>
                <p className="text-gray-400">Each badge increases your on-chain credibility</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/20 border-blue-500/50 mt-6">
          <CardContent className="py-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Privacy Protected</p>
                <p className="text-blue-200/80">Your verification data is processed using zero-knowledge proofs. Only the verification result is stored on-chain, not your personal information.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyIdentity;
