import React, { useState } from 'react';
import { useWallet } from './WalletContext';
import { ethers } from 'ethers';


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:9000' : 'http://159.65.134.137:9000');

const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID || '';
const TWITTER_CLIENT_ID = process.env.REACT_APP_TWITTER_CLIENT_ID || '';

export default function ProofOfHumanity() {
  const { address, isConnected } = useWallet();
  const [step, setStep] = useState(1);
  const [enrollmentId, setEnrollmentId] = useState('');
  const [score, setScore] = useState(0);
  const [proofHash, setProofHash] = useState('');
  const [nullifier, setNullifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubVerified, setGithubVerified] = useState(false);
  const [twitterVerified, setTwitterVerified] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  // Check for OAuth callback on mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const code = urlParams.get('code') || hashParams.get('code');
    
    if (code) {
      console.log('OAuth code detected:', code);
      setGithubVerified(true);
      // Clean URL
      window.history.replaceState({}, document.title, '/verify');
    }
  }, []);

  // Step 1: OAuth Verification
  const handleGithubAuth = () => {
    // Use current origin for local development
    const redirectUri = window.location.hostname === 'localhost' 
      ? `${window.location.origin}/poh/callback`
      : 'https://www.aurapass.xyz/poh/callback';
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`;
    console.log('GitHub OAuth URL:', authUrl);
    window.location.href = authUrl;
  };

  const handleTwitterAuth = () => {
    // Use current origin for local development
    const redirectUri = window.location.hostname === 'localhost'
      ? `${window.location.origin}/poh/callback`
      : 'https://www.aurapass.xyz/poh/callback';
    const codeChallenge = 'challenge';
    window.location.href = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20users.read&state=state&code_challenge=${codeChallenge}&code_challenge_method=plain`;
  };

  // Step 2: Enroll
  const handleEnroll = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }
    
    setLoading(true);
    try {
      // Handle both query params (?code=) and hash fragments (#code=)
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const githubCode = urlParams.get('code') || hashParams.get('code');
      const twitterCode = urlParams.get('code') || hashParams.get('code');
      
      console.log('Enrolling with:', { address, githubCode, twitterCode });
      
      const response = await fetch(`${BACKEND_URL}/api/poh/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: address,
          wallet_address: address,
          github_code: githubCode,
          twitter_code: twitterCode,
          twitter_redirect_uri: `${window.location.origin}/poh/callback`
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Enrollment failed');
      }
      
      const data = await response.json();
      console.log('Enrollment response:', data);
      
      setEnrollmentId(data.enrollment_id);
      setScore(data.score);
      setStep(2);
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Enrollment failed: ' + error.message + '\n\nMake sure backend is running on port 9000');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Generate Proof
  const handleGenerateProof = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/poh/prove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: enrollmentId,
          identity_secret: address
        })
      });
      
      const data = await response.json();
      setProofHash(data.proof_hash);
      setNullifier(data.nullifier);
      setStep(3);
    } catch (error) {
      alert('Proof generation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Mint Badge
  const handleMintBadge = async () => {
    setLoading(true);
    setError('');
    try {
      const { ethereum } = window;
      if (!ethereum) throw new Error('MetaMask not installed');
  
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        '0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678',
        ['function mintBadge(address to, string memory badgeType) public returns (uint256)'],
        signer
      );
      
      const tx = await contract.mintBadge(address, 'Proof of Humanity');
      const receipt = await tx.wait();
      
      setTxHash(receipt.hash);
      setStep(4);
      setTimeout(() => window.location.href = '/dashboard', 5000);
    } catch (error) {
      setError('Badge minting failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Proof of Humanity</h1>
      
      {/* Progress Bar */}
      <div className="flex justify-between mb-8">
        {['Verify', 'Enroll', 'Prove', 'Mint'].map((label, idx) => (
          <div key={idx} className={`flex-1 text-center ${step > idx ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 mx-auto rounded-full ${step > idx ? 'bg-blue-600' : 'bg-gray-300'} text-white flex items-center justify-center mb-2`}>
              {idx + 1}
            </div>
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: OAuth Verification */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Step 1: Verify Identity</h2>
          <p className="text-gray-600 mb-6">Connect your social accounts to prove uniqueness</p>
          
          <div className="space-y-4">
            <button
              onClick={handleGithubAuth}
              disabled={githubVerified}
              className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {githubVerified ? '✓ GitHub Verified' : 'Connect GitHub'}
            </button>
            
            <button
              onClick={handleTwitterAuth}
              disabled={twitterVerified}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {twitterVerified ? '✓ Twitter Verified' : 'Connect Twitter'}
            </button>
            
            <button
              onClick={handleEnroll}
              disabled={loading || !address}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Continue to Enrollment'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Generate Proof */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Step 2: Generate ZK Proof</h2>
          <p className="text-gray-600 mb-4">Your uniqueness score: <span className="font-bold text-2xl text-purple-600">{score}/100</span></p>
          <p className="text-sm text-gray-500 mb-6">Enrollment ID: {enrollmentId}</p>
          
          <button
            onClick={handleGenerateProof}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Generating Proof...' : 'Generate ZK Proof'}
          </button>
        </div>
      )}

      {/* Step 3: Mint Badge */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Step 3: Mint ZK-ID Badge</h2>
          <p className="text-gray-600 mb-4">Proof generated successfully!</p>
          <p className="text-xs text-gray-500 mb-2">Proof Hash: {proofHash.slice(0, 20)}...</p>
          <p className="text-xs text-gray-500 mb-6">Nullifier: {nullifier.slice(0, 20)}...</p>
          
          <button
            onClick={handleMintBadge}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Minting Badge...' : 'Mint Soulbound Badge'}
          </button>
        </div>
      )}

      {/* Success Message */}
      {txHash && (
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 p-6 rounded-lg shadow-lg shadow-green-500/20 mb-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-full">
                <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-green-400 font-bold text-lg">✅ Badge Minted Successfully!</p>
                <p className="text-green-300 text-sm">Your ZK-ID badge is now on-chain</p>
              </div>
            </div>
            
            <div className="p-4 bg-black/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-green-300 text-sm font-medium">Transaction Hash:</span>
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">Polygon Amoy</span>
              </div>
              <p className="text-green-200 font-mono text-sm break-all">{txHash}</p>
            </div>

            <a
              href={`https://amoy.polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition font-medium shadow-lg"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>View Transaction on PolygonScan</span>
            </a>

            <p className="text-center text-green-300/80 text-xs">Redirecting to dashboard in 5 seconds...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border-2 border-red-500/50 p-4 rounded-lg mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && !txHash && (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-4">Badge Minted Successfully!</h2>
          <p className="text-gray-600">Your ZK-ID Badge is now on-chain</p>
        </div>
      )}
    </div>
  );
}
