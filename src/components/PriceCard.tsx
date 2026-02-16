'use client';

import React from 'react';
import { PriceChangeIndicator } from './PriceChangeIndicator';

interface PriceCardProps {
  /** Current UNI price */
  currentPrice: number;
  /** 24-hour price change percentage */
  changePercent24h: number;
  /** Optional loading state */
  isLoading?: boolean;
  /** Optional error message */
  error?: string | null;
}

/**
 * PriceCard Component
 * Displays the current UNI price with 24-hour change indicator
 * Used as the middle card in the dashboard
 */
export const PriceCard: React.FC<PriceCardProps> = ({
  currentPrice,
  changePercent24h,
  isLoading = false,
  error = null,
}) => {
  if (error) {
    return (
      <div className="bg-pinkfire-card border border-pinkfire-border rounded-lg p-6">
        <p className="text-gray-400 text-sm mb-1">UNI Price (24h)</p>
        <p className="text-pinkfire-red text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-pinkfire-card border border-pinkfire-border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">UNI Price (24h)</p>
          <div className="flex items-baseline gap-3">
            {isLoading ? (
              <div
                className="h-10 w-32 bg-pinkfire-border rounded animate-pulse"
                role="status"
                aria-label="Loading UNI price"
              />
            ) : (
              <>
                <span className="text-white text-4xl font-bold">
                  ${currentPrice.toFixed(2)}
                </span>
                <PriceChangeIndicator changePercent={changePercent24h} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCard;
