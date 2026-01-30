// Helius API integration for Solana wallet PNL calculation

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_BASE_URL = 'https://api.helius.xyz';

// SOL mint address
const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Stablecoins to track as equivalent to USD
const STABLECOINS = new Set([
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
]);

interface TokenTransfer {
  mint: string;
  tokenAmount: number; // Already in decimal form
  fromUserAccount?: string;
  toUserAccount?: string;
}

interface NativeTransfer {
  amount: number; // In lamports
  fromUserAccount?: string;
  toUserAccount?: string;
}

interface HeliusTransaction {
  signature: string;
  timestamp: number;
  type: string;
  source: string;
  fee: number;
  feePayer: string;
  tokenTransfers?: TokenTransfer[];
  nativeTransfers?: NativeTransfer[];
}

interface SwapResult {
  solChange: number; // Negative = spent SOL, Positive = received SOL
  usdcChange: number; // Track stablecoin changes too
}

// Get current SOL price in USD
async function getSolPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      { next: { revalidate: 60 } }
    );
    const data = await response.json();
    return data.solana?.usd || 200;
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    return 200;
  }
}

// Fetch transactions using Helius Enhanced API
async function fetchWalletTransactions(
  walletAddress: string,
  limit: number = 1000
): Promise<HeliusTransaction[]> {
  if (!HELIUS_API_KEY) {
    throw new Error('Helius API key not configured');
  }

  const allTransactions: HeliusTransaction[] = [];
  let beforeSignature: string | undefined;
  const batchSize = 100;

  while (allTransactions.length < limit) {
    const url = new URL(`${HELIUS_BASE_URL}/v0/addresses/${walletAddress}/transactions`);
    url.searchParams.append('api-key', HELIUS_API_KEY);
    url.searchParams.append('limit', String(batchSize));
    if (beforeSignature) {
      url.searchParams.append('before', beforeSignature);
    }

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        console.error('Helius API error:', response.status);
        break;
      }

      const transactions: HeliusTransaction[] = await response.json();
      
      if (transactions.length === 0) break;

      allTransactions.push(...transactions);
      beforeSignature = transactions[transactions.length - 1].signature;
      
      if (transactions.length < batchSize) break;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      break;
    }
  }

  return allTransactions.slice(0, limit);
}

// Parse a swap transaction to get SOL/USDC changes for the wallet
function parseSwapTransaction(tx: HeliusTransaction, walletAddress: string): SwapResult | null {
  if (tx.type !== 'SWAP') return null;

  const wallet = walletAddress.toLowerCase();
  let solChange = 0;
  let usdcChange = 0;

  // Process token transfers (tokenAmount is already in decimal form)
  if (tx.tokenTransfers) {
    for (const transfer of tx.tokenTransfers) {
      const from = transfer.fromUserAccount?.toLowerCase();
      const to = transfer.toUserAccount?.toLowerCase();
      const amount = transfer.tokenAmount;

      // SOL (wrapped) transfers
      if (transfer.mint === SOL_MINT) {
        if (from === wallet) {
          solChange -= amount;
        }
        if (to === wallet) {
          solChange += amount;
        }
      }
      
      // Stablecoin transfers (USDC/USDT)
      if (STABLECOINS.has(transfer.mint)) {
        if (from === wallet) {
          usdcChange -= amount;
        }
        if (to === wallet) {
          usdcChange += amount;
        }
      }
    }
  }

  // Process native SOL transfers (amount is in lamports)
  if (tx.nativeTransfers) {
    for (const transfer of tx.nativeTransfers) {
      const from = transfer.fromUserAccount?.toLowerCase();
      const to = transfer.toUserAccount?.toLowerCase();
      const amount = transfer.amount / 1e9; // Convert lamports to SOL

      if (from === wallet) {
        solChange -= amount;
      }
      if (to === wallet) {
        solChange += amount;
      }
    }
  }

  // Subtract fee (in lamports)
  if (tx.feePayer.toLowerCase() === wallet) {
    solChange -= tx.fee / 1e9;
  }

  // Only count if there was meaningful activity
  if (Math.abs(solChange) < 0.00001 && Math.abs(usdcChange) < 0.01) {
    return null;
  }

  return { solChange, usdcChange };
}

// Calculate PNL from wallet transactions
export async function calculateWalletPnl(walletAddress: string): Promise<{
  pnlUsd: number;
  pnlSol: number;
  totalBuySol: number;
  totalSellSol: number;
  tradeCount: number;
}> {
  console.log(`Calculating PNL for wallet: ${walletAddress}`);
  
  const transactions = await fetchWalletTransactions(walletAddress, 1000);
  console.log(`Fetched ${transactions.length} transactions`);

  // Count transaction types
  const swapTxs = transactions.filter(tx => tx.type === 'SWAP');
  console.log(`Found ${swapTxs.length} SWAP transactions`);

  // Parse all swaps
  let totalSolSpent = 0; // SOL spent buying tokens
  let totalSolReceived = 0; // SOL received from selling tokens
  let totalUsdcChange = 0; // Net USDC change
  let tradeCount = 0;

  for (const tx of swapTxs) {
    const result = parseSwapTransaction(tx, walletAddress);
    if (!result) continue;

    tradeCount++;

    // Track SOL changes
    if (result.solChange < 0) {
      totalSolSpent += Math.abs(result.solChange);
    } else if (result.solChange > 0) {
      totalSolReceived += result.solChange;
    }

    // Track USDC changes
    totalUsdcChange += result.usdcChange;
  }

  // PNL in SOL = received - spent
  const pnlSol = totalSolReceived - totalSolSpent;
  
  // Get SOL price
  const solPrice = await getSolPrice();
  
  // PNL in USD = SOL PNL * price + USDC changes
  const pnlUsd = (pnlSol * solPrice) + totalUsdcChange;

  console.log(`SOL Price: $${solPrice}`);
  console.log(`SOL spent: ${totalSolSpent.toFixed(4)} SOL`);
  console.log(`SOL received: ${totalSolReceived.toFixed(4)} SOL`);
  console.log(`USDC change: ${totalUsdcChange.toFixed(2)}`);
  console.log(`PNL: ${pnlSol.toFixed(4)} SOL ($${pnlUsd.toFixed(2)})`);
  console.log(`Trades parsed: ${tradeCount}`);

  return {
    pnlUsd,
    pnlSol,
    totalBuySol: totalSolSpent,
    totalSellSol: totalSolReceived,
    tradeCount,
  };
}

// Main export
export async function getHeliusPnl(walletAddress: string): Promise<number> {
  const result = await calculateWalletPnl(walletAddress);
  return result.pnlUsd;
}
