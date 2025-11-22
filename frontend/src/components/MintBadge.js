import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from './WalletContext';
import { Shield, Award, Star, CheckCircle, Globe, Loader2 } from 'lucide-react';

const MintBadge = () => {
  const { address, isConnected } = useWallet();
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const badgeTypes = [
    { type: 'Proof of Uniqueness', icon: Shield, color: 'purple' },
    { type: 'Identity Verified', icon: Award, color: 'blue' },
    { type: 'Reputation Badge', icon: Star, color: 'yellow' },
    { type: 'Civic Verified', icon: CheckCircle, color: 'green' },
    { type: 'Worldcoin Verified', icon: Globe, color: 'indigo' }
  ];

  const handleMint = async (badgeType) => {
    if (!isConnected) {
      setError('Please connect your wallet');
      return;
    }

    setMinting(true);
    setError('');
    setTxHash('');

    try {
      const { issueBadge } = await import('../utils/web3');
      const zkProofHash = `zk_proof_${Date.now()}`;
      const hash = await issueBadge(address, badgeType, zkProofHash);
      setTxHash(hash);
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to mint badge');
    } finally {
      setMinting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md">
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-slate-400">Connect your wallet to mint ZK-ID Badges</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Mint ZK-ID Badge</h1>
          <p className="text-gray-300">Issue soulbound NFT badges on Polygon Amoy</p>
        </div>

        {txHash && (
          <Card className="bg-green-900/20 border-green-500/50 mb-6">
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <div className="flex-1">
                  <p className="text-green-400 font-medium">Badge minted successfully!</p>
                  <a 
                    href={`https://amoy.polygonscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-300 hover:underline"
                  >
                    View on Explorer →
                  </a>
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

        <div className="grid md:grid-cols-2 gap-6">
          {badgeTypes.map(({ type, icon: Icon, color }) => (
            <Card key={type} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 bg-${color}-500/20 rounded-lg`}>
                    <Icon className={`h-6 w-6 text-${color}-400`} />
                  </div>
                  <CardTitle className="text-white">{type}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Mint a soulbound NFT badge for {type.toLowerCase()}
                </CardDescription>
                <Button
                  onClick={() => handleMint(type)}
                  disabled={minting}
                  className="w-full bg-purple-600 hover:bg-purple-700"
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
          ))}
        </div>

        <Card className="bg-slate-800/50 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">About Minting</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-2 text-sm">
            <p>• Badges are soulbound NFTs (non-transferable)</p>
            <p>• Minting requires MATIC for gas fees</p>
            <p>• Only authorized minters can issue badges</p>
            <p>• Each badge is unique and verifiable on-chain</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MintBadge;
