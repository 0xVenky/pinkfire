'use client';

import React from 'react';

interface PriceChangeIndicatorProps {
  /** The percentage change in price (positive or negative) */
  changePercent: number;
  /** Optional variant: 'default', 'compact', 'badge', or 'trend-line' */
  variant?: 'default' | 'compact' | 'badge' | 'trend-line';
  /** Current price (for trend-line variant) */
  currentPrice?: number;
  /** Size variant for badge */
  size?: 'sm' | 'md';
}

// Memoized arrow icon component
const ArrowIcon = React.memo(
  ({ isPositive, isNeutral }: { isPositive: boolean; isNeutral: boolean }) => {
    if (isNeutral) {
      return (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    }

    return (
      <svg
        className={`w-5 h-5 transition-transform duration-300 ${
          isPositive ? '' : 'rotate-180'
        }`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    );
  }
);
ArrowIcon.displayName = 'ArrowIcon';

// Memoized trend line component
const TrendLine = React.memo(
  ({ isPositive, isNeutral }: { isPositive: boolean; isNeutral: boolean }) => {
    if (isPositive) {
      return (
        <svg
          className="w-12 h-8 text-pinkfire-green"
          viewBox="0 0 48 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2,28 12,20 20,24 28,14 36,10 46,4"></polyline>
        </svg>
      );
    }
    if (isNeutral) {
      return (
        <svg
          className="w-12 h-8 text-gray-400"
          viewBox="0 0 48 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2,16 12,15 20,17 28,16 36,15 46,16"></polyline>
        </svg>
      );
    }
    return (
      <svg
        className="w-12 h-8 text-pinkfire-red"
        viewBox="0 0 48 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="2,4 12,12 20,8 28,18 36,22 46,28"></polyline>
      </svg>
    );
  }
);
TrendLine.displayName = 'TrendLine';

// Memoized compact arrow icon
const CompactArrowIcon = React.memo(
  ({ isPositive, isNeutral }: { isPositive: boolean; isNeutral: boolean }) => (
    <svg
      className={`w-4 h-4 transition-transform duration-300 ${
        !isPositive && !isNeutral ? 'rotate-180' : ''
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isNeutral ? (
        <line x1="5" y1="12" x2="19" y2="12" />
      ) : (
        <polyline points="18 15 12 9 6 15"></polyline>
      )}
    </svg>
  )
);
CompactArrowIcon.displayName = 'CompactArrowIcon';

// Memoized badge icon
const BadgeIcon = React.memo(
  ({
    isPositive,
    isNeutral,
    size,
  }: {
    isPositive: boolean;
    isNeutral: boolean;
    size: 'sm' | 'md';
  }) => (
    <svg
      className={`transition-transform duration-300 ${
        size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'
      } ${
        !isPositive && !isNeutral ? 'rotate-180' : ''
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isNeutral ? (
        <line x1="5" y1="12" x2="19" y2="12" />
      ) : (
        <polyline points="18 15 12 9 6 15"></polyline>
      )}
    </svg>
  )
);
BadgeIcon.displayName = 'BadgeIcon';

/**
 * PriceChangeIndicator Component
 * Displays the 24-hour price change with visual indicators (arrow/trend line)
 * Can be used in multiple variants to fit different UI contexts
 */
export const PriceChangeIndicator: React.FC<PriceChangeIndicatorProps> = ({
  changePercent,
  variant = 'default',
  currentPrice,
  size = 'md',
}) => {
  const absPercentage = Math.abs(changePercent).toFixed(2);
  const isPositive = changePercent > 0;
  const isNeutral = changePercent === 0;

  // Color classes based on change direction
  const colorClasses = isPositive
    ? 'text-pinkfire-green'
    : isNeutral
      ? 'text-gray-400'
      : 'text-pinkfire-red';

  const bgColorClasses = isPositive
    ? 'bg-pinkfire-green/10 border-pinkfire-green/30'
    : isNeutral
      ? 'bg-gray-700/30 border-gray-600/30'
      : 'bg-pinkfire-red/10 border-pinkfire-red/30';

  // Default variant: arrow + percentage
  if (variant === 'default') {
    return (
      <div className={`flex items-center gap-1.5 transition-all duration-300 ${colorClasses}`}>
        <ArrowIcon isPositive={isPositive} isNeutral={isNeutral} />
        <span className="text-xl font-semibold">{absPercentage}%</span>
      </div>
    );
  }

  // Compact variant: smaller version
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${colorClasses}`}>
        <CompactArrowIcon isPositive={isPositive} isNeutral={isNeutral} />
        <span className="text-sm font-semibold">{absPercentage}%</span>
      </div>
    );
  }

  // Badge variant: pill-shaped with background
  if (variant === 'badge') {
    const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5';
    return (
      <div
        className={`inline-flex items-center gap-1.5 border rounded-full transition-all duration-300 ${sizeClasses} ${bgColorClasses} ${colorClasses}`}
      >
        <BadgeIcon isPositive={isPositive} isNeutral={isNeutral} size={size} />
        <span
          className={`font-semibold ${
            size === 'sm' ? 'text-xs' : 'text-sm'
          }`}
        >
          {absPercentage}%
        </span>
      </div>
    );
  }

  // Trend-line variant: mini chart with price
  if (variant === 'trend-line') {
    return (
      <div className="flex items-center gap-3">
        <TrendLine isPositive={isPositive} isNeutral={isNeutral} />
        <div>
          {currentPrice && (
            <p className="text-white font-semibold">${currentPrice.toFixed(2)}</p>
          )}
          <p className={`text-xs font-semibold ${colorClasses}`}>
            {changePercent > 0 ? '+' : changePercent < 0 ? '-' : ''}
            {absPercentage}%
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default PriceChangeIndicator;
