// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CrossChainPassport
 * @notice Enables passport synchronization across multiple chains via LayerZero
 */
contract CrossChainPassport is NonblockingLzApp {
    
    // Passport data structure
    struct Passport {
        address owner;
        uint256 creditScore;
        uint256 lastUpdated;
        bool isActive;
    }
    
    // Mapping: wallet address => Passport
    mapping(address => Passport) public passports;
    
    // Mapping: source chain ID => trusted remote address
    mapping(uint16 => bytes) public trustedRemotes;
    
    // Events
    event PassportSynced(address indexed owner, uint256 creditScore, uint16 sourceChain);
    event PassportUpdated(address indexed owner, uint256 newScore);
    event CrossChainMessageSent(uint16 indexed dstChainId, address indexed owner);
    
    constructor(address _lzEndpoint) NonblockingLzApp(_lzEndpoint) {}
    
    /**
     * @notice Update passport locally and sync to other chains
     */
    function updatePassport(uint256 _creditScore) external {
        passports[msg.sender] = Passport({
            owner: msg.sender,
            creditScore: _creditScore,
            isActive: true,
            lastUpdated: block.timestamp
        });
        
        emit PassportUpdated(msg.sender, _creditScore);
    }
    
    /**
     * @notice Sync passport to destination chain
     */
    function syncToChain(uint16 _dstChainId) external payable {
        require(passports[msg.sender].isActive, "Passport not active");
        
        bytes memory payload = abi.encode(
            msg.sender,
            passports[msg.sender].creditScore,
            block.timestamp
        );
        
        _lzSend(
            _dstChainId,
            payload,
            payable(msg.sender),
            address(0),
            bytes(""),
            msg.value
        );
        
        emit CrossChainMessageSent(_dstChainId, msg.sender);
    }
    
    /**
     * @notice Internal function to handle incoming cross-chain messages
     */
    function _nonblockingLzReceive(
        uint16 _srcChainId,
        bytes memory,
        uint64,
        bytes memory _payload
    ) internal override {
        (address owner, uint256 creditScore, uint256 timestamp) = abi.decode(
            _payload,
            (address, uint256, uint256)
        );
        
        // Only update if incoming data is newer
        if (timestamp > passports[owner].lastUpdated) {
            passports[owner] = Passport({
                owner: owner,
                creditScore: creditScore,
                isActive: true,
                lastUpdated: timestamp
            });
            
            emit PassportSynced(owner, creditScore, _srcChainId);
        }
    }
    
    /**
     * @notice Estimate cross-chain message fee
     */
    function estimateFee(
        uint16 _dstChainId,
        address _userAddress
    ) external view returns (uint256 nativeFee, uint256 zroFee) {
        bytes memory payload = abi.encode(
            _userAddress,
            passports[_userAddress].creditScore,
            block.timestamp
        );
        
        return lzEndpoint.estimateFees(
            _dstChainId,
            address(this),
            payload,
            false,
            bytes("")
        );
    }
    
    /**
     * @notice Get passport data
     */
    function getPassport(address _owner) external view returns (Passport memory) {
        return passports[_owner];
    }
}
