import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/components/WalletContext';
import { Shield, Award, Star, CheckCircle, Globe } from 'lucide-react';
import { ethers } from 'ethers';


  const ZKBadgeDisplay = () => {
    const { address: walletAddress, isConnected } = useWallet();
    const [badges, setBadges] = useState({});
    const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchUserBadges();
    }
  }, [isConnected, walletAddress]);

  const fetchUserBadges = async () => {
  setLoading(true);
  try {
    const badgeData = {};
    
    // Check PoH Badge contract
    const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
    const pohContract = new ethers.Contract(
      '0x7F8b052bD2dfA899E1f41eB7236e818AeE4F6510',
      ['function hasMinted(address) view returns (bool)', 'function badgeTypes(uint256) view returns (string)'],
      provider
    );
    
    const hasPohBadge = await pohContract.hasMinted(walletAddress);
    if (hasPohBadge) {
      badgeData.poh = true;
    }
    
    // Check old badges from SIMPLE_ZK_BADGE
    try {
      const { getUserBadges, getBadgeContract } = await import('../utils/web3');
      const badgeIds = await getUserBadges(walletAddress);
      
      if (badgeIds.length > 0) {
        const contract = await getBadgeContract(true);
        const badgePromises = badgeIds.map(id => contract.badges(id));
        const badgeResults = await Promise.all(badgePromises);
        
        badgeResults.forEach(badge => {
          const type = badge.badgeType.toLowerCase();
          if (type.includes('uniqueness')) badgeData.uniqueness = true;
          if (type.includes('identity')) badgeData.identity = true;
          if (type.includes('reputation')) badgeData.reputation = true;
          if (type.includes('civic')) badgeData.civic = true;
          if (type.includes('worldcoin')) badgeData.worldcoin = true;
        });
      }
    } catch (err) {
      console.log('No old badges found');
    }
    
     setBadges(badgeData);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const badgeConfig = {
    uniqueness: {
      icon: Shield,
      title: 'Proof of Uniqueness',
      description: 'Verified unique identity through trustless ZK proofs',
      color: 'from-purple-500 to-purple-700',
      textColor: 'text-purple-100'
    },
    identity: {
      icon: Award,
      title: 'Identity Verified',
      description: 'Decentralized identity verification via GitHub & Twitter',
      color: 'from-blue-500 to-blue-700',
      textColor: 'text-blue-100'
    },
    reputation: {
      icon: Star,
      title: 'Reputation Badge',
      description: 'High on-chain reputation score achieved',
      color: 'from-yellow-500 to-yellow-700',
      textColor: 'text-yellow-100'
    },
    poh: {
      icon: Shield,
      title: 'Proof of Humanity',
      description: 'Verified human identity through ZK proofs',
      color: 'from-green-500 to-green-700',
      textColor: 'text-green-100'
    }
  };
  

  const BadgeCard = ({ badgeType, config, isOwned }) => {
    const IconComponent = config.icon;
    
    return (
      <Card className={`relative overflow-hidden transition-all duration-300 ${
        isOwned 
          ? `bg-gradient-to-br ${config.color} border-transparent shadow-lg hover:shadow-xl` 
          : 'bg-slate-800/50 border-slate-700 opacity-60'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isOwned ? 'bg-white/20' : 'bg-slate-700'
              }`}>
                <IconComponent className={`h-6 w-6 ${
                  isOwned ? config.textColor : 'text-slate-400'
                }`} />
              </div>
              <div>
                <CardTitle className={`text-lg ${
                  isOwned ? 'text-white' : 'text-slate-400'
                }`}>
                  {config.title}
                </CardTitle>
              </div>
            </div>
            {isOwned && (
              <Badge className="bg-white/20 text-white border-white/30">
                Owned
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className={
            isOwned ? config.textColor : 'text-slate-500'
          }>
            {config.description}
          </CardDescription>
          
          {isOwned && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-white" />
                <span className="text-sm text-white font-medium">
                  Verified on Polygon
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1">
                Soulbound NFT • Non-transferable
              </p>
            </div>
          )}
        </CardContent>
        
        {!isOwned && (
          <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
            <div className="text-center">
              <Shield className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Not Earned</p>
            </div>
          </div>
        )}
      </Card>
    );
  };

  if (!isConnected) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="text-center py-12">
          <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-slate-400">
            Connect your wallet to view your ZK-ID Badges
          </p>
        </CardContent>
      </Card>
    );
  }

  const ownedBadges = Object.entries(badges).filter(([_, owned]) => owned);
  const totalBadges = Object.keys(badgeConfig).length;
  const ownedCount = ownedBadges.length;

  return (
    <div className="pt-20 px-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Your ZK-ID Badges</h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-6">
          Soulbound NFTs representing your verified identity and achievements on the blockchain.
        </p>
        
        {/* Progress */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{ownedCount}</div>
            <div className="text-sm text-gray-400">Badges Earned</div>
          </div>
          <div className="text-gray-500">/</div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">{totalBadges}</div>
            <div className="text-sm text-gray-400">Total Available</div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading badges...</p>
        </div>
      )}

      {/* Badges Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(badgeConfig).map(([badgeType, config]) => (
          <BadgeCard
            key={badgeType}
            badgeType={badgeType}
            config={config}
            isOwned={badges[badgeType] || false}
          />
        ))}
      </div>

      {/* Achievement Summary */}
      {ownedCount > 0 && (
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Award className="h-6 w-6 text-purple-400" />
              <span>Achievement Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-400">{ownedCount}</div>
                <div className="text-sm text-gray-300">Badges Earned</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round((ownedCount / totalBadges) * 100)}%
                </div>
                <div className="text-sm text-gray-300">Completion Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {ownedBadges.some(([type]) => type === 'uniqueness') ? 'Unique' : 'Standard'}
                </div>
                <div className="text-sm text-gray-300">Identity Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {ownedCount < totalBadges && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Earn More Badges</CardTitle>
            <CardDescription className="text-gray-300">
              Complete these verifications to earn additional ZK-ID Badges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!badges.uniqueness && (
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-purple-400" />
                    <span className="text-white">Complete PoH Verification</span>
                  </div>
                  <Badge variant="outline">Available</Badge>
                </div>
              )}
              {!badges.reputation && (
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="text-white">Build On-Chain Reputation</span>
                  </div>
                  <Badge variant="outline">Available</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ZKBadgeDisplay;