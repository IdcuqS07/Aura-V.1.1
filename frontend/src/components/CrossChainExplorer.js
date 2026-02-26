import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

const CrossChainExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({});

  const networks = [
    { id: 'polygon-amoy', name: 'Polygon Amoy', color: '🟣', chainId: 80002 },
    { id: 'ethereum-sepolia', name: 'Ethereum Sepolia', color: '🔵', chainId: 11155111 },
    { id: 'bsc-testnet', name: 'BSC Testnet', color: '🟡', chainId: 97 },
    { id: 'arbitrum-sepolia', name: 'Arbitrum Sepolia', color: '🔷', chainId: 421614 },
    { id: 'optimism-sepolia', name: 'Optimism Sepolia', color: '🔴', chainId: 11155420 }
  ];

  useEffect(() => {
    // Mock network status
    setNetworkStatus({
      'polygon-amoy': { healthy: true, blockHeight: 12345678, gasPrice: 30, responseTime: 120 },
      'ethereum-sepolia': { healthy: true, blockHeight: 8765432, gasPrice: 25, responseTime: 180 },
      'bsc-testnet': { healthy: true, blockHeight: 9876543, gasPrice: 5, responseTime: 95 },
      'arbitrum-sepolia': { healthy: true, blockHeight: 5432109, gasPrice: 0.1, responseTime: 85 },
      'optimism-sepolia': { healthy: true, blockHeight: 6543210, gasPrice: 0.001, responseTime: 90 }
    });
  }, []);

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setLoading(true);
    try {
      if (searchTerm.startsWith('0x') && searchTerm.length === 42) {
        // Wallet address search
        const mockPassportData = {
          wallet: searchTerm,
          canonical_passport: {
            creditScore: 750,
            pohScore: 85,
            source_chain: 'polygon-amoy',
            lastUpdated: Date.now() / 1000
          },
          all_chains: {
            'polygon-amoy': { creditScore: 750, pohScore: 85, lastUpdated: Date.now() / 1000 },
            'ethereum-sepolia': { error: 'No data' },
            'bsc-testnet': { creditScore: 720, pohScore: 80, lastUpdated: (Date.now() / 1000) - 3600 },
            'arbitrum-sepolia': { error: 'No data' },
            'optimism-sepolia': { error: 'No data' }
          }
        };
        setSearchResult({ type: 'passport', data: mockPassportData });
      } else if (searchTerm.startsWith('0x') && searchTerm.length === 66) {
        // Transaction hash search
        const mockTxData = {
          source_chain: 'polygon-amoy',
          source_tx: {
            hash: searchTerm,
            from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
            to: '0x60741D73B27B17506525aFC9563D9Da7edffEDFD',
            value: '0',
            gasUsed: 150000
          },
          destination_chain: 'ethereum-sepolia',
          status: 'completed',
          type: 'cross_chain'
        };
        setSearchResult({ type: 'transaction', data: mockTxData });
      }
    } catch (error) {
      setSearchResult({ type: 'error', data: { message: error.message } });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Cross-Chain Explorer</h1>
        <p className="text-gray-400 mb-8">
          Search wallet addresses and transactions across all supported networks
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Input
              placeholder="Enter wallet address (0x...) or transaction hash"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Network Status */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Network Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {networks.map(network => {
            const status = networkStatus[network.id];
            return (
              <Card key={network.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{network.color}</span>
                      <h3 className="font-semibold">{network.name}</h3>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      status?.healthy ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                </CardHeader>
                <CardContent>
                  {status && (
                    <div className="space-y-2 text-sm">
                      <div>Block: {status.blockHeight?.toLocaleString()}</div>
                      <div>Gas: {status.gasPrice} gwei</div>
                      <div>Response: {status.responseTime}ms</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Search Results */}
      {searchResult && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Search Results</h2>
          
          {searchResult.type === 'passport' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">
                    Cross-Chain Passport: {searchResult.data.wallet}
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-400">Credit Score</div>
                      <div className="text-2xl font-bold">
                        {searchResult.data.canonical_passport.creditScore}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Source Chain</div>
                      <div className="text-lg">
                        {searchResult.data.canonical_passport.source_chain}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(searchResult.data.all_chains).map(([chain, data]) => (
                      <Card key={chain} className="border">
                        <CardHeader>
                          <h4 className="font-medium">{chain}</h4>
                        </CardHeader>
                        <CardContent>
                          {data.error ? (
                            <div className="text-gray-500 text-sm">{data.error}</div>
                          ) : (
                            <div className="space-y-1 text-sm">
                              <div>Score: {data.creditScore}</div>
                              <div>PoH: {data.pohScore}</div>
                              <div>Updated: {new Date(data.lastUpdated * 1000).toLocaleDateString()}</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {searchResult.type === 'transaction' && (
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Cross-Chain Transaction</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Source Chain</div>
                      <div>{searchResult.data.source_chain}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Destination Chain</div>
                      <div>{searchResult.data.destination_chain}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Transaction Hash</div>
                    <div className="font-mono text-sm break-all">
                      {searchResult.data.source_tx.hash}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">From</div>
                      <div className="font-mono text-sm">
                        {searchResult.data.source_tx.from}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">To</div>
                      <div className="font-mono text-sm">
                        {searchResult.data.source_tx.to}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Status</div>
                    <div className={`inline-block px-2 py-1 rounded text-sm ${
                      searchResult.data.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {searchResult.data.status}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {searchResult.type === 'error' && (
            <Card>
              <CardContent className="p-6">
                <div className="text-red-500">
                  Error: {searchResult.data.message}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Example Searches */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Try These Examples</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <button 
                onClick={() => setSearchTerm('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1')}
                className="text-blue-400 hover:underline font-mono text-sm"
              >
                0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
              </button>
              <span className="text-gray-400 ml-2">- Sample wallet address</span>
            </div>
            <div>
              <button 
                onClick={() => setSearchTerm('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')}
                className="text-blue-400 hover:underline font-mono text-sm"
              >
                0x1234...cdef
              </button>
              <span className="text-gray-400 ml-2">- Sample transaction hash</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossChainExplorer;