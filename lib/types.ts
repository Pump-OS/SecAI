export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh';

export interface TaxInput {
  walletAddress: string;
  filingStatus: FilingStatus;
  state: string;
}

export interface PnlData {
  totalPnl: number;
  pnlSol?: number;
  totalBuySol?: number;
  totalSellSol?: number;
  tradeCount?: number;
  walletAddress: string;
  source?: 'helius' | 'gmgn' | 'demo';
}

export interface TaxResult {
  totalPnl: number;
  pnlSol?: number;
  totalBuySol?: number;
  totalSellSol?: number;
  tradeCount?: number;
  federalTax: number;
  stateTax: number;
  totalTax: number;
  federalRate: number;
  stateRate: number;
  isLoss: boolean;
  dataSource?: 'helius' | 'gmgn' | 'demo';
}

export interface ApiError {
  error: string;
  message: string;
}

export const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'mfj', label: 'Married Filing Jointly' },
  { value: 'mfs', label: 'Married Filing Separately' },
  { value: 'hoh', label: 'Head of Household' },
];
