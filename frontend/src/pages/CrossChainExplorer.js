import React, { useState, useEffect } from 'react';

const CrossChainExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({});

  const networks = [
    { id: 'polygon-amoy', name: 'Polygon Amoy', color: '🟣' },
    { id: 'ethereum-sepolia', name: 'Ethereum Sepolia', color: '🔵' },
    { id: 'bsc-testnet', name: 'BSC Testnet', color: '🟡' },
    { id: 'arbitrum-sepolia', name: 'Arbitrum Sepolia', color: '🔷' },
    { id: 'optimism-sepolia', name: 'Optimism Sepolia', color: '🔴' }
  ];

  useEffect(() => {
    fetch('/api/crosschain/network-status')
      .then(res => res.json())
      .then(setNetworkStatus)
      .catch(() => {
        // Fallback data
        setNetworkStatus({
          'polygon-amoy': { healthy: true, blockHeight: 12345678, gasPrice: 30, responseTime: 120 },
          'ethereum-sepolia': { healthy: true, blockHeight: 8765432, gasPrice: 25, responseTime: 180 },
          'bsc-testnet': { healthy: true, blockHeight: 9876543, gasPrice: 5, responseTime: 95 },
          'arbitrum-sepolia': { healthy: true, blockHeight: 5432109, gasPrice: 0.1, responseTime: 85 },
          'optimism-sepolia': { healthy: true, blockHeight: 6543210, gasPrice: 0.001, responseTime: 90 }
        });
      });
  }, []);

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/crosschain/search/${searchTerm}`);
      const data = await response.json();
      setSearchResult(data);
    } catch (error) {
      setSearchResult({ type: 'error', message: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Cross-Chain Explorer</h1>
        <p className="text-gray-400 mb-8">
          Search wallet addresses and transactions across all supported networks
        </p>
      </div>

      {/* Search */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter wallet address (0x...) or transaction hash"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-700 rounded border border-gray-600 text-white"
          />
          <button 
            onClick={handleSearch} 
            disabled={loading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Network Status */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Network Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {networks.map(network => {
            const status = networkStatus[network.id];
            return (
              <div key={network.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span>{network.color}</span>
                    <h3 className="font-semibold">{network.name}</h3>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    status?.healthy ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
                {status && (
                  <div className="space-y-1 text-sm text-gray-400">
                    <div>Block: {status.blockHeight?.toLocaleString()}</div>
                    <div>Gas: {status.gasPrice} gwei</div>
                    <div>Response: {status.responseTime}ms</div>
                  </div>
                )}
              </div>
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
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Cross-Chain Passport: {searchResult.wallet}
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-400">Credit Score</div>
                    <div className="text-2xl font-bold">
                      {searchResult.canonical_passport.creditScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Source Chain</div>
                    <div className="text-lg">
                      {searchResult.canonical_passport.source_chain}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(searchResult.all_chains).map(([chain, data]) => (
                    <div key={chain} className="bg-gray-700 rounded p-4">
                      <h4 className="font-medium mb-2">{chain}</h4>
                      {data.error ? (
                        <div className="text-gray-500 text-sm">{data.error}</div>
                      ) : (
                        <div className="space-y-1 text-sm">
                          <div>Score: {data.creditScore}</div>
                          <div>PoH: {data.pohScore}</div>
                          <div>Updated: {new Date(data.lastUpdated * 1000).toLocaleDateString()}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {searchResult.type === 'transaction' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Cross-Chain Transaction</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Source Chain</div>
                    <div>{searchResult.source_chain}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Destination Chain</div>
                    <div>{searchResult.destination_chain}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Transaction Hash</div>
                  <div className="font-mono text-sm break-all">
                    {searchResult.source_tx.hash}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">From</div>
                    <div className="font-mono text-sm">
                      {searchResult.source_tx.from}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">To</div>
                    <div className="font-mono text-sm">
                      {searchResult.source_tx.to}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Status</div>
                  <div className={`inline-block px-2 py-1 rounded text-sm ${
                    searchResult.status === 'completed' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-yellow-600 text-white'
                  }`}>
                    {searchResult.status}
                  </div>
                </div>
              </div>
            </div>
          )}

          {searchResult.type === 'error' && (
            <div className="bg-red-900 rounded-lg p-6">
              <div className="text-red-200">
                Error: {searchResult.message}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Example Searches */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Try These Examples</h3>
        <div className="space-y-2">
          <div>
            <button 
              onClick={() => setSearchTerm('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1')}
              className="text-purple-400 hover:underline font-mono text-sm"
            >
              0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
            </button>
            <span className="text-gray-400 ml-2">- Sample wallet address</span>
          </div>
          <div>
            <button 
              onClick={() => setSearchTerm('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')}
              className="text-purple-400 hover:underline font-mono text-sm"
            >
              0x1234...cdef
            </button>
            <span className="text-gray-400 ml-2">- Sample transaction hash</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossChainExplorer;