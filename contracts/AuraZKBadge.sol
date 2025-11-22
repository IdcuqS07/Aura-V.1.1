// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AuraZKBadge is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Badge types
    enum BadgeType { UNIQUENESS, IDENTITY, REPUTATION, CIVIC, WORLDCOIN }
    
    struct Badge {
        BadgeType badgeType;
        string zkProofHash;
        string metadataURI;
        uint256 issuedAt;
        bool isActive;
        address verifier;
    }
    
    // Mapping from token ID to badge data
    mapping(uint256 => Badge) public badges;
    
    // Mapping from user address to badge types they own
    mapping(address => mapping(BadgeType => bool)) public userBadges;
    
    // Mapping for proof of uniqueness - prevents duplicate proofs
    mapping(string => bool) public usedProofs;
    
    // Authorized verifiers for different badge types
    mapping(BadgeType => mapping(address => bool)) public authorizedVerifiers;
    
    // Events
    event BadgeIssued(uint256 indexed tokenId, address indexed recipient, BadgeType badgeType, string zkProofHash);
    event BadgeRevoked(uint256 indexed tokenId);
    event VerifierAuthorized(address indexed verifier, BadgeType badgeType);
    
    constructor() ERC721("Aura ZK Badge", "AZKB") {}
    
    modifier onlyAuthorizedVerifier(BadgeType _badgeType) {
        require(authorizedVerifiers[_badgeType][msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }
    
    /**
     * @dev Issue a new ZK Badge with proof of uniqueness
     */
    function issueBadge(
        address recipient,
        BadgeType badgeType,
        string memory zkProofHash,
        string memory metadataURI
    ) external onlyAuthorizedVerifier(badgeType) nonReentrant returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(!usedProofs[zkProofHash], "Proof already used");
        require(!userBadges[recipient][badgeType], "Badge type already owned");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Mark proof as used for uniqueness
        usedProofs[zkProofHash] = true;
        
        // Create badge
        badges[newTokenId] = Badge({
            badgeType: badgeType,
            zkProofHash: zkProofHash,
            metadataURI: metadataURI,
            issuedAt: block.timestamp,
            isActive: true,
            verifier: msg.sender
        });
        
        // Mark user as having this badge type
        userBadges[recipient][badgeType] = true;
        
        // Mint the NFT
        _safeMint(recipient, newTokenId);
        
        emit BadgeIssued(newTokenId, recipient, badgeType, zkProofHash);
        
        return newTokenId;
    }
    
    /**
     * @dev Check if user has a specific badge type
     */
    function hasBadgeType(address user, BadgeType badgeType) external view returns (bool) {
        return userBadges[user][badgeType];
    }
    
    /**
     * @dev Get badge data
     */
    function getBadge(uint256 tokenId) external view returns (Badge memory) {
        require(_exists(tokenId), "Token does not exist");
        return badges[tokenId];
    }
    
    /**
     * @dev Override tokenURI to use custom metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return badges[tokenId].metadataURI;
    }
    
    /**
     * @dev Prevent transfers (Soulbound)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0) || to == address(0), "Soulbound: Transfer not allowed");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    /**
     * @dev Authorize a verifier for a specific badge type
     */
    function authorizeVerifier(address verifier, BadgeType badgeType) external onlyOwner {
        authorizedVerifiers[badgeType][verifier] = true;
        emit VerifierAuthorized(verifier, badgeType);
    }
}