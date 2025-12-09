import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';

const DeFiPositions = ({ walletAddress }) => {
  const [defiData, setDefiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) return;

    const fetchDefiData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/defi/${walletAddress}`);
        const data = await response.json();
        setDefiData(data.data);
      } catch (error) {
        console.error('Error fetching DeFi data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDefiData();
  }, [walletAddress]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!defiData) return null;

  const { summary, protocols } = defiData;
  const aave = protocols?.aave || {};

  const getHealthColor = (healthFactor) => {
    if (healthFactor === 0) return 'text-gray-500';
    if (healthFactor >= 2.0) return 'text-green-500';
    if (healthFactor >= 1.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskBadge = (riskScore) => {
    if (riskScore < 40) return <Badge className="bg-green-500">Low Risk</Badge>;
    if (riskScore < 70) return <Badge className="bg-yellow-500">Medium Risk</Badge>;
    return <Badge className="bg-red-500">High Risk</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            DeFi Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Supplied</p>
              <p className="text-2xl font-bold text-green-600">
                ${summary.total_supplied_usd?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Borrowed</p>
              <p className="text-2xl font-bold text-orange-600">
                ${summary.total_borrowed_usd?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Net Position</p>
              <p className={`text-2xl font-bold ${summary.net_position_usd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${summary.net_position_usd?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Protocols Used</p>
              <p className="text-2xl font-bold text-purple-600">
                {summary.protocols_used || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aave Position */}
      {aave.total_collateral_usd > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Aave V3 Position</span>
              {aave.health_factor > 0 && (
                <span className={`text-sm font-normal ${getHealthColor(aave.health_factor)}`}>
                  Health Factor: {aave.health_factor.toFixed(2)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Collateral</p>
                  <p className="text-xl font-semibold">${aave.total_collateral_usd.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Debt</p>
                  <p className="text-xl font-semibold">${aave.total_debt_usd.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available to Borrow</p>
                  <p className="text-xl font-semibold">${aave.available_borrow_usd.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">LTV</p>
                  <p className="text-xl font-semibold">{aave.ltv}%</p>
                </div>
              </div>

              {aave.health_factor > 0 && aave.health_factor < 1.5 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Low health factor! Consider adding collateral to avoid liquidation.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>DeFi Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Risk Score</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold">
                  {summary.risk_score || 50}/100
                </div>
                {getRiskBadge(summary.risk_score || 50)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Data Source</p>
              <p className="text-sm font-medium">
                {defiData.is_real_data ? '🟢 Live On-chain' : '🟡 Mock Data'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeFiPositions;
