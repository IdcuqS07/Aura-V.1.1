import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Lock, TrendingUp, ArrowRight, CheckCircle, Globe } from 'lucide-react';

const LandingPage = () => {
  const [stats, setStats] = useState({ users: 0, verified: 0, passports: 0, volume: 0 });

  useEffect(() => {
    // Animate stats
    const targets = { users: 2847, verified: 2134, passports: 1892, volume: 45.7 };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        users: Math.floor(targets.users * progress),
        verified: Math.floor(targets.verified * progress),
        passports: Math.floor(targets.passports * progress),
        volume: (targets.volume * progress).toFixed(1)
      });

      if (currentStep >= steps) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'ZK-ID Badge',
      description: 'Unique identity proof with Zero-Knowledge Proofs for maximum privacy',
      color: 'from-purple-600 to-blue-600'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Credit Passport',
      description: 'Soulbound NFT representing your on-chain financial reputation',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Proof-as-a-Service',
      description: 'Real-time credibility verification API without revealing personal data',
      color: 'from-cyan-600 to-teal-600'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'AI Risk Oracle',
      description: 'AI-powered risk assessment for more accurate and efficient lending',
      color: 'from-teal-600 to-green-600'
    }
  ];



  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-mesh opacity-30"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center fade-in">
            <div className="inline-block mb-4 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
              <span className="text-purple-400 text-sm font-medium">🚀 Polygon ZK-ID Credit Layer</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Universal Trust in a
              <span className="gradient-text"> Trustless World</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Aura Protocol is a decentralized credibility layer that builds ZK Credit Passports — 
              on-chain financial identities that verify reputation without revealing personal data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/verify"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                data-testid="get-started-btn"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-medium border border-white/20 hover:bg-white/20 transition-all"
                data-testid="learn-more-btn"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16" data-testid="stats-section">
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-purple-400">{stats.users.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-2">Total Users</div>
            </div>
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-blue-400">{stats.verified.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-2">Verified Users</div>
            </div>
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-cyan-400">{stats.passports.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-2">Credit Passports</div>
            </div>
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-green-400">${stats.volume}M</div>
              <div className="text-sm text-gray-400 mt-2">Total Volume</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4" data-testid="features-section">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Key Features</h2>
            <p className="text-gray-400 text-lg">Leading technology for decentralized credibility systems</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 card-hover"
                data-testid={`feature-card-${index}`}
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 px-4" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-3xl border border-purple-500/30">
            <Globe className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Build Your On-Chain Reputation?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join the decentralized credibility ecosystem on Polygon
            </p>
            <Link
              to="/verify"
              className="inline-flex items-center px-8 py-4 bg-white text-purple-900 rounded-lg font-bold hover:shadow-lg hover:shadow-white/30 transition-all"
              data-testid="cta-dashboard-btn"
            >
              Start Verification <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
};

export default LandingPage;
