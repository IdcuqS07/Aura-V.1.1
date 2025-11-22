import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Zap, Server } from 'lucide-react';
import { useWallet } from '@/components/WalletContext';
import { mintBadgeSmart, checkMinterStatus } from '@/utils/badgeMinting';

const MintBadgeButton = ({ badgeType, zkProofHash, onSuccess }) => {
  const { address, isConnected } = useWallet();
  const [minting, setMinting] = useState(false);
  const [result, setResult] = useState(null);
  const [minterStatus, setMinterStatus] = useState(null);

  useEffect(() => {
    if (isConnected && address) {
      checkMinterStatus(address).then(setMinterStatus);
    }
  }, [isConnected, address]);

  const handleMint = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setMinting(true);
    setResult(null);

    try {
      const mintResult = await mintBadgeSmart(badgeType, zkProofHash);
      setResult(mintResult);

      if (mintResult.success && onSuccess) {
        onSuccess(mintResult);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Minter Status */}
      {minterStatus && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-300">
                  Permissionless minting (you pay gas)
                </span>
              </div>
              <Badge variant="default" className="bg-green-600">
                V2: Trustless
              </Badge>
            </div>
            {!minterStatus.canMintNow && (
              <div className="mt-2 text-xs text-yellow-400">
                ⏳ Cooldown: {Math.ceil(minterStatus.cooldownRemaining / 60)} minutes remaining
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mint Button */}
      <Button
        onClick={handleMint}
        disabled={minting || !isConnected}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {minting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Minting Badge...
          </>
        ) : (
          'Mint ZK-ID Badge'
        )}
      </Button>

      {/* Result Display */}
      {result && (
        <Card className={`border ${
          result.success 
            ? 'bg-green-900/20 border-green-500/50' 
            : 'bg-red-900/20 border-red-500/50'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              )}
              
              <div className="flex-1 space-y-2">
                <p className={`font-medium ${
                  result.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {result.success ? 'Badge Minted Successfully!' : 'Minting Failed'}
                </p>

                {result.success && (
                  <>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Method:</span>
                        <Badge variant="outline">
                          {result.method === 'user-controlled' ? (
                            <><Zap className="h-3 w-3 mr-1" /> User Paid</>
                          ) : (
                            <><Server className="h-3 w-3 mr-1" /> Backend Paid</>
                          )}
                        </Badge>
                      </div>
                      
                      {result.tokenId && (
                        <div className="flex justify-between">
                          <span>Token ID:</span>
                          <span className="font-mono">#{result.tokenId}</span>
                        </div>
                      )}
                      
                      {result.gasFee && (
                        <div className="flex justify-between">
                          <span>Gas Fee:</span>
                          <span className="font-mono">{result.gasFee}</span>
                        </div>
                      )}
                      
                      {result.txHash && (
                        <div className="flex justify-between">
                          <span>Transaction:</span>
                          <a
                            href={`https://amoy.polygonscan.com/tx/${result.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-mono text-xs"
                          >
                            {result.txHash.slice(0, 10)}...{result.txHash.slice(-8)}
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {!result.success && result.error && (
                  <p className="text-sm text-red-300">{result.error}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <div className="text-xs text-gray-400 text-center">
        V2: Fully permissionless • You pay gas (~0.001 MATIC) • 1 hour cooldown
      </div>
    </div>
  );
};

export default MintBadgeButton;
