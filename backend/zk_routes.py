from flask import Blueprint, request, jsonify
from zk_proof_service import ZKProofService
from db_helper import get_user_data
import logging

zk_bp = Blueprint('zk', __name__)
zk_service = ZKProofService()
logger = logging.getLogger(__name__)

@zk_bp.route('/api/zk/generate-proof', methods=['POST'])
def generate_proof():
    """Generate ZK proof for user"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        threshold = data.get('threshold', 50)
        
        if not wallet_address:
            return jsonify({"error": "wallet_address required"}), 400
        
        # Get user data
        user_data = get_user_data(wallet_address)
        if not user_data:
            return jsonify({"error": "User not found"}), 404
        
        # Generate proof
        result = zk_service.generate_proof(user_data, threshold)
        
        if result['success']:
            return jsonify({
                "success": True,
                "proof": result['proof'],
                "score": result['score'],
                "threshold": result['threshold'],
                "nullifier": result['nullifier']
            })
        else:
            return jsonify({
                "success": False,
                "error": result['error']
            }), 400
            
    except Exception as e:
        logger.error(f"Error generating proof: {e}")
        return jsonify({"error": str(e)}), 500

@zk_bp.route('/api/zk/verify-proof', methods=['POST'])
def verify_proof():
    """Verify ZK proof"""
    try:
        data = request.json
        proof = data.get('proof')
        public_signals = data.get('publicSignals')
        
        if not proof or not public_signals:
            return jsonify({"error": "proof and publicSignals required"}), 400
        
        is_valid = zk_service.verify_proof(proof, public_signals)
        
        return jsonify({
            "valid": is_valid
        })
        
    except Exception as e:
        logger.error(f"Error verifying proof: {e}")
        return jsonify({"error": str(e)}), 500

@zk_bp.route('/api/zk/calculate-score', methods=['POST'])
def calculate_score():
    """Calculate user's credibility score"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        
        if not wallet_address:
            return jsonify({"error": "wallet_address required"}), 400
        
        user_data = get_user_data(wallet_address)
        if not user_data:
            return jsonify({"error": "User not found"}), 404
        
        score = zk_service.calculate_score(user_data)
        
        return jsonify({
            "wallet_address": wallet_address,
            "score": score,
            "breakdown": {
                "github": 30 if user_data.get('github_verified') else 0,
                "twitter": 20 if user_data.get('twitter_verified') else 0,
                "wallet_age": min(25, user_data.get('wallet_age_days', 0) // 10),
                "transactions": min(25, user_data.get('transaction_count', 0) // 5)
            }
        })
        
    except Exception as e:
        logger.error(f"Error calculating score: {e}")
        return jsonify({"error": str(e)}), 500
