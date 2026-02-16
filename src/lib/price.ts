import { CONSTANTS } from './constants';

const UNI_COIN_ID = 'uniswap';
const COINGECKO_API_BASE = CONSTANTS.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';

// In-memory cache for price data with request deduplication
const priceCache = new Map<string, { data: number; timestamp: number }>();
const priceRequests = new Map<string, Promise<number>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get current UNI price from CoinGecko with caching and request deduplication
 */
export async function getCurrentUniPrice(): Promise<number> {
  const cacheKey = 'current-price';
  const cached = priceCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Return in-flight request if one exists
  if (priceRequests.has(cacheKey)) {
    return priceRequests.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=${UNI_COIN_ID}&vs_currencies=usd`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const price = data[UNI_COIN_ID]?.usd;

      if (typeof price !== 'number' || price <= 0) {
        throw new Error('Invalid price data from CoinGecko');
      }

      priceCache.set(cacheKey, { data: price, timestamp: Date.now() });
      return price;
    } finally {
      priceRequests.delete(cacheKey);
    }
  })();

  priceRequests.set(cacheKey, promise);
  return promise;
}

/**
 * Get UNI price as of a specific date from CoinGecko
 * @param date Date in format 'dd-mm-yyyy' or as Date object
 */
export async function getHistoricalUniPrice(date: string | Date): Promise<number> {
  const dateString = date instanceof Date ? formatDateForCoinGecko(date) : date;
  const cacheKey = `historical-${dateString}`;
  const cached = priceCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Return in-flight request if one exists
  if (priceRequests.has(cacheKey)) {
    return priceRequests.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(
        `${COINGECKO_API_BASE}/coins/${UNI_COIN_ID}/history?date=${dateString}&localization=false`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const price = data.market_data?.current_price?.usd;

      if (typeof price !== 'number' || price <= 0) {
        throw new Error('Invalid historical price data from CoinGecko');
      }

      priceCache.set(cacheKey, { data: price, timestamp: Date.now() });
      return price;
    } finally {
      priceRequests.delete(cacheKey);
    }
  })();

  priceRequests.set(cacheKey, promise);
  return promise;
}

/**
 * Get 24-hour price change percentage
 */
export async function get24hPriceChange(): Promise<number> {
  const cacheKey = '24h-change';
  const cached = priceCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Return in-flight request if one exists
  if (priceRequests.has(cacheKey)) {
    return priceRequests.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=${UNI_COIN_ID}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24h_change=true`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const change = data[UNI_COIN_ID]?.usd_24h_change;

      if (typeof change !== 'number') {
        throw new Error('Invalid 24h change data from CoinGecko');
      }

      priceCache.set(cacheKey, { data: change, timestamp: Date.now() });
      return change;
    } finally {
      priceRequests.delete(cacheKey);
    }
  })();

  priceRequests.set(cacheKey, promise);
  return promise;
}

/**
 * Calculate price 24 hours ago
 */
export async function getPriceChangeData(): Promise<{
  currentPrice: number;
  price24hAgo: number;
  changePercent: number;
}> {
  try {
    const currentPrice = await getCurrentUniPrice();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const price24hAgo = await getHistoricalUniPrice(yesterday);

    if (price24hAgo <= 0) {
      throw new Error('Invalid historical price: must be greater than zero');
    }

    if (currentPrice <= 0) {
      throw new Error('Invalid current price: must be greater than zero');
    }

    const changePercent = ((currentPrice - price24hAgo) / price24hAgo) * 100;

    return {
      currentPrice,
      price24hAgo,
      changePercent,
    };
  } catch (error) {
    console.error('Error calculating price change data:', error);
    throw error;
  }
}

/**
 * Clear the price cache (useful for testing or manual cache clearing)
 */
export function clearPriceCache(): void {
  priceCache.clear();
  priceRequests.clear();
}

/**
 * Format date for CoinGecko API (dd-mm-yyyy)
 */
function formatDateForCoinGecko(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
