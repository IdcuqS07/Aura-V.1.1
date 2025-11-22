import React from 'react';
import { CheckCircle } from 'lucide-react';

const Roadmap = () => {
  const roadmap = [
    {
      wave: 'Wave 1',
      title: 'Foundation',
      status: 'Live',
      items: ['Proof of Uniqueness', 'ZK Identity Layer', 'Civic & Worldcoin Integration', 'ZK-ID Badge Launch']
    },
    {
      wave: 'Wave 2',
      title: 'ZK Credit Passport',
      status: 'Complete',
      items: ['Credit Passport NFT', 'Proof-as-a-Service API', 'Analytics Dashboard', 'Premium Features']
    },
    {
      wave: 'Wave 3',
      title: 'Expansion',
      status: 'Coming Soon',
      items: ['Cross-Chain Layer (AuraX)', 'AI Risk Oracle', 'Reputation DAO', 'Multi-Chain Support']
    }
  ];

  const masterRoadmap = [
    {
      wave: 1,
      icon: '🧱',
      title: 'Foundation',
      status: 'Complete',
      progress: 100,
      items: ['Proof of Uniqueness', 'ZK ID Layer', 'Civic + Worldcoin', 'ZK-ID Badge']
    },
    {
      wave: 2,
      icon: '💳',
      title: 'ZK Credit Passport',
      status: 'Complete',
      progress: 100,
      items: ['Credit Passport NFT', 'Proof-as-a-Service API', 'Analytics Dashboard', 'Premium Features']
    },
    {
      wave: 3,
      icon: '🌐',
      title: 'Expansion',
      status: 'Next Wave',
      progress: 0,
      items: ['AuraX Cross-Chain Layer', 'AI Risk Oracle', 'Reputation DAO']
    },
    {
      wave: 4,
      icon: '🧩',
      title: 'Optimization',
      status: 'Planned',
      progress: 0,
      items: ['Payment Integration (Stripe & Crypto)', 'ZK-Proof Optimization', 'Gas Efficiency', 'Audit Preparation']
    },
    {
      wave: 5,
      icon: '💰',
      title: 'Pitch & Funding',
      status: 'Planned',
      progress: 0,
      items: ['Demo Presentation', 'VC Meetings', 'Seed Round Execution']
    },
    {
      wave: 6,
      icon: '🪙',
      title: 'Multi-Chain Deployment',
      status: 'Planned',
      progress: 0,
      items: ['Deploy AuraX to Base/Linea/Scroll', 'Bridge Sync']
    },
    {
      wave: 7,
      icon: '🧠',
      title: 'AI Integration',
      status: 'Planned',
      progress: 0,
      items: ['AI Reputation Oracle', 'Behavior Scoring Model']
    },
    {
      wave: 8,
      icon: '🏛️',
      title: 'Reputation DAO',
      status: 'Planned',
      progress: 0,
      items: ['Governance Mechanism', 'Voting System', 'ZK SBT Rules']
    },
    {
      wave: 9,
      icon: '💼',
      title: 'Ecosystem Apps',
      status: 'Planned',
      progress: 0,
      items: ['SDK', 'Developer Portal', 'Partner Integrations']
    },
    {
      wave: 10,
      icon: '🌠',
      title: 'Global Launch',
      status: 'Planned',
      progress: 0,
      items: ['Mainnet Release', 'Airdrop', 'Grant Program', 'Docs v2']
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Complete': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'In Progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Next Wave': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen pt-16 px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Roadmap</h1>
          <p className="text-gray-400 text-lg">Journey to become Polygon's Trust Layer</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {roadmap.map((phase, index) => (
            <div
              key={index}
              className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 card-hover"
              data-testid={`roadmap-phase-${index}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-400 font-semibold">{phase.wave}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  phase.status === 'Live' || phase.status === 'Complete' ? 'bg-green-500/20 text-green-400' :
                  phase.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {phase.status}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{phase.title}</h3>
              <ul className="space-y-3">
                {phase.items.map((item, i) => (
                  <li key={i} className="flex items-start text-gray-300">
                    <CheckCircle className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 10 Wave Master Roadmap */}
      <div className="max-w-7xl mx-auto mt-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">10 Wave Master Roadmap</h2>
          <p className="text-gray-400 text-lg">Complete journey to Universal Trust Layer</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {masterRoadmap.map((phase, index) => (
            <div
              key={index}
              className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{phase.icon}</span>
                  <span className="text-purple-400 font-bold text-lg">Wave {phase.wave}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(phase.status)}`}>
                  {phase.status}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">{phase.title}</h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{phase.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      phase.progress === 100 ? 'bg-green-500' :
                      phase.progress > 0 ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              </div>
              
              <ul className="space-y-2">
                {phase.items.map((item, i) => (
                  <li key={i} className="flex items-start text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
