import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import { WalletProvider } from '@/components/WalletContext';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import CreditPassport from '@/components/CreditPassport';
import Analytics from '@/components/Analytics';
import Roadmap from '@/components/Roadmap';
import Navigation from '@/components/Navigation';
import ZKBadgeDisplay from '@/components/ZKBadgeDisplay';
import Footer from '@/components/Footer';
import APIDashboard from '@/components/APIDashboard';
import VerifyIdentity from '@/components/VerifyIdentity';
import Waitlist from '@/components/Waitlist';
import AdminWaitlist from '@/components/AdminWaitlist';
import DirectMint from '@/components/DirectMint';
import ProofOfHumanity from '@/components/ProofOfHumanity';
import OnChainData from '@/pages/OnChainData';
import RiskOracle from '@/components/RiskOracle';
import LiveDashboard from '@/components/LiveDashboard';
import EnhancedLiveDashboard from '@/components/EnhancedLiveDashboard';
import ThresholdProof from '@/components/ThresholdProof';

function App() {
  return (
    <WalletProvider>
      <div className="App min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/passport" element={<CreditPassport />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/badges" element={<ZKBadgeDisplay />} />
            <Route path="/api" element={<APIDashboard />} />
            <Route path="/verify" element={<VerifyIdentity />} />

            <Route path="/poh" element={<ProofOfHumanity />} />
            <Route path="/poh/callback" element={<ProofOfHumanity />} />
            <Route path="/onchain" element={<OnChainData />} />
            <Route path="/oracle" element={<RiskOracle />} />
            <Route path="/monitor" element={<LiveDashboard />} />
            <Route path="/monitor/enhanced" element={<EnhancedLiveDashboard />} />
            <Route path="/threshold" element={<ThresholdProof />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
    </WalletProvider>
  );
}

export default App;
