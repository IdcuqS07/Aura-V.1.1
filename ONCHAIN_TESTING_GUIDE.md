# 🔗 On-Chain Testing Guide

## ✅ Status Saat Ini

**Backend**: ✅ Running (Port 8080)  
**Frontend**: ✅ Running (Port 3030)  
**Smart Contracts**: ✅ Deployed on Polygon Amoy

---

## 🎯 Yang Bisa Ditest On-Chain

### 1. ✅ Credit Passport Minting
- User bisa mint passport sendiri (permissionless)
- Credit score dihitung otomatis
- NFT soulbound (tidak bisa ditransfer)

### 2. ✅ Badge Verification
- Cek badge yang dimiliki user
- Verify on-chain badge data
- Badge soulbound

### 3. ✅ Credit Score Lookup
- Query credit score dari blockchain
- Lihat passport details
- Check on-chain history

---

## 📋 Persiapan Testing

### Step 1: Setup Wallet (MetaMask)

#### A. Install MetaMask
```
Download: https://metamask.io/
```

#### B. Add Polygon Amoy Network
```
Network Name: Polygon Amoy Testnet
RPC URL: https://rpc-amoy.polygon.technology
Chain ID: 80002
Currency Symbol: MATIC
Block Explorer: https://amoy.polygonscan.com
```

**Quick Add:**
1. Buka MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Click "Add a network manually"
5. Isi data di atas
6. Save

#### C. Get Testnet MATIC
```
Faucet: https://faucet.polygon.technology/
1. Connect wallet
2. Select "Polygon Amoy"
3. Request tokens
4. Wait ~1 minute
```

---

### Step 2: Connect Wallet ke Aplikasi

1. Buka: **http://localhost:3030**
2. Click "Connect Wallet"
3. Pilih MetaMask
4. Approve connection
5. Switch ke Polygon Amoy network

---

## 🧪 Test Scenarios

### Test 1: Mint Credit Passport ✅

**Steps:**
1. Buka http://localhost:3030
2. Connect wallet (MetaMask)
3. Pastikan di Polygon Amoy network
4. Navigate ke "Credit Passport" page
5. Click "Mint Passport"
6. Approve transaction di MetaMask
7. Wait for confirmation

**Expected Result:**
- ✅ Transaction confirmed
- ✅ Passport NFT minted
- ✅ Credit score calculated
- ✅ Visible on-chain

**Verify:**
```
https://amoy.polygonscan.com/address/YOUR_WALLET_ADDRESS
```

---

### Test 2: Check Credit Score ✅

**Steps:**
1. Setelah mint passport
2. Navigate ke "Dashboard" atau "Profile"
3. Lihat credit score Anda
4. Score range: 0-1000

**Score Calculation:**
```
Score = (PoH Score × 4) + (Badge Count × 50) + Bonus + Activity

Example:
- PoH Score: 80
- Badges: 2
- Score = (80 × 4) + (2 × 50) = 320 + 100 = 420
```

**Verify On-Chain:**
```javascript
// Using contract directly
const passport = await passportContract.getPassport(YOUR_ADDRESS);
console.log('Credit Score:', passport.creditScore);
```

---

### Test 3: View Badges ✅

**Steps:**
1. Navigate ke "Badges" page
2. View your badges
3. Check badge details

**Verify On-Chain:**
```
Contract: 0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678
Function: getUserBadges(address)
```

---

### Test 4: Verify Soulbound (Cannot Transfer) ✅

**Steps:**
1. Try to transfer passport NFT
2. Should fail with error

**Expected:**
```
❌ Error: "Soulbound: Transfer not allowed"
```

This proves NFT is non-transferable ✅

---

## 🔧 Testing Tools

### 1. Frontend UI (Recommended)
```
http://localhost:3030
```
- User-friendly interface
- Wallet integration
- Visual feedback

### 2. PolygonScan (Direct)
```
https://amoy.polygonscan.com/address/CONTRACT_ADDRESS
```
- Read contract functions
- Write contract functions
- View transactions

### 3. Hardhat Console (Advanced)
```bash
cd contracts
npx hardhat console --network amoy
```

