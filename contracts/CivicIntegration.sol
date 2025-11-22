// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AuraZKBadge.sol";

contract CivicIntegration {
    AuraZKBadge public zkBadgeContract;
    
    // Civic Gateway Token contract address (Polygon testnet)
    address public constant CIVIC_GATEWAY_TOKEN = 0x1234567890123456789012345678901234567890; // Replace with actual address
    
    // Mapping to track Civic verified users
    mapping(address => bool) public civicVerified;
    mapping(address => string) public civicProofs;
    
    event CivicVerificationCompleted(address indexed user, string proofHash);
    
    constructor(address _zkBadgeContract) {
        zkBadgeContract = AuraZKBadge(_zkBadgeContract);
    }
    
    /**
     * @dev Verify user through Civic and issue ZK Badge
     */
    function verifyCivic(string memory proofHash, string memory metadataURI) external {
        require(!civicVerified[msg.sender], "Already verified with Civic");
        
        // In production, this would verify the Civic Gateway Token
        // For demo purposes, we'll simulate the verification
        civicVerified[msg.sender] = true;
        civicProofs[msg.sender] = proofHash;
        
        // Issue ZK Badge for Civic verification
        zkBadgeContract.issueBadge(
            msg.sender,
            AuraZKBadge.BadgeType.CIVIC,
            proofHash,
            metadataURI
        );
        
        emit CivicVerificationCompleted(msg.sender, proofHash);
    }
    
    /**
     * @dev Check if user is Civic verified
     */
    function isCivicVerified(address user) external view returns (bool) {
        return civicVerified[user];
    }
}