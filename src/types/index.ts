export interface DailyBurn {
  date: string;
  burnAmount: number;
  burnsCount: number;
  avgGasPrice: number | null;
  avgUsdValue: number | null;
}

export interface BurnTransaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: number;
  gasPrice: number | null;
  usdValue: number | null;
}

export interface BurnSummary {
  totalBurned: number;
  dailyAggregates: DailyBurn[];
  lastUpdated: string;
}

export interface ChartDataPoint {
  date: string;
  amount: number;
  usdValue?: number;
}

export interface BlockScoutTransaction {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string | null;
  contractAddress: string;
  tokenDecimal: string;
}

export interface BlockScoutResponse<T> {
  status: string;
  message: string;
  result: T;
}

export interface PriceChangeData {
  currentPrice: number;
  price24hAgo: number;
  changePercent: number;
}
