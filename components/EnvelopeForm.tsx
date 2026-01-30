'use client';

import React, { useState } from 'react';
import { Wallet, User, MapPin, Send, Loader2 } from 'lucide-react';
import { US_STATES } from '@/lib/tax-rates';
import { FILING_STATUS_OPTIONS, TaxInput, TaxResult, FilingStatus } from '@/lib/types';

interface EnvelopeFormProps {
  onResult: (result: TaxResult) => void;
  onError: (error: string) => void;
  isCalculating: boolean;
  setIsCalculating: (value: boolean) => void;
  error: string;
  onStateChange?: (state: string) => void;
}

export default function EnvelopeForm({ 
  onResult, 
  onError, 
  isCalculating, 
  setIsCalculating,
  error,
  onStateChange 
}: EnvelopeFormProps) {
  const [walletAddress, setWalletAddress] = useState('');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [state, setState] = useState('');
  const [isSealed, setIsSealed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress.trim()) {
      onError('Please enter a Solana wallet address');
      return;
    }

    if (!state) {
      onError('Please select your state');
      return;
    }

    setIsSealed(true);
    setIsCalculating(true);
    onError('');

    // Animate seal, then fetch
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const response = await fetch('/api/calculate-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletAddress.trim(),
          filingStatus,
          state,
        } as TaxInput),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to calculate taxes');
      }

      onResult(data as TaxResult);
    } catch (error) {
      setIsSealed(false);
      onError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Envelope */}
      <div className={`envelope transition-all duration-500 ${isSealed ? 'scale-95 opacity-90' : ''}`}>
        {/* Stamp */}
        <div className="stamp" />
        
        {/* Address lines on envelope flap */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-white/90 text-xs text-center">
          <div className="mb-0.5 font-semibold">TO: Internal Revenue Service</div>
          <div className="mb-0.5 text-white/70">Department of the Treasury</div>
          <div className="text-white/70">Washington, D.C. 20224</div>
        </div>

        {/* Envelope body (the paper inside) */}
        <div className="envelope-body">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-display font-bold text-usa-navy">
                Tax Estimation Form
              </h2>
              <p className="text-sm text-gray-500">Fill in all fields</p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Wallet Address */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-usa-navy">
                <Wallet className="w-4 h-4 text-usa-blue" />
                Solana Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your wallet address"
                className="input-field font-mono text-sm"
                disabled={isCalculating}
              />
            </div>

            {/* Filing Status */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-usa-navy">
                <User className="w-4 h-4 text-usa-blue" />
                Filing Status
              </label>
              <select
                value={filingStatus}
                onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
                className="select-field"
                disabled={isCalculating}
              >
                {FILING_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-usa-navy">
                <MapPin className="w-4 h-4 text-usa-blue" />
                State of Residence
              </label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  onStateChange?.(e.target.value);
                }}
                className="select-field"
                disabled={isCalculating}
              >
                <option value="">Select your state</option>
                {US_STATES.map((s) => (
                  <option key={s.abbreviation} value={s.abbreviation}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCalculating || !walletAddress.trim() || !state}
              className="btn-primary w-full flex items-center justify-center gap-3 mt-6"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send & Calculate
                </>
              )}
            </button>

            {/* Postmark area */}
            <div className="flex justify-end mt-4 opacity-30">
              <div className="text-right text-xs text-gray-500">
                <div className="border-2 border-gray-400 rounded-full px-3 py-1 inline-block">
                  <div>FIRST CLASS</div>
                  <div>U.S. POSTAGE</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Loading animation - envelope flying */}
      {isCalculating && (
        <div className="text-center mt-8">
          <div className="inline-block animate-bounce">
            <span className="text-4xl">✉️</span>
          </div>
          <p className="text-gray-500 mt-2">Calculating your taxes...</p>
        </div>
      )}
    </div>
  );
}
