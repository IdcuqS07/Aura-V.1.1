import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ExternalLink, Wallet, Coins, TestTube, Clock } from 'lucide-react';

const Testnet = () => {
  const [completedSteps, setCompletedSteps] = useState([]);

  const markStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const testSteps = [
    {
      id: 1,
      title: "Setup MetaMask for Polygon Amoy",
      description: "Configure your wallet to connect to Polygon Amoy testnet",
      icon: Wallet,
      details: [
        "Install MetaMask extension",
        "Add Polygon Amoy network:",
        "• Network Name: Polygon Amoy",
        "• RPC URL: https://rpc-amoy.polygon.technology",
        "• Chain ID: 80002",
        "• Currency: MATIC"
      ],
      action: "Add Network",
      link: "https://chainlist.org/chain/80002"
    },
    {
      id: 2,
      title: "Get Test MATIC",
      description: "Request free test tokens for gas fees",
      icon: Coins,
      details: [
        "Visit Polygon faucet",
        "Enter your wallet address",
        "Request test MATIC tokens",
        "Wait for confirmation (1-2 minutes)"
      ],
      action: "Get Faucet",
      link: "https://faucet.polygon.technology/"
    },
    {
      id: 3,
      title: "Connect Wallet",
      description: "Connect your MetaMask to the application",
      icon: CheckCircle,
      details: [
        "Click 'Connect Wallet' button",
        "Select MetaMask",
        "Approve connection",
        "Ensure you're on Amoy network"
      ],
      action: "Connect Now",
      internal: true
    },
    {
      id: 4,
      title: "Test Application Features",
      description: "Try ZK verification and proof generation",
      icon: TestTube,
      details: [
        "Navigate to ZK Verify → Test Civic verification",
        "Go to Uniqueness → Generate proof of uniqueness",
        "Check My Badges → View earned badges",
        "All features currently run in simulation mode"
      ],
      action: "Start Testing",
      internal: true
    },
    {
      id: 5,
      title: "Real Blockchain Testing",
      description: "Deploy and test actual smart contracts",
      icon: Clock,
      details: [
        "Deploy smart contracts to Amoy testnet",
        "Update contract addresses in backend",
        "Test actual NFT minting",
        "Verify transactions on PolygonScan"
      ],
      action: "Coming Soon",
      disabled: true
    }
  ];

  const StepCard = ({ step, index }) => {
    const isCompleted = completedSteps.includes(step.id);
    const IconComponent = step.icon;

    return (
      <Card className={`transition-all duration-300 ${
        isCompleted ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-800/50 border-slate-700'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isCompleted ? 'bg-green-600' : step.disabled ? 'bg-gray-600' : 'bg-purple-600'
              }`}>
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white flex items-center space-x-2">
                  <span>{step.title}</span>
                  {isCompleted && <CheckCircle className="h-4 w-4 text-green-400" />}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {step.description}
                </CardDescription>
              </div>
            </div>
            <Badge variant={step.disabled ? "secondary" : isCompleted ? "default" : "outline"}>
              Step {step.id}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="text-sm text-gray-300 space-y-1">
            {step.details.map((detail, idx) => (
              <li key={idx} className={detail.startsWith('•') ? 'ml-4' : ''}>
                {detail}
              </li>
            ))}
          </ul>
          
          <div className="flex space-x-2">
            {step.link && (
              <Button
                onClick={() => {
                  window.open(step.link, '_blank');
                  markStepComplete(step.id);
                }}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={step.disabled}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {step.action}
              </Button>
            )}
            
            {step.internal && (
              <Button
                onClick={() => markStepComplete(step.id)}
                variant={isCompleted ? "secondary" : "default"}
                disabled={step.disabled}
              >
                {isCompleted ? "Completed" : step.action}
              </Button>
            )}
            
            {step.disabled && (
              <Button disabled className="bg-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {step.action}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="pt-20 px-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Polygon Testnet Guide</h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-6">
          Follow these steps to test Aura Protocol on Polygon Amoy testnet. 
          Complete each step to experience the full ZK-ID system.
        </p>
        
        {/* Progress */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{completedSteps.length}</div>
            <div className="text-sm text-gray-400">Steps Completed</div>
          </div>
          <div className="text-gray-500">/</div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">{testSteps.length}</div>
            <div className="text-sm text-gray-400">Total Steps</div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <TestTube className="h-6 w-6 text-blue-400" />
            <span>Current Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">
            <strong>Currently:</strong> Application runs with blockchain simulation. 
            For real testnet, private key and contract deployment to Amoy is required.
          </p>
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 text-sm">
              ⚠️ All ZK verification and badge minting features are currently simulated. 
              Real blockchain integration coming soon!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Steps */}
      <div className="space-y-6">
        {testSteps.map((step, index) => (
          <StepCard key={step.id} step={step} index={index} />
        ))}
      </div>

      {/* Network Info */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Polygon Amoy Network Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Network Name:</p>
              <p className="text-white font-mono">Polygon Amoy</p>
            </div>
            <div>
              <p className="text-gray-400">Chain ID:</p>
              <p className="text-white font-mono">80002</p>
            </div>
            <div>
              <p className="text-gray-400">RPC URL:</p>
              <p className="text-white font-mono text-xs">https://rpc-amoy.polygon.technology</p>
            </div>
            <div>
              <p className="text-gray-400">Explorer:</p>
              <a 
                href="https://amoy.polygonscan.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-mono text-xs"
              >
                amoy.polygonscan.com
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Testnet;