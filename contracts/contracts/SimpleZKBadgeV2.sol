// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleZKBadgeV2
 * @dev Fully permissionless badge minting - anyone can mint for themselves
 * @notice Aligned with "Universal Trust in a Trustless World" philosophy
 */
contract SimpleZKBadgeV2 is ERC721, Ownable {
    uint256 private _tokenIds;
    
    struct Badge {
        uint256 id;
        address owner;
        string badgeType;
        string zkProofHash;
        uint256 issuedAt;
    }
    
    mapping(uint256 => Badge) public badges;
    mapping(address => uint256[]) public userBadges;
    
    // Spam prevention: One badge per type per user
    mapping(address => mapping(string => bool)) public hasBadgeType;
    
    // Spam prevention: Cooldown between mints
    mapping(address => uint256) public lastMintTime;
    uint256 public constant MINT_COOLDOWN = 1 hours;
    
    event BadgeIssued(uint256 indexed tokenId, address indexed recipient, string badgeType);
    
    constructor() ERC721("Aura ZK Badge V2", "AZKB2") {}
    
    /**
     * @dev Mint badge - fully permissionless, anyone can mint for themselves
     * @param recipient Must be msg.sender (can only mint for yourself)
     * @param badgeType Type of badge (uniqueness, identity, reputation)
     * @param zkProofHash ZK proof hash for verification
     */
    function issueBadge(
        address recipient,
        string memory badgeType,
        string memory zkProofHash
    ) external returns (uint256) {
        // Can only mint for yourself (prevent spam)
        require(msg.sender == recipient, "Can only mint for yourself");
        
        // Cooldown check (prevent rapid minting)
        require(
            block.timestamp >= lastMintTime[msg.sender] + MINT_COOLDOWN,
            "Cooldown period active"
        );
        
        // One badge per type (prevent duplicates)
        require(!hasBadgeType[msg.sender][badgeType], "Already has this badge type");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        badges[newTokenId] = Badge({
            id: newTokenId,
            owner: recipient,
            badgeType: badgeType,
            zkProofHash: zkProofHash,
            issuedAt: block.timestamp
        });
        
        userBadges[recipient].push(newTokenId);
        hasBadgeType[msg.sender][badgeType] = true;
        lastMintTime[msg.sender] = block.timestamp;
        
        _safeMint(recipient, newTokenId);
        
        emit BadgeIssued(newTokenId, recipient, badgeType);
        
        return newTokenId;
    }
    
    function getUserBadges(address user) external view returns (uint256[] memory) {
        return userBadges[user];
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }
    
    // Soulbound: Prevent all transfers except minting
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        require(from == address(0), "Soulbound: Transfer not allowed");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function approve(address, uint256) public virtual override {
        revert("Soulbound: Approval not allowed");
    }
    
    function setApprovalForAll(address, bool) public virtual override {
        revert("Soulbound: Approval not allowed");
    }
}
