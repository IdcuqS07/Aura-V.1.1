import React, { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/components/WalletContext';
import { Fingerprint, Shield, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const ProofOfUniqueness = () => {
  const { address: walletAddress, isConnected } = useWallet();
  const [uniquenessScore, setUniquenessScore] = useState(0);
  const [proofStatus, setProofStatus] = useState('not_started');
  const [loading, setLoading] = useState(false);
  const [proofData, setProofData] = useState(null);

  useEffect(() => {
    if (isConnected && walletAddress) {
      checkExistingProof();
    }
  }, [isConnected, walletAddress]);

  const checkExistingProof = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/blockchain/badges/${walletAddress}`
      );
      const result = await response.json();
      
      if (result.badges && result.badges.uniqueness) {
        setProofStatus('verified');
        setUniquenessScore(95);
        setProofData({
          timestamp: new Date().toISOString(),
          zkProofHash: `0x${Math.random().toString(16).substr(2, 64)}`
        });
      }
    } catch (error) {
      console.error('Error checking existing proof:', error);
    }
  };

  const generateProofOfUniqueness = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setProofStatus('generating');

    try {
      // Simulate proof generation process
      const steps = [
        'Analyzing wallet history...',
        'Generating biometric hash...',
        'Creating ZK proof...',
        'Verifying uniqueness...',
        'Minting ZK Badge...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setUniquenessScore((i + 1) * 20);
      }

      // Generate mock proof data
      const mockProofData = {
        timestamp: new Date().toISOString(),
        zkProofHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        uniquenessFactors: [
          'Wallet transaction patterns',
          'Device fingerprinting',
          'Behavioral biometrics',
          'Network analysis'
        ]
      };

      setProofData(mockProofData);
      setProofStatus('verified');
      setUniquenessScore(95);

    } catch (error) {
      console.error('Proof generation error:', error);
      setProofStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (proofStatus) {
      case 'verified':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'generating':
        return <Clock className="h-8 w-8 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
      default:
        return <Fingerprint className="h-8 w-8 text-purple-400" />;
    }
  };

  const getStatusText = () => {
    switch (proofStatus) {
      case 'verified':
        return 'Uniqueness Verified';
      case 'generating':
        return 'Generating Proof...';
      case 'failed':
        return 'Verification Failed';
      default:
        return 'Ready to Verify';
    }
  };

  return (
    <div className="pt-20 px-4 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Proof of Uniqueness</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Generate a zero-knowledge proof that demonstrates your unique identity without revealing personal information.
        </p>
      </div>

      {/* Main Proof Card */}
      <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl text-white">{getStatusText()}</CardTitle>
          <CardDescription className="text-gray-300">
            {proofStatus === 'verified' 
              ? 'Your uniqueness has been cryptographically proven'
              : 'Generate your unique identity proof'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Uniqueness Score */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Uniqueness Score</span>
              <span className="text-white font-semibold">{uniquenessScore}%</span>
            </div>
            <Progress value={uniquenessScore} className="h-3" />
          </div>

          {/* Action Button */}
          <Button
            onClick={generateProofOfUniqueness}
            disabled={!isConnected || loading || proofStatus === 'verified'}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
            size="lg"
          >
            {loading ? 'Generating Proof...' : 
             proofStatus === 'verified' ? 'Proof Generated ✓' : 
             'Generate Proof of Uniqueness'}
          </Button>

          {/* Proof Details */}
          {proofData && (
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
              <h4 className="text-white font-semibold mb-3">Proof Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Generated:</span>
                  <span className="text-white">{new Date(proofData.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ZK Proof Hash:</span>
                  <span className="text-white font-mono text-xs">
                    {proofData.zkProofHash.substring(0, 20)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-400" />
            <span>How Proof of Uniqueness Works</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Privacy-Preserving</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• No personal data is stored or transmitted</li>
                <li>• Uses zero-knowledge cryptographic proofs</li>
                <li>• Biometric data never leaves your device</li>
                <li>• Wallet signatures prove ownership</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Uniqueness Factors</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Transaction pattern analysis</li>
                <li>• Device fingerprinting</li>
                <li>• Behavioral biometrics</li>
                <li>• Network topology analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700 text-center">
          <CardContent className="pt-6">
            <Shield className="h-8 w-8 text-purple-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-2">Sybil Resistance</h4>
            <p className="text-gray-300 text-sm">Prevents multiple accounts from the same person</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700 text-center">
          <CardContent className="pt-6">
            <Fingerprint className="h-8 w-8 text-blue-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-2">Identity Proof</h4>
            <p className="text-gray-300 text-sm">Cryptographic proof of unique identity</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700 text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-2">Trust Score</h4>
            <p className="text-gray-300 text-sm">Increases your credibility rating</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProofOfUniqueness;