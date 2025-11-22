pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template ThresholdProof() {
    // Public inputs
    signal input threshold;
    signal input nullifierHash;
    
    // Private inputs
    signal input githubScore;
    signal input twitterScore;
    signal input walletAge;
    signal input transactionCount;
    signal input secret;
    
    // Outputs
    signal output isValid;
    signal output totalScore;
    
    // Calculate total score
    signal score1;
    signal score2;
    signal score3;
    score1 <== githubScore + twitterScore;
    score2 <== score1 + walletAge;
    score3 <== score2 + transactionCount;
    totalScore <== score3;
    
    // Check if score meets threshold
    component thresholdCheck = GreaterEqThan(32);
    thresholdCheck.in[0] <== totalScore;
    thresholdCheck.in[1] <== threshold;
    isValid <== thresholdCheck.out;
    
    // Generate nullifier
    component nullifier = Poseidon(5);
    nullifier.inputs[0] <== githubScore;
    nullifier.inputs[1] <== twitterScore;
    nullifier.inputs[2] <== walletAge;
    nullifier.inputs[3] <== transactionCount;
    nullifier.inputs[4] <== secret;
    
    nullifier.out === nullifierHash;
}

component main {public [threshold, nullifierHash]} = ThresholdProof();
