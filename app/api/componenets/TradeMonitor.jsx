'use client';

import { useState, useEffect } from 'react';

export default function TradeMonitor() {
  const [status, setStatus] = useState({ 
    isRunning: false, 
    wsConnected: false, 
    mongoConnected: false 
  });
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    side: '',
    minSize: '',
    walletAddress: ''
  });
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    checkStatus();
    fetchTrades();
    setLastUpdated(new Date().toLocaleTimeString());

    const interval = setInterval(() => {
      checkStatus();
      fetchTrades();
      setLastUpdated(new Date().toLocaleTimeString());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [filters]);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/trades/monitor');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking status:', error);
      setError('Failed to check monitor status');
    }
  };

  const fetchTrades = async () => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '20');
      if (filters.side) params.append('side', filters.side);
      if (filters.minSize) params.append('minSize', filters.minSize);
      if (filters.walletAddress) params.append('walletAddress', filters.walletAddress);

      const response = await fetch(`/api/trades/history?${params}`);
      const data = await response.json();

      if (data.trades) {
        setTrades(data.trades);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
      setError('Failed to fetch trade history');
    }
  };

  const toggleMonitor = async (action) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/trades/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await response.json();

      if (data.success) {
        await checkStatus();
        setError('');
      } else {
        setError(data.error || `Failed to ${action} monitor`);
      }
    } catch (error) {
      console.error('Error toggling monitor:', error);
      setError(`Failed to ${action} monitor`);
    }

    setLoading(false);
  };

  const formatPrice = (price) => `$${parseFloat(price).toFixed(4)}`;
  const formatSize = (size) => parseFloat(size).toLocaleString('en-US', { maximumFractionDigits: 4 });
  const formatUSD = (usd) => `$${parseFloat(usd).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  const formatTime = (timestamp) => new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const formatAddress = (address) => address.length <= 10 ? address : `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">HYPE Token Monitor</h1>
              <p className="text-gray-600 mt-1">Real-time trade notifications for Hyperliquid</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Last updated</div>
              <div className="text-sm font-medium">{lastUpdated}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg border-2 ${status.isRunning ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${status.isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <div className="font-medium">Monitor Status</div>
                  <div className="text-sm text-gray-600">{status.isRunning ? '🟢 Running' : '🔴 Stopped'}</div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${status.wsConnected ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${status.wsConnected ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                <div>
                  <div className="font-medium">WebSocket</div>
                  <div className="text-sm text-gray-600">{status.wsConnected ? '✅ Connected' : '❌ Disconnected'}</div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${status.mongoConnected ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${status.mongoConnected ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                <div>
                  <div className="font-medium">Database</div>
                  <div className="text-sm text-gray-600">{status.mongoConnected ? '✅ Connected' : '❌ Disconnected'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => toggleMonitor('start')}
              disabled={loading || status.isRunning}
              className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-green-600"
            >
              {loading ? 'Starting...' : 'Start Monitor'}
            </button>
            <button
              onClick={() => toggleMonitor('stop')}
              disabled={loading || !status.isRunning}
              className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-red-600"
            >
              {loading ? 'Stopping...' : 'Stop Monitor'}
            </button>
            <button
              onClick={fetchTrades}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trade Side</label>
              <select
                value={filters.side}
                onChange={(e) => setFilters({ ...filters, side: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">All</option>
                <option value="BUY">Buy Only</option>
                <option value="SELL">Sell Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Size (USD)</label>
              <input
                type="number"
                value={filters.minSize}
                onChange={(e) => setFilters({ ...filters, minSize: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
              <input
                type="text"
                value={filters.walletAddress}
                onChange={(e) => setFilters({ ...filters, walletAddress: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Recent Trades ({trades.length})</h2>
          </div>
          <div className="overflow-x-auto p-6">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 uppercase text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Side</th>
                  <th className="px-4 py-2">Size</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Wallet</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{formatTime(trade.timestamp)}</td>
                    <td className="px-4 py-2">{trade.side}</td>
                    <td className="px-4 py-2">{formatUSD(trade.usdSize)}</td>
                    <td className="px-4 py-2">{formatPrice(trade.price)}</td>
                    <td className="px-4 py-2">{formatAddress(trade.wallet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
