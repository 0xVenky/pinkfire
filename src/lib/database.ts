import { createClient } from '@libsql/client';
import type { DailyBurn, BurnTransaction } from '@/types';
import { CONSTANTS } from './constants';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url: url || 'file:local.db',
  authToken: authToken,
});

export async function getDailyBurns(): Promise<DailyBurn[]> {
  const result = await db.execute({
    sql: `
      SELECT * FROM daily_burns
      WHERE date >= ?
      ORDER BY date ASC
    `,
    args: [CONSTANTS.START_DATE]
  });
  return result.rows as unknown as DailyBurn[];
}

export async function getDailyBurnByDate(date: string): Promise<DailyBurn | undefined> {
  const result = await db.execute({
    sql: 'SELECT * FROM daily_burns WHERE date = ?',
    args: [date]
  });
  return result.rows[0] as unknown as DailyBurn | undefined;
}

export async function upsertDailyBurn(burn: DailyBurn): Promise<void> {
  await db.execute({
    sql: `
      INSERT INTO daily_burns (date, cumulative_uni, daily_uni, uni_price_usd, daily_usd_value, cumulative_usd_value, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        cumulative_uni = excluded.cumulative_uni,
        daily_uni = excluded.daily_uni,
        uni_price_usd = excluded.uni_price_usd,
        daily_usd_value = excluded.daily_usd_value,
        cumulative_usd_value = excluded.cumulative_usd_value,
        updated_at = excluded.updated_at
    `,
    args: [
      burn.date,
      burn.cumulative_uni,
      burn.daily_uni,
      burn.uni_price_usd || null,
      burn.daily_usd_value || null,
      burn.cumulative_usd_value || null,
      burn.updated_at
    ]
  });
}

export async function getBurnTransactions(): Promise<BurnTransaction[]> {
  const result = await db.execute(`
    SELECT * FROM burn_transactions
    ORDER BY timestamp DESC
  `);
  return result.rows as unknown as BurnTransaction[];
}


export async function getRecentBurnTransactions(limit: number = 5): Promise<BurnTransaction[]> {
  const result = await db.execute({
    sql: `
      SELECT * FROM burn_transactions
      ORDER BY timestamp DESC
      LIMIT ?
    `,
    args: [limit]
  });
  return result.rows as unknown as BurnTransaction[];
}


export async function getLatestBurnTransaction(): Promise<BurnTransaction | undefined> {
  const result = await db.execute(`
    SELECT * FROM burn_transactions
    ORDER BY block_number DESC
    LIMIT 1
  `);
  return result.rows[0] as unknown as BurnTransaction | undefined;
}

export async function insertBurnTransaction(tx: BurnTransaction): Promise<void> {
  await db.execute({
    sql: `
      INSERT OR IGNORE INTO burn_transactions
      (tx_hash, block_number, timestamp, uni_amount, uni_price_usd, usd_value, from_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      tx.tx_hash,
      tx.block_number,
      tx.timestamp,
      tx.uni_amount,
      tx.uni_price_usd || null,
      tx.usd_value || null,
      tx.from_address
    ]
  });
}

export async function insertManyBurnTransactions(txs: BurnTransaction[]): Promise<void> {
  // @libsql/client supports batch transactions
  const statements = txs.map(tx => ({
    sql: `
      INSERT OR IGNORE INTO burn_transactions
      (tx_hash, block_number, timestamp, uni_amount, uni_price_usd, usd_value, from_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      tx.tx_hash,
      tx.block_number,
      tx.timestamp,
      tx.uni_amount,
      tx.uni_price_usd || null,
      tx.usd_value || null,
      tx.from_address
    ]
  }));

  if (statements.length > 0) {
    await db.batch(statements);
  }
}

export async function getTotalBurned(): Promise<number> {
  const result = await db.execute({
    sql: `
      SELECT SUM(uni_amount) as total FROM burn_transactions
      WHERE timestamp >= ?
    `,
    args: [CONSTANTS.START_DATE]
  });
  const row = result.rows[0] as unknown as { total: number | null };
  return row?.total || 0;
}

export async function getTodayBurns(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const result = await db.execute({
    sql: `
      SELECT SUM(uni_amount) as total FROM burn_transactions
      WHERE date(timestamp) = ?
    `,
    args: [today]
  });
  const row = result.rows[0] as unknown as { total: number | null };
  return row?.total || 0;
}

export async function getHistoricalUsdValue(): Promise<number> {
  const result = await db.execute({
    sql: `
      SELECT SUM(usd_value) as total FROM burn_transactions
      WHERE usd_value IS NOT NULL AND timestamp >= ?
    `,
    args: [CONSTANTS.START_DATE]
  });
  const row = result.rows[0] as unknown as { total: number | null };
  return row?.total || 0;
}

export async function getLatestDailyBurn(): Promise<DailyBurn | undefined> {
  const result = await db.execute(`
    SELECT * FROM daily_burns
    ORDER BY date DESC
    LIMIT 1
  `);
  return result.rows[0] as unknown as DailyBurn | undefined;
}

export async function clearAllData(): Promise<void> {
  await db.batch([
    'DELETE FROM daily_burns',
    'DELETE FROM burn_transactions'
  ]);
}
