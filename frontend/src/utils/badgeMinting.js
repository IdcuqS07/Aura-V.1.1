import { ethers } from 'ethers';

// V2: Permissionless minting (anyone can mint for themselves)
const BADGE_CONTRACT_ADDRESS = '0x3d586E681b12B07825F17Ce19B28e1F576a1aF89';

const BADGE_ABI = [
  'function issueBadge(address recipient, string badgeType, string zkProofHash) returns (uint256)',
  'function getUserBadges(address user) view returns (uint256[])',
  'function badges(uint256 tokenId) view returns (uint256 id, address owner, string badgeType, string zkProofHash, uint256 issuedAt)',
  'function hasBadgeType(address user, string badgeType) view returns (bool)',
  'function lastMintTime(address user) view returns (uint256)',
  'function MINT_COOLDOWN() view returns (uint256)',
  'event BadgeIssued(uint256 indexed tokenId, address indexed recipient, string badgeType)'
];

/**
 * USER-CONTROLLED MINTING (User pays gas)
 * V2: Permissionless - anyone can mint for themselves
 */
export async function mintBadgeUserPays(badgeType, zkProofHash) {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    const contract = new ethers.Contract(BADGE_CONTRACT_ADDRESS, BADGE_ABI, signer);

    // V2: No authorization check needed (permissionless)
    // Check if user already has this badge type
    const hasBadge = await contract.hasBadgeType(userAddress, badgeType);
    if (hasBadge) {
      throw new Error(`You already have a ${badgeType} badge`);
    }

    // Estimate gas
    const gasEstimate = await contract.issueBadge.estimateGas(
      userAddress,
      badgeType,
      zkProofHash
    );

    // Mint badge (user pays gas)
    const tx = await contract.issueBadge(
      userAddress,
      badgeType,
      zkProofHash,
      {
        gasLimit: gasEstimate * 120n / 100n // 20% buffer
      }
    );

    console.log('Transaction sent:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();

    // Extract token ID from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'BadgeIssued';
      } catch {
        return false;
      }
    });

    let tokenId = null;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      tokenId = parsed.args.tokenId.toString();
    }

    const gasUsed = receipt.gasUsed.toString();
    const gasPrice = receipt.gasPrice || tx.gasPrice;
    const gasFee = ethers.formatEther(receipt.gasUsed * gasPrice);

    return {
      success: true,
      txHash: receipt.hash,
      tokenId,
      gasUsed,
      gasFee: `${gasFee} MATIC`,
      method: 'user-controlled'
    };

  } catch (error) {
    console.error('User minting error:', error);
    return {
      success: false,
      error: error.message,
      method: 'user-controlled'
    };
  }
}

/**
 * BACKEND-CONTROLLED MINTING (Backend pays gas)
 * Fallback when user is not authorized minter
 */
export async function mintBadgeBackendPays(badgeType, zkProofHash) {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const walletAddress = await signer.getAddress();

    // Sign message for verification
    const message = `Mint badge for ${walletAddress}`;
    const signature = await signer.signMessage(message);

    // Call backend API
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/badges/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet_address: walletAddress,
        badge_type: badgeType,
        zk_proof_hash: zkProofHash,
        message,
        signature
      })
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        txHash: result.tx_hash,
        tokenId: result.token_id,
        gasUsed: result.gas_used,
        gasFee: result.gas_fee ? `${result.gas_fee} MATIC` : 'Paid by protocol',
        method: 'backend-controlled'
      };
    } else {
      throw new Error(result.message || 'Backend minting failed');
    }

  } catch (error) {
    console.error('Backend minting error:', error);
    return {
      success: false,
      error: error.message,
      method: 'backend-controlled'
    };
  }
}

/**
 * SMART MINTING (Auto-select best method)
 * V2: Always use user-controlled (permissionless)
 * Fallback to backend only if user has no MATIC
 */
export async function mintBadgeSmart(badgeType, zkProofHash) {
  try {
    // V2: Try user-controlled first (permissionless)
    console.log('V2: Using permissionless user-controlled minting');
    return await mintBadgeUserPays(badgeType, zkProofHash);

  } catch (error) {
    console.error('User minting failed:', error);
    
    // Fallback to backend only if user has no MATIC
    if (error.message.includes('insufficient funds')) {
      console.log('User has no MATIC, falling back to backend');
      return await mintBadgeBackendPays(badgeType, zkProofHash);
    }
    
    throw error;
  }
}

/**
 * Get user badges from contract
 */
export async function getUserBadges(userAddress) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(BADGE_CONTRACT_ADDRESS, BADGE_ABI, provider);
    
    const badgeIds = await contract.getUserBadges(userAddress);
    
    const badges = [];
    for (const id of badgeIds) {
      const badge = await contract.badges(id);
      badges.push({
        id: badge.id.toString(),
        owner: badge.owner,
        badgeType: badge.badgeType,
        zkProofHash: badge.zkProofHash,
        issuedAt: new Date(Number(badge.issuedAt) * 1000).toISOString()
      });
    }
    
    return badges;
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
}

/**
 * Check minter status (V2: Always permissionless)
 */
export async function checkMinterStatus(userAddress) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(BADGE_CONTRACT_ADDRESS, BADGE_ABI, provider);
    
    // V2: Check cooldown and existing badges instead of authorization
    const lastMint = await contract.lastMintTime(userAddress);
    const cooldown = await contract.MINT_COOLDOWN();
    const now = Math.floor(Date.now() / 1000);
    const canMintNow = Number(lastMint) + Number(cooldown) <= now;
    
    return {
      isAuthorized: true, // V2: Always true (permissionless)
      canMintDirectly: true,
      needsBackend: false,
      canMintNow,
      cooldownRemaining: canMintNow ? 0 : Number(lastMint) + Number(cooldown) - now
    };
  } catch (error) {
    console.error('Error checking minter status:', error);
    return {
      isAuthorized: true, // V2: Always permissionless
      canMintDirectly: true,
      needsBackend: false,
      canMintNow: true,
      cooldownRemaining: 0
    };
  }
}
