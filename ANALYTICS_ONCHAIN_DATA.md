# 📊 Analytics - On-Chain Data

## ✅ Fitur Baru: Real On-Chain Analytics

Analytics Dashboard sekarang bisa menampilkan **data real dari blockchain**!

---

## 🎯 Apa yang Berubah?

### Before:
```
❌ Hanya mock/demo data
❌ Data tidak real
❌ Tidak terhubung ke smart contract
```

### After:
```
✅ Data real dari Polygon Amoy blockchain
✅ Fetch langsung dari smart contracts
✅ Toggle antara On-Chain dan Demo data
✅ Up-to-date dengan blockchain state
```

---

## 🔗 Data Sources

### 1. On-Chain Data (Real)
```
Source: Polygon Amoy Testnet
Contracts:
- SimpleZKBadge: 0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678
- CreditPassport: 0x1112373c9954B9bbFd91eb21175699b609A1b551
- ProofRegistry: 0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B

Data:
✅ Total badges minted (from contract)
✅ Total passports minted (from contract)
✅ Current block number
✅ Real user count
✅ Actual on-chain metrics
```

### 2. Demo Data (Mock)
```
Source: Backend mock data
Purpose: Testing & demonstration
Data:
- Simulated metrics
- Random variations
- For UI/UX testing
```

---

## 🎮 How to Use

### Toggle Data Source:

```
┌─────────────────────────────────────┐
│  Analytics Dashboard                │
│                                     │
│  [On-Chain] [Demo]  🟢 ON-CHAIN    │
└─────────────────────────────────────┘
```

**On-Chain Button:**
- Shows real data from blockchain
- Green indicator when connected
- Red indicator if offline

**Demo Button:**
- Shows mock/simulated data
- Yellow indicator
- For testing purposes

---

## 📊 On-Chain Metrics

### What's Fetched from Blockchain:

#### 1. Total Badges
```javascript
// From SimpleZKBadge contract
totalBadges = await badgeContract.totalSupply()
```
- Real count of minted badges
- Updated from blockchain

#### 2. Total Passports
```javascript
// From CreditPassport contract
totalPassports = await passportContract.totalSupply()
```
- Real count of minted passports
- Each passport = 1 user (soulbound)

#### 3. Total Users
```
totalUsers = totalPassports
```
- Since passports are soulbound (1 per user)
- Direct mapping from passport count

#### 4. Verified Users
```
verifiedUsers = totalPassports * 0.7
```
- Estimated as 70% of passport holders
- Users who completed verification

#### 5. Block Number
```javascript
blockNumber = await web3.eth.blockNumber
```
- Current Polygon Amoy block
- Shows blockchain is live

---

## 🔧 Technical Implementation

### Backend (Python + Web3):

```python
# onchain_analytics.py
from web3 import Web3

class OnChainAnalytics:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(
            "https://rpc-amoy.polygon.technology"
        ))
        self.badge_contract = self.w3.eth.contract(
            address=BADGE_ADDRESS,
            abi=BADGE_ABI
        )
        self.passport_contract = self.w3.eth.contract(
            address=PASSPORT_ADDRESS,
            abi=PASSPORT_ABI
        )
    
    async def get_analytics(self):
        # Fetch from blockchain
        total_badges = self.badge_contract.functions.totalSupply().call()
        total_passports = self.passport_contract.functions.totalSupply().call()
        
        return {
            "total_badges": total_badges,
            "total_passports": total_passports,
            "total_users": total_passports,
            "data_source": "on-chain",
            "status": "live"
        }
```

### API Endpoints:

```bash
# On-chain data (real)
GET /api/analytics/onchain

# Demo data (mock)
GET /api/analytics
```

### Frontend (React):

```javascript
// Toggle between data sources
const [dataSource, setDataSource] = useState('onchain');

const loadAnalytics = async () => {
  const endpoint = dataSource === 'onchain' 
    ? '/api/analytics/onchain' 
    : '/api/analytics';
  
  const response = await fetch(`${BACKEND_URL}${endpoint}`);
  const data = await response.json();
  
  setAnalytics(data);
};
```

---

## 📈 Data Displayed

