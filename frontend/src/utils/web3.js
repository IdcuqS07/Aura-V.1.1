import { ethers } from 'ethers';
import { CONTRACTS, NETWORK } from '../config/contracts';
import SimpleZKBadgeABI from '../config/SimpleZKBadge.json';

export const connectWallet = async () => {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });
  
  await switchToPolygonAmoy();
  return accounts[0];
};

export const switchToPolygonAmoy = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK.chainId }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [NETWORK],
      });
    }
  }
};

export const getProvider = () => {
  return new ethers.BrowserProvider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

export const getBadgeContract = async (readOnly = false) => {
  if (readOnly) {
    const provider = new ethers.JsonRpcProvider(NETWORK.rpcUrls[0]);
    return new ethers.Contract(
      CONTRACTS.SIMPLE_ZK_BADGE,
      SimpleZKBadgeABI.abi,
      provider
    );
  }
  const signer = await getSigner();
  return new ethers.Contract(
    CONTRACTS.SIMPLE_ZK_BADGE,
    SimpleZKBadgeABI.abi,
    signer
  );
};

export const getUserBadges = async (address) => {
  const contract = await getBadgeContract(true);
  const badgeIds = await contract.getUserBadges(address);
  return badgeIds.map(id => id.toString());
};

export const issueBadge = async (recipient, badgeType, zkProofHash) => {
  const contract = await getBadgeContract();
  const tx = await contract.issueBadge(recipient, badgeType, zkProofHash);
  await tx.wait();
  return tx.hash;
};

export const getTotalSupply = async () => {
  const contract = await getBadgeContract(true);
  const supply = await contract.totalSupply();
  return supply.toString();
};
