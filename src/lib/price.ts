import { db } from './database';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const UNI_COIN_ID = 'uniswap';

// Simple in-memory cache for price data
const priceCache = new Map<string, { data: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get current UNI price from CoinGecko with caching
 */
export async function getCurrentUniPrice(): Promise<number> {
  const cacheKey = 'current-price';
  const cached = priceCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${UNI_COIN_ID}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data[UNI_COIN_ID]?.usd;

    if (typeof price !== 'number') {
      throw new Error('Invalid price data from CoinGecko');
    }

    priceCache.set(cacheKey, { data: price, timestamp: Date.now() });
    return price;
  } catch (error) {
    console.error('Error fetching current UNI price:', error);
    throw error;
  }
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

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${UNI_COIN_ID}/history?date=${dateString}&localization=false`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data.market_data?.current_price?.usd;

    if (typeof price !== 'number') {
      throw new Error('Invalid historical price data from CoinGecko');
    }

    priceCache.set(cacheKey, { data: price, timestamp: Date.now() });
    return price;
  } catch (error) {
    console.error(`Error fetching historical UNI price for ${dateString}:`, error);
    throw error;
  }
}

/**
 * Get 24-hour price change percentage
 */
export async function get24hPriceChange(): Promise<number> {
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

    return change;
  } catch (error) {
    console.error('Error fetching 24h price change:', error);
    throw error;
  }
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
