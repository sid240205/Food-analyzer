"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// Color Palette from the image
const THEME = {
  primary: '#0066FF', // Bright Blue
  secondary: '#F4F7FE', // Light Blue/Gray background
  text: {
    dark: '#1B2559', // Dark Navy for headings
    secondary: '#A3AED0', // Light Gray for secondary text
  },
  success: '#05CD99',
  white: '#FFFFFF'
};

// Reusable Card Component
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/get-orders", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncEmails = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/fetch-orders");
      const json = await res.json();
      if (json.success) {
        alert(`✅ Synced ${json.processed} orders!`);
        fetchData();
      }
    } catch (err) {
      alert("❌ Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE]">
        <div className="w-12 h-12 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.summary.totalOrders === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] p-6">
        <Card className="max-w-md w-full text-center py-12">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📊</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1B2559] mb-2">No data found</h2>
          <p className="text-[#A3AED0] mb-8">Connect your account to get started</p>
          <button
            onClick={syncEmails}
            disabled={syncing}
            className="bg-[#0066FF] text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors w-full"
          >
            {syncing ? "Syncing..." : "Sync Gmail"}
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <p className="text-[#A3AED0] text-sm font-medium mb-1">Good Morning, Foodie!</p>
            <h1 className="text-3xl font-bold text-[#1B2559]">Welcome Back, Dashboard</h1>
          </div>
          <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm w-full md:w-auto">
            <span className="text-gray-400 mr-2">🔍</span>
            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent border-none outline-none text-sm w-full md:w-64 text-[#1B2559] placeholder-[#A3AED0]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-8">

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Blue Card - Total Spent */}
              <div className="bg-[#0066FF] rounded-[20px] p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.29 0 2.13-.72 2.13-1.71 0-1.12-.88-1.58-2.33-2.08l-.99-.36c-1.63-.56-2.91-1.56-2.91-3.5 0-1.81 1.42-3.09 3.08-3.4V4h2.66v1.95c1.61.38 2.91 1.52 2.91 3.35h-1.96c-.03-.92-.96-1.62-2.09-1.62-1.23 0-1.96.74-1.96 1.64 0 .97.66 1.54 2.17 2.05l.96.33c1.79.6 3.1 1.68 3.1 3.51 0 1.9-1.45 3.23-3.22 3.54z" /></svg>
                </div>
                <div className="relative z-10">
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Spent</p>
                  <h3 className="text-3xl font-bold mb-8">₹{data.summary.totalSpent.toLocaleString('en-IN')}</h3>
                  <div className="flex items-center text-sm text-blue-50">
                    <span className="bg-white/20 px-2 py-1 rounded-md mr-2 text-white text-xs font-bold">+12%</span>
                    <span>since last month</span>
                  </div>
                </div>
              </div>

              {/* White Card - Total Orders */}
              <Card>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[#A3AED0] text-sm font-medium">Total Orders</p>
                    <h3 className="text-3xl font-bold text-[#1B2559] mt-1">{data.summary.totalOrders}</h3>
                  </div>
                  <div className="w-10 h-10 bg-[#F4F7FE] rounded-full flex items-center justify-center text-[#0066FF]">
                    🍔
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-[#05CD99] font-bold mr-1">On track</span>
                  <span className="text-[#A3AED0]">this month</span>
                </div>
              </Card>

              {/* White Card - Avg Order Value */}
              <Card>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[#A3AED0] text-sm font-medium">Avg Order Value</p>
                    <h3 className="text-3xl font-bold text-[#1B2559] mt-1">₹{data.summary.averageOrderValue.toFixed(0)}</h3>
                  </div>
                  <div className="w-10 h-10 bg-[#F4F7FE] rounded-full flex items-center justify-center text-[#0066FF]">
                    📈
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-[#05CD99] font-bold mr-1">+2.4%</span>
                  <span className="text-[#A3AED0]">from last week</span>
                </div>
              </Card>
            </div>

            {/* Analytics Chart */}
            <Card className="h-[400px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-[#1B2559]">Analytics</h3>
                <button className="flex items-center gap-2 text-[#A3AED0] hover:text-[#0066FF] transition-colors text-sm font-medium bg-[#F4F7FE] px-3 py-1.5 rounded-lg">
                  Monthly <span className="text-xs">▼</span>
                </button>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={data.monthly}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066FF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E5F2" />
                  <XAxis
                    dataKey="displayMonth"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A3AED0', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A3AED0', fontSize: 12 }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#0066FF"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Recent Transactions List */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#1B2559]">Recent Orders</h3>
                <button className="text-[#0066FF] font-medium text-sm hover:underline">See all</button>
              </div>
              <div className="bg-white rounded-[20px] p-2 shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[#A3AED0] text-sm border-b border-gray-100">
                      <th className="pb-4 pl-4 font-medium">Restaurant</th>
                      <th className="pb-4 font-medium">Date</th>
                      <th className="pb-4 font-medium">Status</th>
                      <th className="pb-4 pr-4 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orderHistory.slice(0, 5).map((order, idx) => (
                      <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-lg">
                              🍽️
                            </div>
                            <span className="font-bold text-[#1B2559]">{order.restaurant}</span>
                          </div>
                        </td>
                        <td className="py-4 text-[#A3AED0] text-sm">{order.date}</td>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">
                            Delivered
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-right font-bold text-[#1B2559]">₹{order.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">

            {/* Card Visualization */}
            <Card className="bg-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1B2559]">Your Food Card</h3>
                <button className="text-[#A3AED0]">⋮</button>
              </div>
              <div className="bg-gradient-to-br from-[#0066FF] to-[#448AFF] rounded-[24px] p-6 text-white mb-8 shadow-xl shadow-blue-200 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>

                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Total Budget</p>
                    <h3 className="text-3xl font-bold">₹50,000</h3>
                  </div>
                  <span className="text-2xl">💳</span>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-blue-100 text-xs mb-1">Card Holder</p>
                    <p className="font-medium tracking-wide">FOODIE</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-xs mb-1">Expires</p>
                    <p className="font-medium">12/25</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-between gap-4 mb-8">
                <button
                  onClick={syncEmails}
                  disabled={syncing}
                  className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-[#0066FF] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                    🔄
                  </div>
                  <span className="text-sm font-medium text-[#1B2559]">{syncing ? 'Syncing' : 'Sync'}</span>
                </button>
                <a
                  href="/api/export-pdf"
                  className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-[#0066FF] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                    ⬇️
                  </div>
                  <span className="text-sm font-medium text-[#1B2559]">Export</span>
                </a>
                <button className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                  <div className="w-12 h-12 bg-[#0066FF] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                    ⚙️
                  </div>
                  <span className="text-sm font-medium text-[#1B2559]">Settings</span>
                </button>
              </div>

              {/* Top Restaurants (Quick Transfer style) */}
              <div>
                <h3 className="text-lg font-bold text-[#1B2559] mb-4">Top Restaurants</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  <button className="flex flex-col items-center min-w-[60px] gap-2">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#A3AED0] flex items-center justify-center text-[#A3AED0]">
                      +
                    </div>
                    <span className="text-xs font-medium text-[#1B2559]">Add</span>
                  </button>
                  {data.restaurantPie.slice(0, 4).map((rest, idx) => (
                    <div key={idx} className="flex flex-col items-center min-w-[60px] gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg border-2 border-white shadow-sm">
                        🍽️
                      </div>
                      <span className="text-xs font-medium text-[#1B2559] truncate w-full text-center">{rest.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Mini Transaction List */}
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1B2559]">Recent Activity</h3>
                <button className="text-[#0066FF] text-xs font-bold">See All</button>
              </div>
              <div className="space-y-6">
                {data.orderHistory.slice(0, 4).map((order, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F4F7FE] flex items-center justify-center text-lg">
                        🍔
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1B2559] truncate max-w-[120px]">{order.restaurant}</p>
                        <p className="text-xs text-[#A3AED0]">{order.date}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#1B2559]">-₹{order.amount}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}