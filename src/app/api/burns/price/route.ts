import { NextRequest, NextResponse } from 'next/server';
import { getPriceChangeData } from '@/lib/price';

/**
 * GET /api/burns/price
 * Returns current UNI price and 24-hour price change data
 */
export async function GET(_request: NextRequest) {
  try {
    const priceData = await getPriceChangeData();

    return NextResponse.json(
      {
        success: true,
        data: {
          currentPrice: priceData.currentPrice,
          changePercent24h: priceData.changePercent,
          price24hAgo: priceData.price24hAgo,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching price data:', error);

    // Distinguish between API timeouts/service unavailable and other errors
    const isServiceUnavailable =
      error instanceof Error &&
      (error.message.includes('Fetch timeout') ||
        error.message.includes('503') ||
        error.message.includes('429'));

    const status = isServiceUnavailable ? 503 : 500;
    const errorMessage = isServiceUnavailable
      ? 'Price service temporarily unavailable'
      : 'Failed to fetch price data';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status }
    );
  }
}
