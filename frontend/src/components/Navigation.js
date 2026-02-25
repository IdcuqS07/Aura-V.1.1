import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Wallet, LogOut, ChevronDown } from 'lucide-react';
import { useWallet } from './WalletContext';
import NetworkSelector from './NetworkSelector';

const ADMIN_WALLETS = ['0xc3ece9ac328cb232ddb0bc677d2e980a1a3d3974'];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [passportDropdown, setPassportDropdown] = useState(false);
  const [developerDropdown, setDeveloperDropdown] = useState(false);
  const [passportTimeout, setPassportTimeout] = useState(null);
  const [developerTimeout, setDeveloperTimeout] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState('polygon_amoy');
  const location = useLocation();
  const { address, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();

  const isAdmin = isConnected && ADMIN_WALLETS.includes(address?.toLowerCase());

  const handleMouseEnter = (type) => {
    if (type === 'passport') {
      if (passportTimeout) clearTimeout(passportTimeout);
      setPassportDropdown(true);
    } else {
      if (developerTimeout) clearTimeout(developerTimeout);
      setDeveloperDropdown(true);
    }
  };

  const handleMouseLeave = (type) => {
    if (type === 'passport') {
      const timeout = setTimeout(() => setPassportDropdown(false), 200);
      setPassportTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setDeveloperDropdown(false), 200);
      setDeveloperTimeout(timeout);
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/poh', label: 'Verify' },
    { 
      label: 'Passport',
      dropdown: [
        { path: '/passport', label: 'My Passport' },
        { path: '/dashboard', label: 'Portfolio' },
        { path: '/badges', label: 'Badges' },
      ]
    },
    { path: '/oracle', label: 'AI Oracle' },
    { 
      label: 'Developer',
      dropdown: [
        { path: '/api', label: 'API Docs' },
        { path: '/partner/verify', label: 'Partner Portal' },
        { path: '/contracts', label: 'Multi-Chain' },
        { path: '/crosschain', label: 'Cross-Chain Explorer' },
      ]
    },
  ];

  const isActive = (path) => location.pathname === path;

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" data-testid="nav-logo">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Aura Protocol</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-6">
            {navItems.map((item, idx) => (
              item.dropdown ? (
                <div key={idx} className="relative group">
                  <button
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1 pb-1"
                    onMouseEnter={() => handleMouseEnter(item.label === 'Passport' ? 'passport' : 'developer')}
                    onMouseLeave={() => handleMouseLeave(item.label === 'Passport' ? 'passport' : 'developer')}
                  >
                    {item.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {((item.label === 'Passport' && passportDropdown) || (item.label === 'Developer' && developerDropdown)) && (
                    <div 
                      className="absolute top-full left-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-lg border border-purple-500/20 rounded-lg shadow-xl py-2 z-50"
                      onMouseEnter={() => handleMouseEnter(item.label === 'Passport' ? 'passport' : 'developer')}
                      onMouseLeave={() => handleMouseLeave(item.label === 'Passport' ? 'passport' : 'developer')}
                    >
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            isActive(subItem.path)
                              ? 'text-purple-400 bg-purple-500/10'
                              : 'text-gray-300 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive(item.path)
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-gray-300 hover:text-white hover:border-b-2 hover:border-gray-500'
                  } pb-1`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>

          {/* Connect Wallet Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <NetworkSelector 
              currentNetwork={selectedNetwork}
              onNetworkChange={(network) => setSelectedNetwork(network.id)}
            />
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-mono text-sm">{formatAddress(address)}</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="p-2 text-gray-400 hover:text-white transition"
                  data-testid="disconnect-wallet-btn"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="connect-wallet-btn"
              >
                <Wallet className="w-5 h-5" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white"
            data-testid="mobile-menu-btn"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-lg" data-testid="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item, idx) => (
              item.dropdown ? (
                <div key={idx}>
                  <div className="px-3 py-2 text-base font-medium text-gray-400">
                    {item.label}
                  </div>
                  {item.dropdown.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-6 py-2 rounded-md text-sm ${
                        isActive(subItem.path)
                          ? 'text-purple-400 bg-slate-800'
                          : 'text-gray-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'text-purple-400 bg-slate-800'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
            <div className="pt-2 border-t border-gray-700 mt-2">
              {isConnected ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                    <div className="text-white font-mono text-sm">{formatAddress(address)}</div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="w-full px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Wallet className="w-5 h-5" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
