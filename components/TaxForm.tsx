'use client';

import React, { useState } from 'react';
import { Wallet, Calculator, Loader2, User, MapPin } from 'lucide-react';
import { US_STATES } from '@/lib/tax-rates';
import { FILING_STATUS_OPTIONS, TaxInput, TaxResult, FilingStatus } from '@/lib/types';

interface TaxFormProps {
  onResult: (result: TaxResult) => void;
  onError: (error: string) => void;
}

export default function TaxForm({ onResult, onError }: TaxFormProps) {
  const [walletAddress, setWalletAddress] = useState('');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [state, setState] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    onError('');

    try {
      const response = await fetch('/api/calculate-tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      onError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Wallet Address Input */}
      <div className="space-y-2">
        <label htmlFor="wallet" className="flex items-center gap-2 text-sm font-semibold text-usa-gold uppercase tracking-wider">
          <Wallet className="w-4 h-4" />
          Solana Wallet Address
        </label>
        <input
          type="text"
          id="wallet"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Enter your Solana wallet address"
          className="input-field"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          Example: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
        </p>
      </div>

      {/* Filing Status Select */}
      <div className="space-y-2">
        <label htmlFor="filingStatus" className="flex items-center gap-2 text-sm font-semibold text-usa-gold uppercase tracking-wider">
          <User className="w-4 h-4" />
          Filing Status
        </label>
        <select
          id="filingStatus"
          value={filingStatus}
          onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
          className="select-field"
          disabled={isLoading}
        >
          {FILING_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* State Select */}
      <div className="space-y-2">
        <label htmlFor="state" className="flex items-center gap-2 text-sm font-semibold text-usa-gold uppercase tracking-wider">
          <MapPin className="w-4 h-4" />
          US State
        </label>
        <select
          id="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="select-field"
          disabled={isLoading}
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
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading || !walletAddress.trim() || !state}
          className="btn-primary w-full flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              CALCULATING...
            </>
          ) : (
            <>
              <Calculator className="h-6 w-6" />
              CALCULATE TAXES
            </>
          )}
        </button>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 pt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Secure
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-usa-gold rounded-full" />
          Private
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-usa-blue rounded-full" />
          Instant
        </span>
      </div>
    </form>
  );
}
