pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template ProofOfHumanity() {
    // Public inputs
    signal input nullifierHash;
    
    // Private inputs
    signal input githubVerified;
    signal input twitterVerified;
    signal input walletAddress;
    signal input secret;
    
    // Outputs
    signal output proofHash;
    signal output isHuman;
    signal output nullifierHashOut;
    
    // Verify inputs are binary (0 or 1)
    component githubCheck = IsEqual();
    githubCheck.in[0] <== githubVerified * (githubVerified - 1);
    githubCheck.in[1] <== 0;
    githubCheck.out === 1;
    
    component twitterCheck = IsEqual();
    twitterCheck.in[0] <== twitterVerified * (twitterVerified - 1);
    twitterCheck.in[1] <== 0;
    twitterCheck.out === 1;
    
    // Calculate if user is human (at least one verification)
    signal verificationSum;
    verificationSum <== githubVerified + twitterVerified;
    
    component isHumanCheck = GreaterThan(8);
    isHumanCheck.in[0] <== verificationSum;
    isHumanCheck.in[1] <== 0;
    isHuman <== isHumanCheck.out;
    
    // Generate nullifier hash
    component nullifier = Poseidon(2);
    nullifier.inputs[0] <== walletAddress;
    nullifier.inputs[1] <== secret;
    nullifierHashOut <== nullifier.out;
    
    // Verify nullifier matches public input
    nullifierHashOut === nullifierHash;
    
    // Generate proof hash
    component proof = Poseidon(4);
    proof.inputs[0] <== githubVerified;
    proof.inputs[1] <== twitterVerified;
    proof.inputs[2] <== walletAddress;
    proof.inputs[3] <== nullifierHash;
    proofHash <== proof.out;
}

component main {public [nullifierHash]} = ProofOfHumanity();
