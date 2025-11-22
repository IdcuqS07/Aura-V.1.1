# 🧠 AI Risk Oracle - Explained

## 🎯 Apa itu AI Oracle?

**AI Risk Oracle** adalah **flagship feature** dari Aura Protocol - sistem AI yang memprediksi **risk score** (tingkat risiko) seorang user berdasarkan data on-chain dan off-chain mereka.

### Tagline:
> **"The Future of Trust is Trustless — and It Starts with Aura"**

---

## 💡 Konsep Dasar

### Problem yang Dipecahkan:
**DeFi Lending** saat ini:
- ❌ Tidak tahu siapa yang bisa dipercaya
- ❌ Semua user diperlakukan sama
- ❌ Butuh over-collateralization (150-200%)
- ❌ Tidak ada credit scoring

**Dengan AI Oracle:**
- ✅ Prediksi risk score otomatis
- ✅ Personalized lending terms
- ✅ Lower collateral untuk trusted users
- ✅ On-chain credit scoring

---

## 🔬 Cara Kerja

### Input Data:
```javascript
{
  poh_score: 80,           // Proof of Humanity score (0-100)
  badge_count: 3,          // Number of verification badges
  onchain_activity: 50,    // Transaction count
  credit_score: 650,       // Current credit score
  account_age_days: 90,    // Account age
  score_history: [600, 625, 650]  // Score trend
}
```

### AI Model Processing:
```
Weighted Features:
- PoH Score:        35% weight
- Badge Count:      20% weight
- On-chain Activity: 25% weight
- Account Age:      10% weight
- Score Velocity:   10% weight

Trust Score = Σ(feature × weight) × 100
Risk Score = 100 - Trust Score
```

### Output:
```javascript
{
  risk_score: 25.5,        // 0-100 (lower = less risky)
  risk_level: "low",       // low/medium/high
  trust_score: 74.5,       // Inverse of risk
  confidence: 0.85,        // Prediction confidence
  factors: {               // Risk factors identified
    low_poh_score: {...},
    few_badges: {...}
  }
}
```

---

## 🎯 Use Cases

### 1. DeFi Lending (Primary)
```javascript
// User requests $1000 loan
const risk = await oracle.getRiskScore(userAddress);

if (risk.risk_score <= 30) {
  // Low risk user
  maxLoan: $1500
  interestRate: 5%
  collateralRatio: 110%
  
} else if (risk.risk_score <= 60) {
  // Medium risk user
  maxLoan: $1000
  interestRate: 8%
  collateralRatio: 130%
  
} else {
  // High risk user
  maxLoan: $500
  interestRate: 12%
  collateralRatio: 150%
}
```

### 2. Access Control
```javascript
// Premium features for trusted users
if (risk.risk_score < 30) {
  grantPremiumAccess();
  enableHigherLimits();
}
```

### 3. Reputation System
```javascript
// Display trust badge
if (risk.trust_score > 70) {
  showTrustedBadge();
}
```

### 4. Insurance Pricing
```javascript
// Lower premiums for low-risk users
premium = basePremium * (1 + risk.risk_score / 100);
```

---

## 📊 Risk Levels

### Low Risk (0-30)
```
✅ Highly trustworthy
✅ Favorable lending terms
✅ Lower collateral required
✅ Better interest rates

Characteristics:
- High PoH score (>70)
- Multiple badges (3+)
- Active on-chain history
- Stable credit score
```

### Medium Risk (31-60)
```
⚠️ Moderate risk
⚠️ Standard lending terms
⚠️ Normal collateral
⚠️ Standard interest rates

Characteristics:
- Medium PoH score (40-70)
- Some badges (1-2)
- Limited on-chain activity
- Average credit score
```

### High Risk (61-100)
```
❌ High risk
❌ Strict lending terms
❌ High collateral required
❌ Higher interest rates

Characteristics:
- Low PoH score (<40)
- Few/no badges
- Minimal on-chain activity
- Low/declining credit score
```

---

## 🔍 Risk Factors Identified

### 1. Low PoH Score
```
Severity: HIGH
Impact: 35%
Description: Low Proof of Humanity score indicates 
             potential bot/fake account
```

### 2. Few Badges
```
Severity: MEDIUM
Impact: 20%
Description: Limited verification badges reduce trust
```

### 3. Low On-chain Activity
```
Severity: MEDIUM
Impact: 25%
Description: Minimal on-chain activity history
```

### 4. New Account
```
Severity: LOW
Impact: 10%
Description: Recently created account
```

### 5. Declining Score
```
Severity: HIGH
Impact: 10%
Description: Credit score trending downward
```

---

## 🚀 API Endpoints

### 1. Get Risk Score
```bash
POST /api/oracle/risk-score
{
  "wallet_address": "0x..."
}

Response:
{
  "success": true,
  "prediction": {
    "risk_score": 25.5,
    "risk_level": "low",
    "trust_score": 74.5,
    "confidence": 0.85,
    "factors": {...}
  }
}
```

### 2. Get Lending Recommendation
```bash
POST /api/oracle/lending-recommendation
{
  "wallet_address": "0x...",
  "loan_amount": 1000
}

Response:
{
  "success": true,
  "risk_assessment": {...},
  "lending_recommendation": {
    "approved": true,
    "max_loan_amount": 1500,
    "interest_rate": 5.0,
    "collateral_ratio": 110,
    "recommendation": "Highly trustworthy. Approve with favorable terms."
  }
}
```

