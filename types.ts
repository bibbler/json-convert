
export interface PriceChanges {
  '24h': string;
  '7d': string;
  '30d': string;
}

export interface MarketMetrics {
  volatilityScore: number;
  marketCapToVolumeRatio: number;
  priceToAthRatio: number;
  marketScore: number;
}

export interface Analysis {
  priceAction: string;
  signal: 'NEUTRAL' | 'BUY' | 'SELL';
  riskRating: string;
  recommendation: string;
  investmentStrategy: string;
}

export interface CryptoData {
  coin: string;
  symbol: string;
  currentPrice: string;
  marketCap: string;
  volume24h: string;
  priceChanges: PriceChanges;
  marketMetrics: MarketMetrics;
  analysis: Analysis;
  timestamp: string;
}
