import { NextRequest, NextResponse } from 'next/server';
import { calculateTax, getStateByAbbreviation } from '@/lib/tax-rates';
import { getWalletPnlExtended, isValidSolanaAddress } from '@/lib/solana';
import { TaxInput, TaxResult } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: TaxInput = await request.json();
    const { walletAddress, filingStatus, state } = body;

    console.log('Tax calculation request:', { walletAddress, filingStatus, state });

    // Validate inputs
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const trimmedAddress = walletAddress.trim();
    
    if (!isValidSolanaAddress(trimmedAddress)) {
      return NextResponse.json(
        { error: 'INVALID_WALLET', message: 'Invalid Solana wallet address format' },
        { status: 400 }
      );
    }

    if (!state || !getStateByAbbreviation(state)) {
      return NextResponse.json(
        { error: 'INVALID_STATE', message: 'Please select a valid US state' },
        { status: 400 }
      );
    }

    if (!filingStatus || !['single', 'mfj', 'mfs', 'hoh'].includes(filingStatus)) {
      return NextResponse.json(
        { error: 'INVALID_STATUS', message: 'Please select a valid filing status' },
        { status: 400 }
      );
    }

    // Fetch extended PNL data
    let pnlData;
    try {
      pnlData = await getWalletPnlExtended(trimmedAddress);
      console.log('PNL data fetched:', pnlData);
    } catch (error) {
      console.error('PNL fetch error:', error);
      return NextResponse.json(
        { 
          error: 'PNL_FETCH_ERROR', 
          message: 'Unable to fetch wallet PNL. Please verify the wallet address and try again.' 
        },
        { status: 502 }
      );
    }

    // Calculate taxes based on USD PNL
    const baseTaxResult = calculateTax(pnlData.pnlUsd, state);
    
    // Add extended data to result
    const taxResult: TaxResult = {
      ...baseTaxResult,
      pnlSol: pnlData.pnlSol,
      totalBuySol: pnlData.totalBuySol,
      totalSellSol: pnlData.totalSellSol,
      tradeCount: pnlData.tradeCount,
      dataSource: pnlData.source,
    };

    console.log('Tax calculation result:', taxResult);

    return NextResponse.json(taxResult);
  } catch (error) {
    console.error('Tax calculation error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