### On-Chain Mode:
```
┌─────────────────────────────────────┐
│  Total Users: 15                    │
│  (from passport contract)           │
│                                     │
│  Total Badges: 23                   │
│  (from badge contract)              │
│                                     │
│  Total Passports: 15                │
│  (from passport contract)           │
│                                     │
│  Block: #28,945,123                 │
│  Network: Polygon Amoy              │
│  Status: 🟢 ON-CHAIN                │
└─────────────────────────────────────┘
```

### Demo Mode:
```
┌─────────────────────────────────────┐
│  Total Users: 1,297                 │
│  (simulated data)                   │
│                                     │
│  Total Badges: 1,834                │
│  (simulated data)                   │
│                                     │
│  Total Passports: 756               │
│  (simulated data)                   │
│                                     │
│  Status: 🟡 DEMO                    │
└─────────────────────────────────────┘
```

---

## 🔍 Status Indicators

### 🟢 ON-CHAIN (Green)
```
✅ Connected to Polygon Amoy
✅ Data fetched from smart contracts
✅ Real blockchain data
✅ Up-to-date metrics
```

### 🔴 OFFLINE (Red)
```
❌ Cannot connect to blockchain
❌ RPC endpoint unavailable
❌ Network issues
❌ Fallback to demo data
```

### 🟡 DEMO (Yellow)
```
⚠️ Using mock data
⚠️ For testing purposes
⚠️ Not real blockchain data
⚠️ Simulated metrics
```

---

## 🚀 Benefits

### For Users:
- ✅ See real adoption metrics
- ✅ Verify data on blockchain
- ✅ Trust in transparency
- ✅ Real-time blockchain state

### For Developers:
- ✅ Test with real data
- ✅ Verify contract integration
- ✅ Debug on-chain issues
- ✅ Monitor contract state

### For Protocol:
- ✅ Transparent metrics
- ✅ Verifiable data
- ✅ On-chain proof
- ✅ Trustless analytics

---

## 📝 Contract Functions Used

### SimpleZKBadge:
```solidity
function totalSupply() external view returns (uint256)
function getUserBadges(address user) external view returns (uint256[])
```

### CreditPassport:
```solidity
function totalSupply() external view returns (uint256)
function getPassport(address user) external view returns (Passport)
```

---

## ⚙️ Configuration

### RPC Endpoint:
```
https://rpc-amoy.polygon.technology
```

### Contract Addresses:
```javascript
BADGE_CONTRACT = "0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678"
PASSPORT_CONTRACT = "0x1112373c9954B9bbFd91eb21175699b609A1b551"
PROOF_REGISTRY = "0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B"
```

### Network:
```
Network: Polygon Amoy Testnet
Chain ID: 80002
```

---

## 🧪 Testing

### Test On-Chain Data:

1. **Open Analytics Page**
   ```
   http://localhost:3030/analytics
   ```

2. **Click "On-Chain" Button**
   - Should show green indicator
   - Data fetched from blockchain

3. **Verify Data**
   - Check PolygonScan for contract state
   - Compare with displayed metrics
   - Verify block number

4. **Test Demo Mode**
   - Click "Demo" button
   - Should show yellow indicator
   - Data is simulated

---

## 🔄 Auto-Refresh

### On-Chain Mode:
```
Refresh: Every 30 seconds
Reason: Blockchain data doesn't change frequently
```

### Demo Mode:
```
Refresh: Every 10 seconds
Reason: Show dynamic updates for demo
```

---

## ⚠️ Limitations

### Current:
- Average credit score is estimated (not queried from all passports)
- Risk distribution is calculated (not from individual passport queries)
- Some metrics are derived (not direct contract calls)

### Reason:
- Querying all passports would be expensive (gas/time)
- Better to use The Graph for complex queries
- Current approach balances accuracy and performance

### Future:
- Integrate The Graph for detailed analytics
- Query individual passport data
- Real-time credit score averages
- Historical data tracking

---

## ✅ Summary

**Analytics Dashboard sekarang menampilkan data real dari blockchain!**

**Features:**
- ✅ Toggle On-Chain / Demo data
- ✅ Real metrics from smart contracts
- ✅ Status indicators
- ✅ Block number display
- ✅ Up-to-date blockchain state

**Access:**
```
http://localhost:3030/analytics
```

**Toggle:**
- Click "On-Chain" for real data
- Click "Demo" for simulated data

**Status:** ✅ Working & Live

---

**"Transparent Analytics, Powered by Blockchain"** 🔗
