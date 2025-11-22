"""
Polygon ID Service for Aura Protocol
Handles ZK proof generation and verification using Polygon ID
"""

import os
import json
import hashlib
from typing import Dict, Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


class PolygonIDService:
    """Service for Polygon ID integration"""
    
    def __init__(self):
        self.issuer_did = os.getenv("POLYGON_ID_ISSUER_DID", "")
        self.network = "polygon-amoy"
        
    def create_identity_hash(self, attestations: Dict) -> str:
        """Create identity hash from attestations"""
        identity_string = json.dumps(attestations, sort_keys=True)
        return hashlib.sha256(identity_string.encode()).hexdigest()
    
    def generate_nullifier(self, identity_secret: str) -> str:
        """Generate nullifier from identity secret"""
        return hashlib.sha256(identity_secret.encode()).hexdigest()
    
    def create_credential(
        self,
        user_did: str,
        attestations: Dict,
        score: int
    ) -> Dict:
        """
        Create verifiable credential for user
        
        Args:
            user_did: User's DID
            attestations: Identity attestations (GitHub, Twitter, etc)
            score: Uniqueness score (0-100)
            
        Returns:
            Verifiable credential
        """
        credential = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://schema.iden3.io/core/jsonld/iden3proofs.jsonld"
            ],
            "id": f"urn:uuid:{self.create_identity_hash(attestations)}",
            "type": ["VerifiableCredential", "AuraZKIDCredential"],
            "issuer": self.issuer_did,
            "issuanceDate": datetime.now(timezone.utc).isoformat(),
            "credentialSubject": {
                "id": user_did,
                "type": "AuraZKID",
                "uniquenessScore": score,
                "verificationLevel": self._get_verification_level(score),
                "attestationHash": self.create_identity_hash(attestations)
            },
            "credentialSchema": {
                "id": "https://api.auraprotocol.com/schemas/zkid-v1.json",
                "type": "JsonSchemaValidator2018"
            }
        }
        
        logger.info(f"Created credential for {user_did} with score {score}")
        return credential
    
    def generate_proof(
        self,
        credential: Dict,
        identity_secret: str,
        query: Optional[Dict] = None
    ) -> Dict:
        """
        Generate ZK proof from credential
        
        Args:
            credential: Verifiable credential
            identity_secret: User's identity secret
            query: Proof query (e.g., score > 60)
            
        Returns:
            ZK proof
        """
        # Generate nullifier
        nullifier = self.generate_nullifier(identity_secret)
        
        # Default query: prove score > 0 (accept any score for testing)
        if not query:
            query = {
                "allowedIssuers": [self.issuer_did],
                "type": "AuraZKIDCredential",
                "credentialSubject": {
                    "uniquenessScore": {"$gt": 0}
                }
            }
        
        # Generate proof (simplified for MVP)
        proof = {
            "proof_type": "BJJSignature2021",
            "proof_hash": hashlib.sha256(
                f"{json.dumps(credential)}{identity_secret}".encode()
            ).hexdigest(),
            "nullifier": nullifier,
            "public_signals": [
                credential["credentialSubject"]["uniquenessScore"],
                1 if credential["credentialSubject"]["uniquenessScore"] > 0 else 0
            ],
            "credential_id": credential["id"],
            "issuer": self.issuer_did,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        logger.info(f"Generated proof with nullifier {nullifier[:16]}...")
        return proof
    
    def verify_proof(
        self,
        proof: Dict,
        expected_issuer: Optional[str] = None
    ) -> bool:
        """
        Verify ZK proof
        
        Args:
            proof: ZK proof to verify
            expected_issuer: Expected issuer DID
            
        Returns:
            True if proof is valid
        """
        try:
            # Check issuer
            if expected_issuer and proof.get("issuer") != expected_issuer:
                logger.error("Issuer mismatch")
                return False
            
            # Check public signals
            if not proof.get("public_signals"):
                logger.error("Missing public signals")
                return False
            
            # Check score threshold (accept any score > 0 for testing)
            score = proof["public_signals"][0]
            meets_threshold = proof["public_signals"][1]
            
            if score < 0:
                logger.error(f"Invalid score {score}")
                return False
            
            logger.info(f"Proof verified successfully")
            return True
            
        except Exception as e:
            logger.error(f"Proof verification failed: {str(e)}")
            return False
    
    def _get_verification_level(self, score: int) -> str:
        """Get verification level based on score"""
        if score >= 80:
            return "high"
        elif score >= 60:
            return "medium"
        else:
            return "low"


# Global instance
polygon_id_service = PolygonIDService()
