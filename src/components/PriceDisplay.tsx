'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

interface PriceData {
  currentPrice: number;
  change24h: number;
  lastUpdated: string;
}

export function PriceDisplay() {
  const [displayPrice, setDisplayPrice] = useState<number | null>(null);
  const [displayChange, setDisplayChange] = useState<number | null>(null);
  const [displayTime, setDisplayTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const isPositive = displayChange !== null && displayChange > 0;
  const isNeutral = displayChange === 0;

  const { data, isLoading: isQueryLoading, refetch } = useQuery<PriceData>({
    queryKey: ['uniPrice'],
    queryFn: async () => {
      const response = await fetch('/api/burns/summary');
      if (!response.ok) throw new Error('Failed to fetch price data');
      const jsonData = await response.json();
      // Safely extract price data with fallbacks
      const priceData = jsonData.data || {};
      return {
        currentPrice: priceData.current_uni_price ?? 0,
        change24h: priceData.change_24h ?? 0,
        lastUpdated: new Date().toLocaleTimeString(),
      };
    },
    refetchInterval: 8000,
    staleTime: 7000,
  });

  // Initialize display on first mount
  useEffect(() => {
    setDisplayPrice(0);
    setDisplayChange(0);
    setDisplayTime(new Date().toLocaleTimeString());
  }, []);

  // Update display when data changes
  useEffect(() => {
    if (data) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setDisplayPrice(data.currentPrice);
        setDisplayChange(data.change24h);
        setDisplayTime(data.lastUpdated);
        setAnimationKey((prev) => prev + 1);
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const handleManualRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await refetch();
    } finally {
      setIsLoading(false);
    }
  }, [refetch]);

  const formatPrice = (val: number): string => {
    return val.toFixed(2);
  };

  const formatChange = (val: number): string => {
    return Math.abs(val).toFixed(2);
  };

  return (
    <div className="w-full max-w-md">
      {/* Price Display Card */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        {/* Animated background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10"></div>

        {/* Loading indicator */}
        {(isLoading || isQueryLoading) && (
          <div className="absolute right-4 top-4">
            <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500"></div>
          </div>
        )}

        {/* Header */}
        <div className="relative mb-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
              <svg
                className="h-6 w-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-400">UNI Token</h2>
              <p className="text-xs text-gray-500">Uniswap</p>
            </div>
          </div>
        </div>

        {/* Main Price Display */}
        <div key={animationKey} className="relative mb-4">
          <div className="mb-3 flex animate-in slide-in-from-bottom-1 duration-300 items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight">
              ${displayPrice !== null ? formatPrice(displayPrice) : '0.00'}
            </span>
            <span className="text-lg text-gray-500">USD</span>
          </div>

          {/* 24h Change */}
          <div className="flex animate-in slide-in-from-bottom-1 duration-300 items-center gap-2">
            {/* Arrow indicator */}
            <div
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all duration-300 ${
                isPositive ? 'bg-emerald-500/20' : isNeutral ? 'bg-gray-500/20' : 'bg-red-500/20'
              }`}
            >
              <svg
                className={`h-4 w-4 transition-transform duration-300 ${
                  isPositive ? 'text-emerald-400 rotate-0' : isNeutral ? 'text-gray-400 rotate-0' : 'text-red-400 rotate-180'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              <span
                className={`text-sm font-semibold ${
                  isPositive ? 'text-emerald-400' : isNeutral ? 'text-gray-400' : 'text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {displayChange !== null ? formatChange(displayChange) : '0.00'}%
              </span>
            </div>
            <span className="text-sm text-gray-500">24h change</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative flex items-center justify-between border-t border-gray-800 pt-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
          <span className="text-xs text-gray-600">
            {displayTime ? `Updated ${displayTime}` : 'Loading...'}
          </span>
        </div>
      </div>

      {/* Manual refresh button */}
      <button
        onClick={handleManualRefresh}
        disabled={isLoading || isQueryLoading}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-purple-500 hover:to-pink-500 hover:shadow-purple-500/25 active:scale-95 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-700"
        aria-busy={isLoading || isQueryLoading}
        aria-label="Refresh UNI price"
      >
        {isLoading || isQueryLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Updating...
          </span>
        ) : (
          'Refresh Price'
        )}
      </button>

      {/* Info note */}
      <div className="mt-6 rounded-lg border border-gray-800 bg-gray-900/50 p-4">
        <p className="text-xs leading-relaxed text-gray-500">
          <span className="font-medium text-gray-400">Note:</span> This component
          displays live UNI price data with 24-hour percentage change. Data is
          automatically refreshed every 8 seconds via React Query integration with
          the price service module.
        </p>
      </div>
    </div>
  );
}
