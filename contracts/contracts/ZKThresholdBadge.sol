// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IThresholdVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    ) external view returns (bool);
}

contract ZKThresholdBadge is ERC721, Ownable {
    IThresholdVerifier public verifier;
    uint256 private _tokenIds;
    
    struct Badge {
        uint256 id;
        address owner;
        uint256 threshold;
        uint256 score;
        uint256 issuedAt;
    }
    
    mapping(uint256 => Badge) public badges;
    mapping(address => uint256[]) public userBadges;
    mapping(bytes32 => bool) public usedNullifiers;
    
    event BadgeIssued(uint256 indexed tokenId, address indexed recipient, uint256 score);
    
    constructor(address _verifier) ERC721("Aura ZK Threshold Badge", "AZKTB") {
        verifier = IThresholdVerifier(_verifier);
    }
    
    function issueBadge(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    ) external returns (uint256) {
        // input[0] = threshold, input[1] = nullifierHash
        require(verifier.verifyProof(a, b, c, input), "Invalid proof");
        
        bytes32 nullifier = bytes32(input[1]);
        require(!usedNullifiers[nullifier], "Proof already used");
        
        usedNullifiers[nullifier] = true;
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        badges[newTokenId] = Badge({
            id: newTokenId,
            owner: msg.sender,
            threshold: input[0],
            score: 0, // Score is private
            issuedAt: block.timestamp
        });
        
        userBadges[msg.sender].push(newTokenId);
        _safeMint(msg.sender, newTokenId);
        
        emit BadgeIssued(newTokenId, msg.sender, 0);
        return newTokenId;
    }
    
    function getUserBadges(address user) external view returns (uint256[] memory) {
        return userBadges[user];
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }
    
    // Soulbound
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        require(from == address(0), "Soulbound: Transfer not allowed");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
