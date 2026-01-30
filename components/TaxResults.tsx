'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Building2, Landmark, RefreshCcw, Flag, AlertTriangle, BarChart3, Database } from 'lucide-react';
import { TaxResult } from '@/lib/types';

interface TaxResultsProps {
  result: TaxResult;
  onReset: () => void;
}

// Meme comments for losses
const LOSS_COMMENTS = [
  "Uncle Sam takes a break this year.",
  "Tax loss harvesting: Achievement Unlocked",
  "The IRS can't tax what you don't have.",
  "Your accountant sends their condolences.",
  "At least the paperwork is simple.",
  "The market giveth, the market taketh away.",
  "Silver lining: Zero tax liability.",
];

function getRandomLossComment(): string {
  return LOSS_COMMENTS[Math.floor(Math.random() * LOSS_COMMENTS.length)];
}

function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);
  
  return amount < 0 ? `-${formatted}` : formatted;
}

function formatSol(amount: number): string {
  return `${amount >= 0 ? '+' : ''}${amount.toFixed(4)} SOL`;
}

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function getSourceLabel(source?: string): string {
  switch (source) {
    case 'helius':
      return 'Helius API';
    case 'gmgn':
      return 'gm.gn';
    case 'demo':
      return 'Demo Data';
    default:
      return 'Unknown';
  }
}

export default function TaxResults({ result, onReset }: TaxResultsProps) {
  const { 
    totalPnl, 
    pnlSol,
    totalBuySol,
    totalSellSol,
    tradeCount,
    federalTax, 
    stateTax, 
    totalTax, 
    federalRate, 
    stateRate, 
    isLoss,
    dataSource 
  } = result;

  return (
    <div className="space-y-6">
      {/* Data Source Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-dark-700/50 border border-gray-700 rounded-full text-xs text-gray-400">
          <Database className="w-3 h-3" />
          Data: {getSourceLabel(dataSource)}
        </div>
      </div>

      {/* Header with PNL */}
      <div className="text-center py-6 border-b border-usa-gold/20">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
          isLoss 
            ? 'bg-usa-red/20 border border-usa-red/40 text-usa-red' 
            : 'bg-green-500/20 border border-green-500/40 text-green-400'
        }`}>
          {isLoss ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
          <span className="font-bold uppercase tracking-wider text-sm">
            {isLoss ? 'Net Loss' : 'Net Profit'}
          </span>
        </div>
        
        <h3 className={`text-5xl font-display font-bold ${isLoss ? 'text-usa-red' : 'gold-text'}`}>
          {formatCurrency(totalPnl)}
        </h3>
        
        {pnlSol !== undefined && (
          <p className={`text-lg mt-2 ${isLoss ? 'text-usa-red/70' : 'text-green-400/70'}`}>
            {formatSol(pnlSol)}
          </p>
        )}
        
        <p className="text-gray-400 mt-2 uppercase tracking-wider text-sm">Total Realized PNL</p>
      </div>

      {/* Trading Stats */}
      {(totalBuySol !== undefined || tradeCount !== undefined) && (
        <div className="grid grid-cols-3 gap-4 py-4 border-b border-usa-gold/20">
          {totalBuySol !== undefined && (
            <div className="text-center">
              <p className="text-2xl font-bold text-usa-red">{totalBuySol.toFixed(2)}</p>
              <p className="text-xs text-gray-500 uppercase">SOL Spent</p>
            </div>
          )}
          {totalSellSol !== undefined && (
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{totalSellSol.toFixed(2)}</p>
              <p className="text-xs text-gray-500 uppercase">SOL Received</p>
            </div>
          )}
          {tradeCount !== undefined && (
            <div className="text-center">
              <p className="text-2xl font-bold text-usa-gold">{tradeCount}</p>
              <p className="text-xs text-gray-500 uppercase">Trades</p>
            </div>
          )}
        </div>
      )}

      {/* Loss Message or Tax Breakdown */}
      {isLoss ? (
        <div className="text-center py-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-usa-red/10 border-2 border-usa-red/30 flex items-center justify-center">
            <span className="text-5xl">
              {totalPnl < -10000 ? '💀' : totalPnl < -1000 ? '📉' : '🤷'}
            </span>
          </div>
          <h3 className="text-3xl font-display font-bold text-white mb-2">
            TAX OWED: <span className="gold-text">$0.00</span>
          </h3>
          <p className="text-gray-400 italic text-lg mb-6">
            "{getRandomLossComment()}"
          </p>
          <div className="bg-dark-700/50 border border-usa-gold/20 rounded-sm p-4">
            <p className="text-sm text-gray-400">
              <AlertTriangle className="inline w-4 h-4 mr-1 text-usa-gold" />
              Losses may offset future gains. Consult a tax professional for details.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Federal Tax */}
          <div className="bg-dark-700/50 border border-usa-blue/30 rounded-sm p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-usa-blue/20 border border-usa-blue/40 flex items-center justify-center">
                  <Landmark className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold uppercase tracking-wider">Federal Tax</p>
                  <p className="text-sm text-gray-400">Rate: {formatPercent(federalRate)}</p>
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-white">{formatCurrency(federalTax)}</p>
            </div>
          </div>

          {/* State Tax */}
          <div className="bg-dark-700/50 border border-usa-red/30 rounded-sm p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-usa-red/20 border border-usa-red/40 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-usa-red" />
                </div>
                <div>
                  <p className="text-white font-semibold uppercase tracking-wider">State Tax</p>
                  <p className="text-sm text-gray-400">Rate: {formatPercent(stateRate)}</p>
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-white">{formatCurrency(stateTax)}</p>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-usa-gold/10 to-yellow-600/10 border-2 border-usa-gold/40 rounded-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-usa-gold to-yellow-600 flex items-center justify-center seal-glow">
                  <DollarSign className="h-7 w-7 text-dark-900" />
                </div>
                <div>
                  <p className="text-usa-gold font-bold uppercase tracking-wider text-lg">Total Estimated Tax</p>
                  <p className="text-sm text-gray-400">
                    Combined rate: {formatPercent(federalRate + stateRate)}
                  </p>
                </div>
              </div>
              <p className="text-3xl font-display font-bold gold-text">{formatCurrency(totalTax)}</p>
            </div>
          </div>

        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="btn-secondary w-full flex items-center justify-center gap-3 mt-6"
      >
        <RefreshCcw className="h-5 w-5" />
        CALCULATE ANOTHER WALLET
      </button>
    </div>
  );
}
