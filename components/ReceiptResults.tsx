'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCcw, CheckCircle, XCircle, Sparkles, Scale, MessageCircle, X, ArrowRight } from 'lucide-react';
import { TaxResult } from '@/lib/types';
import ScratchCard from './ScratchCard';

interface ReceiptResultsProps {
  result: TaxResult;
  onReset: () => void;
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

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export default function ReceiptResults({ result, onReset }: ReceiptResultsProps) {
  const { 
    totalPnl, 
    pnlSol,
    tradeCount,
    federalTax, 
    stateTax, 
    totalTax, 
    federalRate, 
    stateRate, 
    isLoss,
  } = result;

  const [federalRevealed, setFederalRevealed] = useState(false);
  const [stateRevealed, setStateRevealed] = useState(false);
  const [totalRevealed, setTotalRevealed] = useState(false);
  const [showAttorneyPopup, setShowAttorneyPopup] = useState(false);

  const allRevealed = federalRevealed && stateRevealed && totalRevealed;

  // Show popup when all cards are revealed
  useEffect(() => {
    if (allRevealed) {
      // Small delay for dramatic effect
      const timer = setTimeout(() => {
        setShowAttorneyPopup(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [allRevealed]);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-md mx-auto">
      {/* Envelope with receipt coming out */}
      <div className="relative">
        {/* Receipt */}
        <div className="receipt animate-[receiptSlide_0.8s_ease-out_forwards] relative z-10">
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
            <div className="text-2xl mb-1">🏛️</div>
            <h2 className="font-bold text-lg text-usa-navy">TAX ESTIMATE</h2>
            <p className="text-xs text-gray-500">SecAI Tax Services</p>
            <p className="text-xs text-gray-400 mt-1">{currentDate}</p>
          </div>

          {/* PNL Section */}
          <div className="receipt-line flex justify-between items-center">
            <span className="text-gray-600">Total PNL:</span>
            <span className={`font-bold ${isLoss ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(totalPnl)}
            </span>
          </div>

          {pnlSol !== undefined && (
            <div className="receipt-line flex justify-between items-center">
              <span className="text-gray-600">PNL (SOL):</span>
              <span className={`font-mono text-sm ${isLoss ? 'text-red-600' : 'text-green-600'}`}>
                {pnlSol >= 0 ? '+' : ''}{pnlSol.toFixed(4)}
              </span>
            </div>
          )}

          {tradeCount !== undefined && (
            <div className="receipt-line flex justify-between items-center">
              <span className="text-gray-600">Total Trades:</span>
              <span className="font-mono">{tradeCount}</span>
            </div>
          )}

          {/* Divider */}
          <div className="my-4 border-t-2 border-dashed border-gray-300" />

          {/* Instruction */}
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Scratch each box to reveal your taxes
              <Sparkles className="w-3 h-3" />
            </p>
          </div>

          {/* Federal Tax Scratch Card */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Federal Tax ({formatPercent(federalRate)})
              </span>
              {federalRevealed && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <div className="bg-gray-100 rounded-lg p-3 flex justify-center">
              <ScratchCard 
                width={180} 
                height={50}
                revealThreshold={65}
                onReveal={() => setFederalRevealed(true)}
              >
                <div className="text-center bg-white rounded px-4 py-2 shadow-inner w-full h-full flex items-center justify-center">
                  <span className={`text-xl font-bold ${isLoss ? 'text-green-600' : 'text-usa-navy'}`}>
                    {isLoss ? '$0.00' : formatCurrency(federalTax)}
                  </span>
                </div>
              </ScratchCard>
            </div>
          </div>

          {/* State Tax Scratch Card */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                State Tax ({formatPercent(stateRate)})
              </span>
              {stateRevealed && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <div className="bg-gray-100 rounded-lg p-3 flex justify-center">
              <ScratchCard 
                width={180} 
                height={50}
                revealThreshold={65}
                onReveal={() => setStateRevealed(true)}
              >
                <div className="text-center bg-white rounded px-4 py-2 shadow-inner w-full h-full flex items-center justify-center">
                  <span className={`text-xl font-bold ${isLoss ? 'text-green-600' : 'text-usa-navy'}`}>
                    {isLoss ? '$0.00' : formatCurrency(stateTax)}
                  </span>
                </div>
              </ScratchCard>
            </div>
          </div>

          {/* Total Tax Scratch Card */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-usa-red uppercase">
                Total Tax Owed
              </span>
              {totalRevealed && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <div className="bg-gradient-to-r from-usa-red/10 to-usa-blue/10 rounded-lg p-3 flex justify-center border-2 border-usa-gold/30">
              <ScratchCard 
                width={200} 
                height={60}
                revealThreshold={60}
                onReveal={() => setTotalRevealed(true)}
              >
                <div className="text-center bg-white rounded px-4 py-2 shadow-lg w-full h-full flex flex-col items-center justify-center">
                  {isLoss ? (
                    <>
                      <span className="text-2xl font-bold text-green-600">$0.00</span>
                      <span className="text-xs text-green-500">No tax owed!</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-usa-red">{formatCurrency(totalTax)}</span>
                      <span className="text-xs text-gray-500">estimated</span>
                    </>
                  )}
                </div>
              </ScratchCard>
            </div>
          </div>

          {/* Status - only show after all revealed */}
          {allRevealed && (
            <div className="text-center py-3 border-t-2 border-dashed border-gray-300 animate-pulse">
              {isLoss ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">NO TAX LIABILITY</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-usa-red">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">TAX DUE</span>
                </div>
              )}
            </div>
          )}

          {/* Progress indicator */}
          {!allRevealed && (
            <div className="text-center py-2">
              <div className="flex justify-center gap-2">
                <div className={`w-3 h-3 rounded-full transition-colors ${federalRevealed ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div className={`w-3 h-3 rounded-full transition-colors ${stateRevealed ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div className={`w-3 h-3 rounded-full transition-colors ${totalRevealed ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {3 - [federalRevealed, stateRevealed, totalRevealed].filter(Boolean).length} remaining
              </p>
            </div>
          )}

          {/* Barcode */}
          <div className="mt-4 flex justify-center">
            <div className="flex gap-[2px]">
              {[...Array(30)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-gray-800" 
                  style={{ 
                    width: Math.random() > 0.5 ? '2px' : '1px', 
                    height: '30px' 
                  }} 
                />
              ))}
            </div>
          </div>
          <div className="text-center text-xs text-gray-400 mt-1 font-mono">
            {Date.now().toString(36).toUpperCase()}
          </div>

        </div>

        {/* Envelope bottom peeking */}
        <div className="h-16 bg-gradient-to-b from-envelope to-envelope-dark -mt-4 rounded-b-lg mx-8 relative z-0">
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium">
            ✉️ SecAI Tax Envelope
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="btn-secondary w-full flex items-center justify-center gap-3 mt-8"
      >
        <RefreshCcw className="h-5 w-5" />
        Calculate Another Wallet
      </button>

      {/* Attorney Popup Modal */}
      {showAttorneyPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAttorneyPopup(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[popIn_0.3s_ease-out]">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-usa-blue to-usa-navy p-6 text-white text-center relative">
              <button 
                onClick={() => setShowAttorneyPopup(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Your Results Are Ready!</h3>
              <p className="text-white/80 text-sm">
                {isLoss 
                  ? "Great news — no taxes owed on losses!" 
                  : `You may owe approximately ${formatCurrency(totalTax)} in taxes`
                }
              </p>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-usa-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-usa-gold" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Need Help Understanding This?</h4>
                    <p className="text-sm text-gray-600">
                      Our AI Tax Attorney can explain your tax obligations, filing requirements, 
                      and strategies to potentially reduce what you owe.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* What you'll learn */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Personalized tax summary & breakdown</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Step-by-step filing instructions</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Legal strategies to reduce taxes</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">IRS penalties & compliance warnings</span>
                </div>
              </div>
              
              {/* CTA Button */}
              <button
                onClick={() => {
                  setShowAttorneyPopup(false);
                  // Trigger click on the chat button
                  setTimeout(() => {
                    const chatBtn = document.querySelector('[data-attorney-chat]') as HTMLButtonElement;
                    if (chatBtn) chatBtn.click();
                  }, 100);
                }}
                className="w-full bg-gradient-to-r from-usa-blue to-usa-navy text-white font-bold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
              >
                <Scale className="w-5 h-5" />
                Chat with Tax Attorney
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowAttorneyPopup(false)}
                className="w-full text-gray-500 text-sm mt-3 hover:text-gray-700 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
