import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Shield, TrendingUp, CheckCircle, Copy, Key } from 'lucide-react';

const Premium = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Basic ZK-ID Badge',
        'Credit Passport NFT',
        'Standard Analytics',
        '10 API calls/day',
        'Community Support'
      ],
      icon: Shield,
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: 'per month',
      features: [
        'All Free features',
        'Advanced Analytics Dashboard',
        'Custom Badge Metadata',
        '1,000 API calls/day',
        'Priority Support',
        'API Key Access'
      ],
      icon: Zap,
      color: 'from-blue-600 to-blue-700',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$199',
      period: 'per month',
      features: [
        'All Pro features',
        'Unlimited API calls',
        'White-label Solution',
        'Custom Integration',
        'Dedicated Support',
        'SLA Guarantee',
        'Multi-chain Support'
      ],
      icon: Crown,
      color: 'from-purple-600 to-purple-700'
    }
  ];

  const handleSubscribe = async (planId) => {
    setSelectedPlan(planId);
    if (planId !== 'free') {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:9000' : 'https://www.aurapass.xyz')}/api/api-keys`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: planId })
        });
        
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.api_key);
          setShowKey(true);
        } else {
          const demoKey = `aura_${planId}_${Math.random().toString(36).substr(2, 16)}`;
          setApiKey(demoKey);
          setShowKey(true);
        }
      } catch (error) {
        console.error('Error generating API key:', error);
        const demoKey = `aura_${planId}_${Math.random().toString(36).substr(2, 16)}`;
        setApiKey(demoKey);
        setShowKey(true);
      }
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    alert('API Key copied to clipboard!');
  };

  return (
    <div className="pt-20 px-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Premium Features</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Unlock advanced features and scale your ZK-ID integration with premium plans
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          return (
            <Card 
              key={plan.id}
              className={`relative ${
                plan.popular 
                  ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/50 scale-105' 
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 text-sm">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  disabled={selectedPlan === plan.id}
                >
                  {selectedPlan === plan.id ? 'Current Plan' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* API Key Display */}
      {showKey && (
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Key className="h-6 w-6 text-purple-400" />
              <span>Your API Key</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Use this key to access Proof-as-a-Service API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-slate-900/50 rounded-lg font-mono text-sm text-purple-400 break-all">
                {apiKey}
              </div>
              <Button onClick={copyApiKey} variant="outline" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-200 text-sm">
                ⚠️ Keep your API key secure. Don't share it publicly or commit it to version control.
              </p>
            </div>

            <div className="text-sm text-gray-300">
              <p className="font-semibold mb-2">Example Usage:</p>
              <pre className="p-3 bg-slate-900/50 rounded-lg overflow-x-auto">
{`curl -X POST https://api.auraprotocol.com/proof/generate \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"user_id": "your_user_id"}'`}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Comparison */}
      <Card className="max-w-6xl mx-auto bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-3 text-gray-400">Feature</th>
                  <th className="text-center py-3 text-gray-400">Free</th>
                  <th className="text-center py-3 text-gray-400">Pro</th>
                  <th className="text-center py-3 text-gray-400">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-slate-700">
                  <td className="py-3">API Calls/Day</td>
                  <td className="text-center">10</td>
                  <td className="text-center">1,000</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-3">Custom Badges</td>
                  <td className="text-center">-</td>
                  <td className="text-center">✓</td>
                  <td className="text-center">✓</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-3">Advanced Analytics</td>
                  <td className="text-center">-</td>
                  <td className="text-center">✓</td>
                  <td className="text-center">✓</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-3">White-label</td>
                  <td className="text-center">-</td>
                  <td className="text-center">-</td>
                  <td className="text-center">✓</td>
                </tr>
                <tr>
                  <td className="py-3">Support</td>
                  <td className="text-center">Community</td>
                  <td className="text-center">Priority</td>
                  <td className="text-center">Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700 text-center">
          <CardContent className="pt-6">
            <TrendingUp className="h-12 w-12 text-blue-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-2">Scale Your Business</h4>
            <p className="text-gray-300 text-sm">Handle millions of verifications with enterprise-grade infrastructure</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700 text-center">
          <CardContent className="pt-6">
            <Shield className="h-12 w-12 text-purple-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-2">Enhanced Security</h4>
            <p className="text-gray-300 text-sm">Advanced ZK proofs and multi-layer verification</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700 text-center">
          <CardContent className="pt-6">
            <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-2">Lightning Fast</h4>
            <p className="text-gray-300 text-sm">Sub-second proof generation and verification</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Premium;