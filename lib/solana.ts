// Solana wallet validation and PNL fetching utilities

import { getHeliusPnl, calculateWalletPnl } from './helius';

export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded and 32-44 characters long
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

// Extended PNL result with more details
export interface ExtendedPnlResult {
  pnlUsd: number;
  pnlSol: number;
  totalBuySol: number;
  totalSellSol: number;
  tradeCount: number;
  source: 'helius' | 'gmgn' | 'demo';
}

// Fetch PNL using Helius (primary method)
export async function fetchPnlFromHelius(walletAddress: string): Promise<ExtendedPnlResult> {
  const result = await calculateWalletPnl(walletAddress);
  return {
    ...result,
    source: 'helius',
  };
}

// Fallback: gm.gn API
export async function fetchPnlFromGmGn(walletAddress: string): Promise<number> {
  const url = `https://gmgn.ai/defi/quotation/v1/wallet_stat/sol/${walletAddress}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`gm.gn API returned status ${response.status}`);
    }

    const result = await response.json();
    const data = result.data || result;
    const pnl = data.realized_profit ?? data.total_profit ?? data.pnl ?? 0;
    
    return typeof pnl === 'number' ? pnl : parseFloat(String(pnl)) || 0;
  } catch (error) {
    console.error('Error fetching from gm.gn:', error);
    throw error;
  }
}

// Demo mode fallback
export function getDemoPnl(walletAddress: string): ExtendedPnlResult {
  let hash = 0;
  for (let i = 0; i < walletAddress.length; i++) {
    const char = walletAddress.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const normalizedHash = Math.abs(hash) / 2147483647;
  
  let pnlUsd: number;
  if (normalizedHash < 0.3) {
    pnlUsd = -(normalizedHash * 50000);
  } else {
    pnlUsd = ((normalizedHash - 0.3) / 0.7) * 200000;
  }

  const solPrice = 100; // Approximate
  const pnlSol = pnlUsd / solPrice;
  
  return {
    pnlUsd,
    pnlSol,
    totalBuySol: Math.abs(pnlSol) * 2,
    totalSellSol: Math.abs(pnlSol) * 2 + pnlSol,
    tradeCount: Math.floor(normalizedHash * 100) + 10,
    source: 'demo',
  };
}

// Main function to get wallet PNL
export async function getWalletPnl(walletAddress: string): Promise<number> {
  if (!isValidSolanaAddress(walletAddress)) {
    throw new Error('Invalid Solana wallet address');
  }

  // Try Helius first (most accurate)
  try {
    console.log('Fetching PNL from Helius...');
    const result = await fetchPnlFromHelius(walletAddress);
    console.log('Helius PNL result:', result);
    return result.pnlUsd;
  } catch (error) {
    console.error('Helius API failed:', error);
  }

  // Try gm.gn as fallback
  try {
    console.log('Trying gm.gn fallback...');
    const pnl = await fetchPnlFromGmGn(walletAddress);
    return pnl;
  } catch (error) {
    console.error('gm.gn API failed:', error);
  }

  // Demo fallback
  console.log('Using demo mode');
  return getDemoPnl(walletAddress).pnlUsd;
}

// Get extended PNL data with all details
export async function getWalletPnlExtended(walletAddress: string): Promise<ExtendedPnlResult> {
  if (!isValidSolanaAddress(walletAddress)) {
    throw new Error('Invalid Solana wallet address');
  }

  // Try Helius first
  try {
    console.log('Fetching extended PNL from Helius...');
    const result = await fetchPnlFromHelius(walletAddress);
    console.log('Helius extended result:', result);
    return result;
  } catch (error) {
    console.error('Helius API failed:', error);
  }

  // Demo fallback
  console.log('Using demo mode for extended PNL');
  return getDemoPnl(walletAddress);
}
