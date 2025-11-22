from web3 import Web3
from eth_account import Account
import json
import os
from typing import Dict, Any, Optional
import logging
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv(Path(__file__).parent / '.env')

logger = logging.getLogger(__name__)

class PolygonIntegration:
    def __init__(self):
        # Polygon Amoy testnet RPC
        self.rpc_url = "https://rpc-amoy.polygon.technology"
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        # Contract addresses (deployed on Polygon Amoy)
        self.contracts = {
            "SIMPLE_ZK_BADGE": "0xa297944E0A63aDB57730687d44aF6235aa8D0DA7",
            "PROOF_REGISTRY": "0xE380607e7f5516E3b0dd593cE89F79D6acEfC037",
            "ZK_BADGE": "0xa297944E0A63aDB57730687d44aF6235aa8D0DA7"
        }
        
        # Load private key from environment
        self.private_key = os.getenv("POLYGON_PRIVATE_KEY", "").strip('"')
        if self.private_key and self.private_key != "your_private_key_here":
            self.account = Account.from_key(self.private_key)
        else:
            logger.warning("No private key found. Blockchain operations will be read-only.")
            self.account = None
    
    def load_contract_addresses(self, deployment_file: str = "deployment.json"):
        """Load contract addresses from deployment file"""
        try:
            with open(deployment_file, 'r') as f:
                deployment = json.load(f)
                self.contracts.update({
                    "ZK_BADGE": deployment["contracts"]["AuraZKBadge"],
                    "CIVIC_INTEGRATION": deployment["contracts"]["CivicIntegration"],
                    "WORLDCOIN_INTEGRATION": deployment["contracts"]["WorldcoinIntegration"]
                })
                logger.info("Contract addresses loaded successfully")
        except FileNotFoundError:
            logger.warning("Deployment file not found. Using default addresses.")
    
    def get_contract_abi(self, contract_name: str) -> list:
        """Get contract ABI (simplified for demo)"""
        # In production, load from compiled artifacts
        if contract_name == "ZK_BADGE":
            return [
                {
                    "inputs": [
                        {"name": "recipient", "type": "address"},
                        {"name": "badgeType", "type": "uint8"},
                        {"name": "zkProofHash", "type": "string"},
                        {"name": "metadataURI", "type": "string"}
                    ],
                    "name": "issueBadge",
                    "outputs": [{"name": "", "type": "uint256"}],
                    "type": "function"
                },
                {
                    "inputs": [
                        {"name": "user", "type": "address"},
                        {"name": "badgeType", "type": "uint8"}
                    ],
                    "name": "hasBadgeType",
                    "outputs": [{"name": "", "type": "bool"}],
                    "type": "function"
                }
            ]
        return []
    
    async def issue_zk_badge(
        self, 
        recipient: str, 
        badge_type: int, 
        zk_proof_hash: str, 
        metadata_uri: str
    ) -> Optional[str]:
        """Issue a ZK Badge on-chain"""
        if not self.account:
            logger.error("No account configured for blockchain operations")
            return None
        
        try:
            contract_address = self.contracts["ZK_BADGE"]
            contract_abi = self.get_contract_abi("ZK_BADGE")
            
            contract = self.w3.eth.contract(
                address=contract_address,
                abi=contract_abi
            )
            
            # Build transaction
            transaction = contract.functions.issueBadge(
                recipient,
                badge_type,
                zk_proof_hash,
                metadata_uri
            ).build_transaction({
                'from': self.account.address,
                'gas': 200000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.account.address)
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            logger.info(f"ZK Badge issued. Transaction hash: {tx_hash.hex()}")
            return tx_hash.hex()
            
        except Exception as e:
            logger.error(f"Error issuing ZK Badge: {str(e)}")
            return None
    
    async def verify_civic_proof(self, user_address: str, proof_hash: str) -> bool:
        """Verify Civic proof and issue badge"""
        try:
            # In production, this would interact with Civic's verification system
            # For demo, we'll simulate the verification
            
            metadata_uri = f"https://api.auraprotocol.com/metadata/civic/{proof_hash}"
            
            tx_hash = await self.issue_zk_badge(
                user_address,
                3,  # BadgeType.CIVIC
                proof_hash,
                metadata_uri
            )
            
            return tx_hash is not None
            
        except Exception as e:
            logger.error(f"Error verifying Civic proof: {str(e)}")
            return False
    
    async def verify_worldcoin_proof(
        self, 
        user_address: str, 
        nullifier_hash: str,
        proof: list
    ) -> bool:
        """Verify Worldcoin proof and issue badge"""
        try:
            # In production, this would verify the ZK proof with WorldID
            # For demo, we'll simulate the verification
            
            proof_hash = f"worldcoin_{nullifier_hash}"
            metadata_uri = f"https://api.auraprotocol.com/metadata/worldcoin/{nullifier_hash}"
            
            tx_hash = await self.issue_zk_badge(
                user_address,
                4,  # BadgeType.WORLDCOIN
                proof_hash,
                metadata_uri
            )
            
            return tx_hash is not None
            
        except Exception as e:
            logger.error(f"Error verifying Worldcoin proof: {str(e)}")
            return False
    
    async def mint_badge(self, recipient: str, badge_type: str, zk_proof_hash: str) -> Optional[str]:
        """Mint badge using backend wallet (protocol-controlled)"""
        if not self.account:
            logger.error("No account configured for minting")
            return None
        
        try:
            # Load SimpleZKBadge contract
            contract_address = "0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678"
            
            # SimpleZKBadge ABI for issueBadge function
            contract_abi = [{
                "inputs": [
                    {"name": "recipient", "type": "address"},
                    {"name": "badgeType", "type": "string"},
                    {"name": "zkProofHash", "type": "string"}
                ],
                "name": "issueBadge",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            }]
            
            contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(contract_address),
                abi=contract_abi
            )
            
            # Build transaction
            transaction = contract.functions.issueBadge(
                Web3.to_checksum_address(recipient),
                badge_type,
                zk_proof_hash
            ).build_transaction({
                'from': self.account.address,
                'gas': 300000,
                'gasPrice': self.w3.to_wei('35', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.account.address)
            })
            
            # Sign and send
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            
            # Try both attribute names for compatibility
            raw_tx = getattr(signed_txn, 'rawTransaction', None) or getattr(signed_txn, 'raw_transaction', None)
            if raw_tx is None:
                logger.error(f"Cannot get raw transaction. Available attributes: {dir(signed_txn)}")
                return None
            
            tx_hash = self.w3.eth.send_raw_transaction(raw_tx)
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt['status'] == 1:
                gas_used = receipt['gasUsed']
                gas_price = receipt['effectiveGasPrice']
                gas_fee_wei = gas_used * gas_price
                gas_fee_matic = self.w3.from_wei(gas_fee_wei, 'ether')
                
                logger.info(f"Badge minted successfully. TX: {tx_hash.hex()}, Gas: {gas_fee_matic} MATIC")
                return {
                    'tx_hash': tx_hash.hex(),
                    'gas_used': gas_used,
                    'gas_fee': str(gas_fee_matic)
                }
            else:
                logger.error(f"Transaction failed: {tx_hash.hex()}")
                return None
            
        except Exception as e:
            logger.error(f"Minting error: {str(e)}")
            return None
    
    async def check_user_badges(self, user_address: str) -> Dict[str, bool]:
        """Check which badge types a user has"""
        try:
            contract_address = self.contracts["ZK_BADGE"]
            contract_abi = self.get_contract_abi("ZK_BADGE")
            
            contract = self.w3.eth.contract(
                address=contract_address,
                abi=contract_abi
            )
            
            badge_types = {
                "uniqueness": 0,
                "identity": 1,
                "reputation": 2,
                "civic": 3,
                "worldcoin": 4
            }
            
            user_badges = {}
            for badge_name, badge_type in badge_types.items():
                has_badge = contract.functions.hasBadgeType(user_address, badge_type).call()
                user_badges[badge_name] = has_badge
            
            return user_badges
            
        except Exception as e:
            logger.error(f"Error checking user badges: {str(e)}")
            return {}

# Global instance
polygon_integration = PolygonIntegration()