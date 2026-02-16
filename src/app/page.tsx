'use client';

import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { BurnChart } from '@/components/BurnChart';
import { InflationChart } from '@/components/InflationChart';
import { UnvestingChart } from '@/components/UnvestingChart';
import { PriceDisplay } from '@/components/PriceDisplay';
import { Footer } from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import type { BurnSummary, ChartDataPoint } from '@/types';
import { CONSTANTS } from '@/lib/constants';

interface DailyBurnsResponse {
  success: boolean;
  data: ChartDataPoint[];
  count: number;
  error?: string;
}

interface SummaryResponse {
  success: boolean;
  data: BurnSummary | null;
  error?: string;
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const {
    data: dailyData,
    isLoading: isDailyLoading,
  } = useQuery<DailyBurnsResponse>({
    queryKey: ['daily-burns'],
    queryFn: async () => {
      const res = await fetch('/api/burns/daily');
      if (!res.ok) throw new Error('Failed to fetch daily burns');
      return res.json();
    },
    refetchInterval: CONSTANTS.REFRESH_INTERVAL_MS,
  });

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
  } = useQuery<SummaryResponse>({
    queryKey: ['burn-summary'],
    queryFn: async () => {
      const res = await fetch('/api/burns/summary');
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json();
    },
    refetchInterval: CONSTANTS.REFRESH_INTERVAL_MS,
  });

  const chartData = dailyData?.data || [];
  const summary = summaryData?.data;
  const isLoading = isDailyLoading || isSummaryLoading;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Header
        lastUpdated={summary?.last_updated || null}
        isRefreshing={isLoading}
        onRefresh={() => window.location.reload()}
      />
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Price Display Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Price Overview</h2>
          <div className="flex justify-center">
            <PriceDisplay />
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Burn Statistics</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Burned"
              value={
                summary?.total_uni_burned
                  ? `${formatNumber(summary.total_uni_burned)} UNI`
                  : '0 UNI'
              }
              isLoading={isLoading}
              highlight
            />
            <StatCard
              title="Today's Burns"
              value={
                summary?.today_burns
                  ? `${formatNumber(summary.today_burns)} UNI`
                  : '0 UNI'
              }
              subtitle="Since midnight UTC"
              isLoading={isLoading}
            />
            <StatCard
              title="Burn Rate"
              value={
                summary?.total_uni_burned && chartData.length > 1
                  ? `${(summary.total_uni_burned / chartData.length).toFixed(0)} UNI/day`
                  : '0 UNI/day'
              }
              isLoading={isLoading}
            />
            <StatCard
              title="Current UNI Price"
              value={
                summary?.current_uni_price
                  ? new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(summary.current_uni_price)
                  : '$0.00'
              }
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* Charts Grid */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Analytics</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <BurnChart data={chartData} isLoading={isDailyLoading} />
            <InflationChart currentBurn={summary?.total_uni_burned || 0} />
          </div>
        </section>

        {/* Unvesting Chart */}
        <section className="mb-12">
          <UnvestingChart data={chartData} />
        </section>
      </div>

      <Footer />
    </main>
  );
}
