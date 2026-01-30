'use client';

import React, { useState } from 'react';
import { Flag, Star } from 'lucide-react';
import EnvelopeForm from '@/components/EnvelopeForm';
import ReceiptResults from '@/components/ReceiptResults';
import TaxAttorneyChat from '@/components/TaxAttorneyChat';
import { TaxResult } from '@/lib/types';
import { US_STATES } from '@/lib/tax-rates';

export default function Home() {
  const [result, setResult] = useState<TaxResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('');

  const handleResult = (taxResult: TaxResult) => {
    setError('');
    setResult(taxResult);
  };

  const getStateName = (abbr: string) => {
    return US_STATES.find(s => s.abbreviation === abbr)?.name || abbr;
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setResult(null);
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setSelectedState('');
  };

  return (
    <main className="flex-1 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-usa-blue/10 border border-usa-blue/20 rounded-full mb-6">
            <Flag className="w-4 h-4 text-usa-blue" />
            <span className="text-usa-blue text-sm font-semibold">
              For American Crypto Traders
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold text-usa-navy mb-4">
            Your Crypto Tax
            <span className="text-usa-red"> Estimate</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fill out the envelope, send it off, and scratch to reveal your federal and state tax estimates.
          </p>
        </div>

        {/* Main Content */}
        <div className="relative">
          {result ? (
            <ReceiptResults result={result} onReset={handleReset} />
          ) : (
            <EnvelopeForm 
              onResult={handleResult} 
              onError={handleError}
              isCalculating={isCalculating}
              setIsCalculating={setIsCalculating}
              error={error}
              onStateChange={setSelectedState}
            />
          )}

          {/* Tax Attorney Chat */}
          {result && (
            <TaxAttorneyChat 
              taxResult={result} 
              stateName={getStateName(selectedState)}
            />
          )}
        </div>

        {/* Features */}
        {!result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-usa-red/10 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-bold text-usa-navy mb-2">Instant Results</h3>
              <p className="text-sm text-gray-600">Get estimates in seconds from your trading history</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-usa-blue/10 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-bold text-usa-navy mb-2">100% Private</h3>
              <p className="text-sm text-gray-600">No login, no data stored, just public blockchain info</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-usa-gold/20 flex items-center justify-center">
                <span className="text-2xl">🏛️</span>
              </div>
              <h3 className="font-bold text-usa-navy mb-2">All 50 States</h3>
              <p className="text-sm text-gray-600">Federal + state tax calculations for every jurisdiction</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
