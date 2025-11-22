import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x1112373c9954B9bbFd91eb21175699b609A1b551';

const ABI = [
  "function mintPassport(uint256 pohScore, uint256 badgeCount) external returns (uint256)",
  "function getPassport(address user) external view returns (tuple(uint256 id, address owner, uint256 creditScore, uint256 pohScore, uint256 badgeCount, uint256 onchainActivity, uint256 issuedAt, uint256 lastUpdated))",
  "function userPassport(address user) external view returns (uint256)",
  "function calculateCreditScore(uint256 pohScore, uint256 badgeCount, uint256 onchainActivity) public pure returns (uint256)",
  "event PassportIssued(uint256 indexed tokenId, address indexed owner, uint256 creditScore)"
];

export const mintPassport = async (pohScore, badgeCount) => {
  if (!window.ethereum) throw new Error('No wallet found');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  
  const tx = await contract.mintPassport(pohScore, badgeCount);
  const receipt = await tx.wait();
  
  return {
    txHash: receipt.hash,
    tokenId: receipt.logs[0]?.topics[1]
  };
};

export const getPassport = async (userAddress) => {
  if (!window.ethereum) throw new Error('No wallet found');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  
  try {
    const passport = await contract.getPassport(userAddress);
    return {
      id: passport.id.toString(),
      owner: passport.owner,
      creditScore: passport.creditScore.toString(),
      pohScore: passport.pohScore.toString(),
      badgeCount: passport.badgeCount.toString(),
      onchainActivity: passport.onchainActivity.toString(),
      issuedAt: new Date(Number(passport.issuedAt) * 1000).toISOString(),
      lastUpdated: new Date(Number(passport.lastUpdated) * 1000).toISOString()
    };
  } catch (error) {
    if (error.message.includes('No passport found')) {
      return null;
    }
    throw error;
  }
};

export const hasPassport = async (userAddress) => {
  if (!window.ethereum) return false;
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  
  const tokenId = await contract.userPassport(userAddress);
  return tokenId > 0;
};

export const calculateScore = async (pohScore, badgeCount, onchainActivity = 0) => {
  if (!window.ethereum) throw new Error('No wallet found');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  
  const score = await contract.calculateCreditScore(pohScore, badgeCount, onchainActivity);
  return score.toString();
};
