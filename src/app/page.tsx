'use client';

import React from 'react';
import {
  Header,
  StatCard,
  BurnChart,
  InflationChart,
  UnvestingChart,
  RefreshIndicator,
  Footer,
  PriceChangeWidget,
} from '@/components';

const Home = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#16161f] to-[#0a0a0f]">
      <Header />
      <RefreshIndicator />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Price Change Widget Section */}
        <div className="mb-12 flex justify-center">
          <PriceChangeWidget />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            title="Total Burned"
            value="$0.00"
            description="UNI tokens transferred to dead address"
          />
          <StatCard
            title="Daily Burn Rate"
            value="0"
            description="Average UNI burned per day"
          />
          <StatCard
            title="24h Volume"
            value="$0.00"
            description="Value burned in the last 24 hours"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold text-[#f1f5f9] mb-6">Burn History</h2>
            <BurnChart />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#f1f5f9] mb-6">Inflation Analysis</h2>
            <InflationChart />
          </div>
        </div>

        {/* Unvesting Chart */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#f1f5f9] mb-6">Unvesting Comparison</h2>
          <UnvestingChart />
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default Home;