### 3. Get Risk History
```bash
GET /api/oracle/risk-history/{wallet_address}?limit=10

Response:
{
  "success": true,
  "predictions": [
    {
      "prediction": {...},
      "created_at": "2025-01-20T10:30:00Z"
    }
  ]
}
```

### 4. Get Oracle Stats
```bash
GET /api/oracle/stats

Response:
{
  "total_predictions": 1247,
  "risk_distribution": {
    "low": 450,
    "medium": 620,
    "high": 177
  },
  "model_version": "1.0.0"
}
```

---

## 🎨 Frontend UI

### Risk Score Display
```
┌─────────────────────────────────────┐
│  🧠 AI RISK SCORE                   │
│                                     │
│     25.5                            │
│     LOW RISK                        │
│                                     │
│  Trust Score: 74.5                  │
│  Confidence: 85%                    │
│                                     │
│  Risk Factors:                      │
│  ✓ High PoH Score                   │
│  ✓ Multiple Badges                  │
│  ⚠ Limited Activity                 │
└─────────────────────────────────────┘
```

### Color Coding
- **Green**: Low risk (0-30)
- **Yellow**: Medium risk (31-60)
- **Red**: High risk (61-100)

---

## 🔧 Implementation

### Backend (Python)
```python
# ai_risk_oracle.py
class AIRiskOracle:
    def predict_risk_score(self, user_data):
        # Extract features
        features = self._extract_features(user_data)
        
        # Calculate trust score
        trust_score = self._calculate_trust_score(features)
        
        # Risk = inverse of trust
        risk_score = 100 - trust_score
        
        return {
            'risk_score': risk_score,
            'risk_level': self._get_risk_level(risk_score),
            'confidence': self._calculate_confidence(features)
        }
```

### Frontend (React)
```javascript
// RiskOracle.js
const getRiskScore = async () => {
  const response = await fetch('/api/oracle/risk-score', {
    method: 'POST',
    body: JSON.stringify({ wallet_address: address })
  });
  
  const data = await response.json();
  setPrediction(data.prediction);
};
```

---

## 📈 Future Enhancements

### Phase 1 (Current)
- ✅ Rule-based model
- ✅ Basic risk scoring
- ✅ Lending recommendations

### Phase 2 (Planned)
- 🔄 Machine Learning model (trained)
- 🔄 More data sources
- 🔄 Real-time updates

### Phase 3 (Future)
- 🔄 Deep learning model
- 🔄 Cross-chain data
- 🔄 Social graph analysis
- 🔄 Behavioral patterns

---

## 💼 Business Value

### For Users:
- ✅ Lower collateral requirements
- ✅ Better interest rates
- ✅ Access to more services
- ✅ Build on-chain reputation

### For Protocols:
- ✅ Reduce default risk
- ✅ Optimize capital efficiency
- ✅ Attract quality users
- ✅ Competitive advantage

### For Ecosystem:
- ✅ More efficient DeFi
- ✅ Better user experience
- ✅ Increased adoption
- ✅ Sustainable growth

---

## 🎯 Key Differentiators

### vs Traditional Credit Scoring:
- ✅ On-chain (transparent)
- ✅ Real-time updates
- ✅ No personal data needed
- ✅ Global access

### vs Other DeFi Solutions:
- ✅ AI-powered (not just rules)
- ✅ Multi-factor analysis
- ✅ Confidence scoring
- ✅ Actionable recommendations

---

## 📊 Example Scenarios

### Scenario 1: Trusted User
```
Input:
- PoH Score: 85
- Badges: 4
- Activity: 75 transactions
- Age: 180 days

Output:
- Risk Score: 18.5 (LOW)
- Trust Score: 81.5
- Recommendation: Approve $1500 at 5% APR
```

### Scenario 2: New User
```
Input:
- PoH Score: 60
- Badges: 1
- Activity: 10 transactions
- Age: 15 days

Output:
- Risk Score: 55.0 (MEDIUM)
- Trust Score: 45.0
- Recommendation: Approve $1000 at 8% APR
```

### Scenario 3: Risky User
```
Input:
- PoH Score: 30
- Badges: 0
- Activity: 2 transactions
- Age: 5 days

Output:
- Risk Score: 78.5 (HIGH)
- Trust Score: 21.5
- Recommendation: Require 150% collateral or decline
```

---

## ✅ Summary

**AI Risk Oracle adalah:**
- 🧠 AI-powered risk assessment
- 📊 Multi-factor analysis
- 🎯 Personalized recommendations
- 🔗 On-chain & transparent
- 🚀 Flagship feature of Aura Protocol

**Tujuan:**
Membuat DeFi lending lebih efisien dengan memberikan **trust score** yang akurat untuk setiap user, sehingga:
- User terpercaya dapat pinjam dengan collateral lebih rendah
- Protocol dapat mengurangi risiko default
- Ecosystem DeFi menjadi lebih sustainable

---

**"The Future of Trust is Trustless — and It Starts with Aura"** 🚀
