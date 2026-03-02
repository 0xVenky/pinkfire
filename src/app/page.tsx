'use client';

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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { BurnSummary, ChartDataPoint } from '@/types';
import { CONSTANTS } from '@/lib/constants';
import { useState, useCallback } from 'react';

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
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: dailyData,
    isLoading: isDailyLoading,
    error: dailyError,
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
    error: summaryError,
  } = useQuery<SummaryResponse>({
    queryKey: ['burn-summary'],
    queryFn: async () => {
      const res = await fetch('/api/burns/summary');
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json();
    },
    refetchInterval: CONSTANTS.REFRESH_INTERVAL_MS,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/burns/refresh');
      await queryClient.invalidateQueries({ queryKey: ['daily-burns'] });
      await queryClient.invalidateQueries({ queryKey: ['burn-summary'] });
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const chartData = dailyData?.data || [];
  const summary = summaryData?.data;
  const isLoading = isDailyLoading || isSummaryLoading;
  const hasError = dailyError || summaryError;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#16161f] to-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Header
          lastUpdated={summary?.last_updated || null}
          isRefreshing={isRefreshing || isLoading}
          onRefresh={handleRefresh}
        />
        {/* Data refresh status indicator */}
        <RefreshIndicator />

        {hasError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400">
              Error loading data. Please try refreshing.
            </p>
          </div>
        )}

        {/* Price Change Widget Section */}
        <section aria-label="Price information" className="mb-12 flex justify-center">
          <PriceChangeWidget />
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            title="Total UNI Burned"
            value={
              summary?.total_uni_burned
                ? `${formatNumber(summary.total_uni_burned)} UNI`
                : '0 UNI'
            }
            subtitle={
              summary?.historical_usd_value
                ? `USD Value at burn: ${formatUSD(summary.historical_usd_value)}`
                : undefined
            }
            isLoading={isLoading}
            highlight
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
        </div>

        {/* Inflation Analysis Chart */}
        <InflationChart currentBurn={summary?.total_uni_burned || 0} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 mt-6">
          <div>
            <h2 className="text-2xl font-bold text-[#f1f5f9] mb-6">Burn History</h2>
            <BurnChart data={chartData} isLoading={isDailyLoading} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#f1f5f9] mb-6">Unvesting Comparison</h2>
            <UnvestingChart data={chartData} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}