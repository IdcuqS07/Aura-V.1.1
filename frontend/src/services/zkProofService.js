import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

class ZKProofService {
    async calculateScore(walletAddress) {
        const response = await axios.post(`${API_URL}/api/zk/calculate-score`, {
            wallet_address: walletAddress
        });
        return response.data;
    }
    
    async generateProof(walletAddress, threshold = 50) {
        const response = await axios.post(`${API_URL}/api/zk/generate-proof`, {
            wallet_address: walletAddress,
            threshold: threshold
        });
        return response.data;
    }
    
    async mintZKBadge(proof, signer) {
        const { ethers } = require('ethers');
        const badgeABI = require('../contracts/ZKThresholdBadge.json');
        const badgeAddress = process.env.REACT_APP_ZK_BADGE_ADDRESS;
        
        const contract = new ethers.Contract(badgeAddress, badgeABI.abi, signer);
        const tx = await contract.issueBadge(proof.a, proof.b, proof.c, proof.input);
        return await tx.wait();
    }
}

export default new ZKProofService();
