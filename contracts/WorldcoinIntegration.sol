// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AuraZKBadge.sol";

interface IWorldID {
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}

contract WorldcoinIntegration {
    AuraZKBadge public zkBadgeContract;
    IWorldID public worldId;
    
    // Worldcoin app ID and action ID
    string public appId;
    string public actionId;
    
    // Mapping to track Worldcoin verified users
    mapping(address => bool) public worldcoinVerified;
    mapping(uint256 => bool) public nullifierHashes;
    
    event WorldcoinVerificationCompleted(address indexed user, uint256 nullifierHash);
    
    constructor(
        address _zkBadgeContract,
        address _worldId,
        string memory _appId,
        string memory _actionId
    ) {
        zkBadgeContract = AuraZKBadge(_zkBadgeContract);
        worldId = IWorldID(_worldId);
        appId = _appId;
        actionId = _actionId;
    }
    
    /**
     * @dev Verify user through Worldcoin and issue ZK Badge
     */
    function verifyWorldcoin(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof,
        string memory metadataURI
    ) external {
        require(!worldcoinVerified[msg.sender], "Already verified with Worldcoin");
        require(!nullifierHashes[nullifierHash], "Nullifier already used");
        
        // Verify the proof with WorldID
        uint256 externalNullifierHash = abi.encodePacked(
            abi.encodePacked(appId).hashToField(),
            actionId
        ).hashToField();
        
        uint256 signalHash = abi.encodePacked(msg.sender).hashToField();
        
        worldId.verifyProof(
            root,
            1, // groupId for Orb verification
            signalHash,
            nullifierHash,
            externalNullifierHash,
            proof
        );
        
        // Mark as verified
        worldcoinVerified[msg.sender] = true;
        nullifierHashes[nullifierHash] = true;
        
        // Issue ZK Badge for Worldcoin verification
        zkBadgeContract.issueBadge(
            msg.sender,
            AuraZKBadge.BadgeType.WORLDCOIN,
            string(abi.encodePacked("worldcoin_", nullifierHash)),
            metadataURI
        );
        
        emit WorldcoinVerificationCompleted(msg.sender, nullifierHash);
    }
    
    /**
     * @dev Check if user is Worldcoin verified
     */
    function isWorldcoinVerified(address user) external view returns (bool) {
        return worldcoinVerified[user];
    }
}

// Helper library for hash operations
library HashUtils {
    function hashToField(bytes memory data) internal pure returns (uint256) {
        return uint256(keccak256(data)) >> 8;
    }
}

// Extension for bytes to use hashToField
library BytesExtension {
    function hashToField(bytes memory data) internal pure returns (uint256) {
        return HashUtils.hashToField(data);
    }
}