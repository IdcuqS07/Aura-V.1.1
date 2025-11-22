// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CreditPassport is ERC721, Ownable {
    uint256 private _tokenIds;
    
    mapping(address => bool) public authorizedMinters;
    
    struct Passport {
        uint256 id;
        address owner;
        uint256 creditScore;
        uint256 pohScore;
        uint256 badgeCount;
        uint256 onchainActivity;
        uint256 issuedAt;
        uint256 lastUpdated;
    }
    
    mapping(uint256 => Passport) public passports;
    mapping(address => uint256) public userPassport;
    
    event PassportIssued(uint256 indexed tokenId, address indexed owner, uint256 creditScore);
    event ScoreUpdated(uint256 indexed tokenId, uint256 newScore);
    event MinterAuthorized(address indexed minter);
    
    constructor() ERC721("Aura Credit Passport", "ACP") {}
    
    modifier onlyAuthorized() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    function mintPassport(
        uint256 pohScore,
        uint256 badgeCount
    ) external returns (uint256) {
        require(userPassport[msg.sender] == 0, "Passport already exists");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        uint256 creditScore = calculateCreditScore(pohScore, badgeCount, 0);
        
        passports[newTokenId] = Passport({
            id: newTokenId,
            owner: msg.sender,
            creditScore: creditScore,
            pohScore: pohScore,
            badgeCount: badgeCount,
            onchainActivity: 0,
            issuedAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        userPassport[msg.sender] = newTokenId;
        _safeMint(msg.sender, newTokenId);
        
        emit PassportIssued(newTokenId, msg.sender, creditScore);
        return newTokenId;
    }
    
    function issuePassport(
        address recipient,
        uint256 pohScore,
        uint256 badgeCount
    ) external onlyAuthorized returns (uint256) {
        require(userPassport[recipient] == 0, "Passport already exists");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        uint256 creditScore = calculateCreditScore(pohScore, badgeCount, 0);
        
        passports[newTokenId] = Passport({
            id: newTokenId,
            owner: recipient,
            creditScore: creditScore,
            pohScore: pohScore,
            badgeCount: badgeCount,
            onchainActivity: 0,
            issuedAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        userPassport[recipient] = newTokenId;
        _safeMint(recipient, newTokenId);
        
        emit PassportIssued(newTokenId, recipient, creditScore);
        return newTokenId;
    }
    
    function updateScore(
        address user,
        uint256 pohScore,
        uint256 badgeCount,
        uint256 onchainActivity
    ) external onlyAuthorized {
        uint256 tokenId = userPassport[user];
        require(tokenId > 0, "No passport found");
        
        Passport storage passport = passports[tokenId];
        passport.pohScore = pohScore;
        passport.badgeCount = badgeCount;
        passport.onchainActivity = onchainActivity;
        passport.creditScore = calculateCreditScore(pohScore, badgeCount, onchainActivity);
        passport.lastUpdated = block.timestamp;
        
        emit ScoreUpdated(tokenId, passport.creditScore);
    }
    
    function calculateCreditScore(
        uint256 pohScore,
        uint256 badgeCount,
        uint256 onchainActivity
    ) public pure returns (uint256) {
        uint256 score = 0;
        score += pohScore * 4;
        score += badgeCount * 50;
        if (score > 700) score += 100;
        score += onchainActivity;
        if (score > 1000) score = 1000;
        return score;
    }
    
    function getPassport(address user) external view returns (Passport memory) {
        uint256 tokenId = userPassport[user];
        require(tokenId > 0, "No passport found");
        return passports[tokenId];
    }
    
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }
    
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
