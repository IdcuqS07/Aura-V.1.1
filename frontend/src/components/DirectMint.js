import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from './WalletContext';
import { CheckCircle, Globe, Shield, Loader2, ExternalLink } from 'lucide-react';
import { ethers } from 'ethers';
import { CONTRACTS, NETWORK } from '../config/contracts';

const DirectMint = () => {
  const { address, isConnected } = useWallet();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const badgeTypes = [
    { name: 'Proof of Uniqueness', icon: Shield, color: 'purple' },
    { name: 'Identity Verified', icon: CheckCircle, color: 'blue' },
    { name: 'Reputation Badge', icon: Shield, color: 'yellow' },
    { name: 'Civic Verified', icon: CheckCircle, color: 'green' },
    { name: 'Worldcoin Verified', icon: Globe, color: 'indigo' }
  ];

  useEffect(() => {
    if (isConnected) checkAuthorization();
  }, [isConnected, address]);

  const checkAuthorization = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACTS.SIMPLE_ZK_BADGE,
        ['function authorizedMinters(address) view returns (bool)'],
        provider
      );
      const authorized = await contract.authorizedMinters(address);
      setIsAuthorized(authorized);
    } catch (err) {
      console.error('Check authorization error:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleMint = async (badgeType) => {
    setMinting(true);
    setError('');
    setTxHash('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('wallet_switchEthereumChain', [{ chainId: NETWORK.chainId }]);
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACTS.SIMPLE_ZK_BADGE,
        ['function issueBadge(address recipient, string badgeType, string zkProofHash) returns (uint256)'],
        signer
      );

      const tx = await contract.issueBadge(
        address,
        badgeType,
        `proof_${Date.now()}`
      );

      setTxHash(tx.hash);
      await tx.wait();
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      setError(err.message || 'Minting failed');
    } finally {
      setMinting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen pt-20 px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-20 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-yellow-900/20 border-yellow-500/50">
            <CardContent className="py-8 text-center">
              <p className="text-yellow-400">⚠️ Please connect your wallet</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen pt-20 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-900/20 border-red-500/50">
            <CardContent className="py-8 text-center">
              <p className="text-red-400 mb-4">❌ Your wallet is not authorized for direct minting</p>
              <p className="text-gray-400 text-sm">Please use the regular verification flow or join the waitlist</p>
              <div className="flex gap-4 justify-center mt-6">
                <Button onClick={() => window.location.href = '/verify'} className="bg-purple-600 hover:bg-purple-700">
                  Regular Verification
                </Button>
                <Button onClick={() => window.location.href = '/waitlist'} className="bg-blue-600 hover:bg-blue-700">
                  Join Waitlist
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Direct Mint Badge</h1>
          <p className="text-gray-300">✅ Your wallet is authorized - Mint badges directly</p>
          <p className="text-sm text-yellow-400 mt-2">⚠️ You will pay gas fees</p>
        </div>

        {txHash && (
          <Card className="bg-green-900/20 border-green-500/50 mb-6">
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <div className="flex-1">
                  <p className="text-green-400 font-medium">Badge minted successfully!</p>
                  <p className="text-sm text-green-300 font-mono mt-1">TX: {txHash}</p>
                  <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-300 hover:underline flex items-center space-x-1 mt-2"><span>View on Polygonscan</span><ExternalLink className="h-3 w-3" /></a>
                </div>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badgeTypes.map((badge, idx) => {
            const Icon = badge.icon;
            const colorMap = {
              purple: 'bg-purple-600 hover:bg-purple-700',
              blue: 'bg-blue-600 hover:bg-blue-700',
              yellow: 'bg-yellow-600 hover:bg-yellow-700',
              green: 'bg-green-600 hover:bg-green-700',
              indigo: 'bg-indigo-600 hover:bg-indigo-700'
            };

            return (
              <Card key={idx} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className={`h-8 w-8 text-${badge.color}-400`} />
                    <CardTitle className="text-white text-lg">{badge.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleMint(badge.name)}
                    disabled={minting}
                    className={`w-full ${colorMap[badge.color]}`}
                  >
                    {minting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Minting...
                      </>
                    ) : (
                      'Mint Badge'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DirectMint;
