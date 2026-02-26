# Wave 6 Frontend Integration - Minimal Updates

## 🎯 Required Frontend Updates for Wave 6

### 1. Network Selector Enhancement
```javascript
// Update existing network display to show all 5 chains
const NetworkSelector = () => {
  const networks = [
    { id: 'polygon-amoy', name: 'Polygon Amoy', color: '🟣', chainId: 80002 },
    { id: 'ethereum-sepolia', name: 'Ethereum Sepolia', color: '🔵', chainId: 11155111 },
    { id: 'bsc-testnet', name: 'BSC Testnet', color: '🟡', chainId: 97 },
    { id: 'arbitrum-sepolia', name: 'Arbitrum Sepolia', color: '🔷', chainId: 421614 },
    { id: 'optimism-sepolia', name: 'Optimism Sepolia', color: '🔴', chainId: 11155420 }
  ];

  return (
    <Select defaultValue="polygon-amoy">
      {networks.map(network => (
        <SelectItem key={network.id} value={network.id}>
          {network.color} {network.name}
        </SelectItem>
      ))}
    </Select>
  );
};
```

### 2. Cross-Chain Passport Display
```javascript
// Update passport page to show cross-chain data
const CrossChainPassport = ({ wallet }) => {
  const [passportData, setPassportData] = useState(null);

  useEffect(() => {
    if (wallet) {
      fetch(`/api/multichain/passport/${wallet}`)
        .then(res => res.json())
        .then(setPassportData);
    }
  }, [wallet]);

  if (!wallet) {
    return (
      <div className="text-center p-8">
        Connect wallet to view cross-chain passport data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Canonical Passport */}
      <Card>
        <CardHeader>
          <h2>Your Cross-Chain Passport</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>Credit Score: {passportData?.canonical_passport?.creditScore}</div>
            <div>Source Chain: {passportData?.canonical_passport?.source_chain}</div>
          </div>
        </CardContent>
      </Card>

      {/* Chain Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(passportData?.all_chains || {}).map(([chain, data]) => (
          <Card key={chain}>
            <CardHeader>
              <h3>{chain}</h3>
            </CardHeader>
            <CardContent>
              {data.error ? (
                <div className="text-red-500">Not available</div>
              ) : (
                <div>Score: {data.creditScore}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

### 3. Add Cross-Chain Explorer to Navigation
```javascript
// Add new menu item
const Navigation = () => {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/verify">Verify</Link>
      <Link to="/passport">Passport</Link>
      <Link to="/explorer">Explorer</Link> {/* NEW */}
      <Link to="/ai-oracle">AI Oracle</Link>
      <Link to="/developer">Developer</Link>
    </nav>
  );
};
```

### 4. Simple Cross-Chain Explorer Page
```javascript
// New page: /explorer
const ExplorerPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    if (searchTerm.length === 42) {
      // Wallet address
      const res = await fetch(`/api/multichain/passport/${searchTerm}`);
      setResult(await res.json());
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cross-Chain Explorer</h1>
      
      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Enter wallet address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {result && (
        <div className="space-y-4">
          <h2>Passport Data for {searchTerm}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(result.all_chains).map(([chain, data]) => (
              <Card key={chain}>
                <CardHeader>
                  <h3>{chain}</h3>
                </CardHeader>
                <CardContent>
                  {data.error ? (
                    <div className="text-gray-500">No data</div>
                  ) : (
                    <div>
                      <div>Credit Score: {data.creditScore}</div>
                      <div>Last Updated: {new Date(data.lastUpdated * 1000).toLocaleDateString()}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## 🔄 Integration Steps

### Step 1: Update Network Display
Replace current single network display with multi-network selector

### Step 2: Enhance Passport Page
Update passport page to fetch and display cross-chain data

### Step 3: Add Explorer Route
Add new route `/explorer` to App.js

### Step 4: Update Navigation
Add "Explorer" link to main navigation

## 📱 Minimal UI Changes

### Current State:
```
🟣 Polygon Amoy 0xa94d...e55d
```

### Updated State:
```
[🟣 Polygon Amoy ▼] 0xa94d...e55d
```

### New Navigation:
```
Home | Verify | Passport | Explorer | AI Oracle | Developer
```

## 🎯 Wave 6 Frontend Features

1. **Multi-Network Selector**: Choose between 5 networks
2. **Cross-Chain Passport View**: See passport data from all chains
3. **Simple Explorer**: Search wallet addresses across chains
4. **Sync Status**: Show which chains are in sync

These minimal changes integrate Wave 6's cross-chain capabilities into the existing UI without major redesign.