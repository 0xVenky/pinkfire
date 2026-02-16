'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface PriceChangeWidgetProps {
  className?: string;
}

interface PriceData {
  currentPrice: number;
  priceChange24h: number;
  lastUpdated: string;
}

const PriceChangeWidget: React.FC<PriceChangeWidgetProps> = ({ className = '' }) => {
  const [localTime, setLocalTime] = useState<string>('');

  useEffect(() => {
    setLocalTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setLocalTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: priceData, isLoading } = useQuery<PriceData>({
    queryKey: ['uniPrice'],
    queryFn: async () => {
      const response = await fetch('/api/burns/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }
      const json = await response.json();
      return {
        currentPrice: json.currentPrice || 0,
        priceChange24h: json.priceChange24h || 0,
        lastUpdated: new Date().toISOString(),
      };
    },
    refetchInterval: 3000, // Refetch every 3 seconds
    staleTime: 2000,
  });

  const displayPrice = priceData?.currentPrice ?? 0;
  const displayChange = priceData?.priceChange24h ?? 0;
  const isPositive = displayChange > 0;

  const formatPrice = (value: number): string => {
    return value.toFixed(2);
  };

  const formatChange = (value: number): string => {
    return Math.abs(value).toFixed(2);
  };

  return (
    <div className={`w-full max-w-sm ${className}`}>
      {/* Price Indicator Card */}
      <div className="bg-[#16161f] rounded-xl p-8 border border-[#2e2e3a] shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5">
        {/* Token Label */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </div>
          <span className="text-[#94a3b8] text-sm font-medium tracking-wide">UNI TOKEN</span>
        </div>

        {/* Price Display with Arrow and Change on Right */}
        <div className="flex items-start justify-between gap-6 mb-4">
          <div className="text-5xl font-bold text-[#f1f5f9] tracking-tight">
            $
            {isLoading ? (
              <span className="animate-pulse">--.-</span>
            ) : (
              <span>{formatPrice(displayPrice)}</span>
            )}
          </div>

          {/* Right Side: Arrow and Change Stacked Vertically */}
          <div className="flex flex-col items-end gap-2">
            {/* Direction Arrow */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'
              }`}
              aria-label={isPositive ? 'Price increased' : 'Price decreased'}
              role="img"
            >
              {isPositive ? (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H9M17 7V15"
                  />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 7L7 17M7 17H15M7 17V9"
                  />
                </svg>
              )}
            </div>

            {/* Percentage Change */}
            <div
              className={`transition-all duration-300 ease-in-out px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 ${
                isPositive ? 'bg-[#22c55e]/10' : 'bg-[#ef4444]/10'
              }`}
            >
              <svg
                className={`w-3 h-3 transition-transform duration-300 ${
                  isPositive ? 'text-[#22c55e] rotate-0' : 'text-[#ef4444] rotate-180'
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M7 14l5-5 5 5H7z" />
              </svg>
              <span
                className={`text-sm font-semibold ${
                  isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'
                }`}
              >
                {isLoading ? (
                  <span className="animate-pulse">--.--</span>
                ) : (
                  <>
                    <span>{formatChange(displayChange)}</span>%
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 24h Change Label */}
        <div className="flex justify-end">
          <span className="text-xs text-[#94a3b8]">24h change</span>
        </div>

        {/* Optional: Last Update Time */}
        <div className="mt-6 pt-6 border-t border-[#2e2e3a]">
          <div className="flex items-center justify-between text-xs text-[#94a3b8]">
            <span>Last updated</span>
            <span>{localTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChangeWidget;
