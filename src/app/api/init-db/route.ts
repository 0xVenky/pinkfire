import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await db.execute(`
      CREATE TABLE IF NOT EXISTS daily_burns (
        date TEXT PRIMARY KEY,
        cumulative_uni REAL NOT NULL,
        daily_uni REAL NOT NULL,
        uni_price_usd REAL,
        daily_usd_value REAL,
        cumulative_usd_value REAL,
        updated_at TEXT NOT NULL
      )
    `);

        await db.execute(`
      CREATE TABLE IF NOT EXISTS burn_transactions (
        tx_hash TEXT PRIMARY KEY,
        block_number INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        uni_amount REAL NOT NULL,
        uni_price_usd REAL,
        usd_value REAL,
        from_address TEXT NOT NULL
      )
    `);

        await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_burn_transactions_timestamp
      ON burn_transactions(timestamp)
    `);

        await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_daily_burns_date
      ON daily_burns(date)
    `);

        return NextResponse.json({ success: true, message: 'Database initialized successfully' });
    } catch (error) {
        console.error('Error initializing database:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
