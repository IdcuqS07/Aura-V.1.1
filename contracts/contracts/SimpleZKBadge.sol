// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleZKBadge is ERC721, Ownable {
    uint256 private _tokenIds;
    
    // Authorized minters
    mapping(address => bool) public authorizedMinters;
    
    struct Badge {
        uint256 id;
        address owner;
        string badgeType;
        string zkProofHash;
        uint256 issuedAt;
    }
    
    mapping(uint256 => Badge) public badges;
    mapping(address => uint256[]) public userBadges;
    
    event BadgeIssued(uint256 indexed tokenId, address indexed recipient, string badgeType);
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);
    
    constructor() ERC721("Aura ZK Badge", "AZKB") {}
    
    modifier onlyAuthorized() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    function issueBadge(
        address recipient,
        string memory badgeType,
        string memory zkProofHash
    ) external onlyAuthorized returns (uint256) {
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
    
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }
    
    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
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