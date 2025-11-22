import React, { useState, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWallet } from '@/components/WalletContext';
import { Shield, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ZKVerification = () => {
  const { address: walletAddress, isConnected } = useWallet();
  const [verificationStatus, setVerificationStatus] = useState({
    civic: 'not_started',
    worldcoin: 'not_started'
  });
  const [loading, setLoading] = useState({
    civic: false,
    worldcoin: false
  });

  const handleCivicVerification = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(prev => ({ ...prev, civic: true }));
    setVerificationStatus(prev => ({ ...prev, civic: 'processing' }));

    try {
      // Simulate Civic verification process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blockchain/civic-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'demo_user_id', // In production, get from user context
          wallet_address: walletAddress,
          civic_proof: `civic_proof_${Date.now()}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setVerificationStatus(prev => ({ ...prev, civic: 'verified' }));
      } else {
        setVerificationStatus(prev => ({ ...prev, civic: 'failed' }));
      }
    } catch (error) {
      console.error('Civic verification error:', error);
      setVerificationStatus(prev => ({ ...prev, civic: 'failed' }));
    } finally {
      setLoading(prev => ({ ...prev, civic: false }));
    }
  };

  const handleWorldcoinVerification = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(prev => ({ ...prev, worldcoin: true }));
    setVerificationStatus(prev => ({ ...prev, worldcoin: 'processing' }));

    try {
      // Simulate Worldcoin verification process
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blockchain/worldcoin-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'demo_user_id', // In production, get from user context
          wallet_address: walletAddress,
          nullifier_hash: `nullifier_${Date.now()}`,
          proof: ['0x1234', '0x5678', '0x9abc'] // Mock proof
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setVerificationStatus(prev => ({ ...prev, worldcoin: 'verified' }));
      } else {
        setVerificationStatus(prev => ({ ...prev, worldcoin: 'failed' }));
      }
    } catch (error) {
      console.error('Worldcoin verification error:', error);
      setVerificationStatus(prev => ({ ...prev, worldcoin: 'failed' }));
    } finally {
      setLoading(prev => ({ ...prev, worldcoin: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <div className="pt-20 px-4 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">ZK Identity Verification</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Verify your identity using Zero-Knowledge proofs to earn ZK-ID Badges and build your on-chain reputation.
        </p>
      </div>

      {!isConnected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to start the verification process.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Civic Verification */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(verificationStatus.civic)}
                <CardTitle className="text-white">Civic Verification</CardTitle>
              </div>
              {getStatusBadge(verificationStatus.civic)}
            </div>
            <CardDescription className="text-gray-300">
              Verify your identity using Civic's decentralized identity platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-400">
              <p>✓ Government ID verification</p>
              <p>✓ Biometric authentication</p>
              <p>✓ Privacy-preserving proofs</p>
            </div>
            <Button
              onClick={handleCivicVerification}
              disabled={!isConnected || loading.civic || verificationStatus.civic === 'verified'}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading.civic ? 'Verifying...' : 
               verificationStatus.civic === 'verified' ? 'Verified ✓' : 
               'Verify with Civic'}
            </Button>
          </CardContent>
        </Card>

        {/* Worldcoin Verification */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(verificationStatus.worldcoin)}
                <CardTitle className="text-white">Worldcoin Verification</CardTitle>
              </div>
              {getStatusBadge(verificationStatus.worldcoin)}
            </div>
            <CardDescription className="text-gray-300">
              Prove your humanity using Worldcoin's World ID system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-400">
              <p>✓ Proof of personhood</p>
              <p>✓ Iris biometric scan</p>
              <p>✓ Zero-knowledge proofs</p>
            </div>
            <Button
              onClick={handleWorldcoinVerification}
              disabled={!isConnected || loading.worldcoin || verificationStatus.worldcoin === 'verified'}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading.worldcoin ? 'Verifying...' : 
               verificationStatus.worldcoin === 'verified' ? 'Verified ✓' : 
               'Verify with Worldcoin'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ZK-ID Badge Preview */}
      {(verificationStatus.civic === 'verified' || verificationStatus.worldcoin === 'verified') && (
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Shield className="h-6 w-6 text-purple-400" />
              <span>Your ZK-ID Badges</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Soulbound NFTs representing your verified identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              {verificationStatus.civic === 'verified' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm text-white">Civic Badge</p>
                </div>
              )}
              {verificationStatus.worldcoin === 'verified' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-2">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm text-white">Worldcoin Badge</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ZKVerification;