```javascript
// Get contract
const Passport = await ethers.getContractFactory("CreditPassport");
const passport = await Passport.attach("0x1112373c9954B9bbFd91eb21175699b609A1b551");

// Check passport
const data = await passport.getPassport("YOUR_ADDRESS");
console.log(data);
```

---

## 📊 Contract Addresses untuk Testing

### Main Contracts
```javascript
// Copy-paste untuk testing
const BADGE_ADDRESS = "0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678";
const PASSPORT_ADDRESS = "0x1112373c9954B9bbFd91eb21175699b609A1b551";
const PROOF_ADDRESS = "0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B";
```

### Explorer Links
```
Badge: https://amoy.polygonscan.com/address/0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678
Passport: https://amoy.polygonscan.com/address/0x1112373c9954B9bbFd91eb21175699b609A1b551
Proof: https://amoy.polygonscan.com/address/0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B
```

---

## 🎬 Quick Test Script

Buat file `test-onchain.js`:

```javascript
const { ethers } = require('ethers');

// Setup
const provider = new ethers.providers.JsonRpcProvider(
    'https://rpc-amoy.polygon.technology'
);

const PASSPORT_ADDRESS = '0x1112373c9954B9bbFd91eb21175699b609A1b551';
const PASSPORT_ABI = [
    "function getPassport(address) view returns (tuple(uint256 id, address owner, uint256 creditScore, uint256 pohScore, uint256 badgeCount, uint256 onchainActivity, uint256 issuedAt, uint256 lastUpdated))",
    "function mintPassport(uint256 pohScore, uint256 badgeCount) returns (uint256)"
];

async function testOnChain() {
    // Read passport
    const passport = new ethers.Contract(PASSPORT_ADDRESS, PASSPORT_ABI, provider);
    
    try {
        const data = await passport.getPassport("YOUR_WALLET_ADDRESS");
        console.log('✅ Passport found!');
        console.log('Credit Score:', data.creditScore.toString());
        console.log('PoH Score:', data.pohScore.toString());
        console.log('Badges:', data.badgeCount.toString());
    } catch (error) {
        console.log('❌ No passport found for this address');
    }
}

testOnChain();
```

Run:
```bash
node test-onchain.js
```

---

## ⚠️ Troubleshooting

### Issue 1: "Insufficient funds"
**Solution:** Get more testnet MATIC from faucet

### Issue 2: "Wrong network"
**Solution:** Switch MetaMask to Polygon Amoy

### Issue 3: "Transaction failed"
**Solution:** 
- Check gas limit
- Verify contract address
- Check if passport already exists

### Issue 4: "Cannot read contract"
**Solution:**
- Verify RPC URL
- Check contract address
- Ensure network is Polygon Amoy

---

## ✅ Success Checklist

Before testing on-chain:
- [ ] MetaMask installed
- [ ] Polygon Amoy network added
- [ ] Testnet MATIC received (from faucet)
- [ ] Wallet connected to app
- [ ] On correct network (Amoy)

Ready to test:
- [ ] Frontend running (http://localhost:3030)
- [ ] Backend running (http://localhost:8080)
- [ ] Wallet connected
- [ ] Have testnet MATIC

---

## 🎯 Test Flow (Recommended Order)

1. **Setup** (5 min)
   - Install MetaMask
   - Add Polygon Amoy
   - Get testnet MATIC

2. **Connect** (1 min)
   - Open http://localhost:3030
   - Connect wallet
   - Verify network

3. **Mint Passport** (2 min)
   - Navigate to Passport page
   - Click "Mint Passport"
   - Approve transaction
   - Wait for confirmation

4. **Verify** (1 min)
   - Check credit score in app
   - View on PolygonScan
   - Confirm NFT ownership

5. **Test Features** (5 min)
   - View badges
   - Check analytics
   - Try other features

**Total Time: ~15 minutes**

---

## 🚀 Ready to Test!

**Current Status:**
- ✅ Contracts deployed
- ✅ Backend running
- ✅ Frontend running
- ✅ Network configured

**Next Step:**
1. Get testnet MATIC
2. Connect wallet
3. Start testing!

**Need Help?**
- Check PolygonScan for transaction status
- View console logs in browser (F12)
- Check MetaMask for pending transactions

---

**Happy Testing! 🎉**
