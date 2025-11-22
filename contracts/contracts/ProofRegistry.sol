// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ProofRegistry is Ownable {
    struct Proof {
        string proofHash;
        address user;
        uint256 timestamp;
        bool isValid;
    }
    
    mapping(string => Proof) public proofs;
    mapping(address => string[]) public userProofs;
    
    event ProofRegistered(string indexed proofHash, address indexed user);
    event ProofRevoked(string indexed proofHash);
    
    function registerProof(string memory proofHash, address user) external onlyOwner {
        require(bytes(proofs[proofHash].proofHash).length == 0, "Proof already exists");
        
        proofs[proofHash] = Proof({
            proofHash: proofHash,
            user: user,
            timestamp: block.timestamp,
            isValid: true
        });
        
        userProofs[user].push(proofHash);
        
        emit ProofRegistered(proofHash, user);
    }
    
    function verifyProof(string memory proofHash) external view returns (bool) {
        return proofs[proofHash].isValid && bytes(proofs[proofHash].proofHash).length > 0;
    }
    
    function revokeProof(string memory proofHash) external onlyOwner {
        require(bytes(proofs[proofHash].proofHash).length > 0, "Proof does not exist");
        proofs[proofHash].isValid = false;
        emit ProofRevoked(proofHash);
    }
    
    function getUserProofs(address user) external view returns (string[] memory) {
        return userProofs[user];
    }
    
    function getProof(string memory proofHash) external view returns (Proof memory) {
        return proofs[proofHash];
    }
}