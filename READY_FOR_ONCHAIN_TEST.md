# ✅ Ready for On-Chain Testing!

## 🎯 Status: SIAP TEST ON-CHAIN

### ✅ Yang Sudah Siap:

1. **Smart Contracts** ✅
   - SimpleZKBadge: Deployed
   - CreditPassport: Deployed  
   - ProofRegistry: Deployed
   - SimpleZKBadgeV2: Deployed

2. **Backend** ✅
   - Running on port 8080
   - Fast mode (mock data)
   - Contract addresses configured

3. **Frontend** ✅
   - Running on port 3030
   - Contract addresses updated
   - Web3 integration ready

4. **Network** ✅
   - Polygon Amoy Testnet
   - RPC configured
   - Explorer links ready

---

## 🚀 Cara Test On-Chain (3 Steps)

### Step 1: Setup Wallet (5 menit)

#### A. Install MetaMask
```
https://metamask.io/
```

#### B. Add Polygon Amoy Network
**Quick Add ke MetaMask:**
1. Buka MetaMask
2. Click network dropdown (atas)
3. Click "Add Network"
4. Pilih "Add a network manually"
5. Isi:
   ```
   Network Name: Polygon Amoy Testnet
   RPC URL: https://rpc-amoy.polygon.technology
   Chain ID: 80002
   Currency: MATIC
   Explorer: https://amoy.polygonscan.com
   ```
6. Save

#### C. Get Testnet MATIC
```
1. Buka: https://faucet.polygon.technology/
2. Connect wallet
3. Select "Polygon Amoy"
4. Request tokens
5. Wait ~1 minute
```

---

### Step 2: Connect ke Aplikasi (1 menit)

1. Buka: **http://localhost:3030**
2. Click "Connect Wallet" button
3. Pilih MetaMask
4. Approve connection
5. Pastikan network: "Polygon Amoy"

---

### Step 3: Test Features (5 menit)

#### Test A: Mint Credit Passport
```
1. Navigate ke "Credit Passport" atau "Dashboard"
2. Click "Mint Passport" button
3. Approve transaction di MetaMask
4. Wait for confirmation (~10 seconds)
5. ✅ Passport minted!
```

**Verify:**
- Check credit score di app
- View di PolygonScan: https://amoy.polygonscan.com/address/YOUR_WALLET

#### Test B: View Badges
```
1. Navigate ke "Badges" page
2. View your badges (if any)
3. Check badge details
```

#### Test C: Check Analytics
```
1. Navigate ke "Analytics" page
2. View ecosystem stats
3. See your position
```

---

## 📋 Contract Addresses (Copy-Paste Ready)

```javascript
// Main Contracts
const BADGE_ADDRESS = "0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678";
const PASSPORT_ADDRESS = "0x1112373c9954B9bbFd91eb21175699b609A1b551";
const PROOF_ADDRESS = "0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B";

// V2 Contract
const BADGE_V2_ADDRESS = "0x3d586E681b12B07825F17Ce19B28e1F576a1aF89";
```

### Explorer Links
```
Badge:    https://amoy.polygonscan.com/address/0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678
Passport: https://amoy.polygonscan.com/address/0x1112373c9954B9bbFd91eb21175699b609A1b551
Proof:    https://amoy.polygonscan.com/address/0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B
```

---

## 🎯 What You Can Test

### ✅ Credit Passport
- [x] Mint your own passport (permissionless)
- [x] View credit score (0-1000)
- [x] Check passport details
- [x] Verify soulbound (cannot transfer)

### ✅ Badges
- [x] View badges
- [x] Check badge ownership
- [x] Verify on-chain data

### ✅ On-Chain Verification
- [x] View transactions on PolygonScan
- [x] Check NFT ownership
- [x] Verify contract interactions

---

## 🔧 Quick Verification

### Check if Contracts are Live:
```bash
# Run test script
node test-contracts-live.js
```

### Manual Check:
```
1. Buka: https://amoy.polygonscan.com/address/0x1112373c9954B9bbFd91eb21175699b609A1b551
2. Tab "Contract" harus ada
3. Tab "Read Contract" untuk query data
4. Tab "Write Contract" untuk interact
```

---

## 📊 Expected Results

### After Minting Passport:
```
✅ Transaction confirmed
✅ NFT minted to your wallet
✅ Credit score calculated
✅ Visible on PolygonScan
✅ Shows in app dashboard
```

### Credit Score Example:
```
PoH Score: 80
Badges: 2
Calculation: (80 × 4) + (2 × 50) = 420
Final Score: 420/1000
Grade: Fair
```

---

## ⚠️ Troubleshooting

### "Insufficient funds"
**Fix:** Get more MATIC from faucet

### "Wrong network"
**Fix:** Switch MetaMask to Polygon Amoy

### "Transaction failed"
**Fix:** 
- Increase gas limit
- Check if passport already exists
- Verify wallet has MATIC

### "Cannot connect wallet"
**Fix:**
- Refresh page
- Reconnect MetaMask
- Check if MetaMask is unlocked

---

## 📚 Documentation

- **Full Guide**: `ONCHAIN_TESTING_GUIDE.md`
- **Contract Details**: `SMART_CONTRACTS_OVERVIEW.md`
- **Quick Reference**: `CONTRACTS_QUICK_REF.md`
- **This File**: `READY_FOR_ONCHAIN_TEST.md`

---

## ✅ Pre-Flight Checklist

Before testing:
- [ ] MetaMask installed
- [ ] Polygon Amoy network added
- [ ] Testnet MATIC received
- [ ] Frontend running (http://localhost:3030)
- [ ] Backend running (http://localhost:8080)
- [ ] Wallet connected to app

Ready to test:
- [ ] On Polygon Amoy network
- [ ] Have testnet MATIC (>0.1)
- [ ] Wallet connected
- [ ] App loaded successfully

---

## 🎉 You're Ready!

**Everything is set up and ready for on-chain testing!**

**Next Steps:**
1. ✅ Get testnet MATIC (5 min)
2. ✅ Connect wallet (1 min)
3. ✅ Mint passport (2 min)
4. ✅ Test features (5 min)

**Total Time: ~15 minutes**

---

## 🔗 Quick Links

- **App**: http://localhost:3030
- **API**: http://localhost:8080/docs
- **Faucet**: https://faucet.polygon.technology/
- **Explorer**: https://amoy.polygonscan.com/
- **MetaMask**: https://metamask.io/

---

**Happy Testing! 🚀**

*Semua smart contracts sudah deployed dan siap digunakan!*
