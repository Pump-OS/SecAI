// US State Tax Rates (simplified effective rates for capital gains)
// Note: These are approximate effective rates for informational purposes only
// Actual tax calculations may vary based on individual circumstances

export interface StateInfo {
  name: string;
  abbreviation: string;
  taxRate: number; // Effective state income tax rate as decimal
}

export const US_STATES: StateInfo[] = [
  { name: 'Alabama', abbreviation: 'AL', taxRate: 0.05 },
  { name: 'Alaska', abbreviation: 'AK', taxRate: 0 },
  { name: 'Arizona', abbreviation: 'AZ', taxRate: 0.025 },
  { name: 'Arkansas', abbreviation: 'AR', taxRate: 0.044 },
  { name: 'California', abbreviation: 'CA', taxRate: 0.133 },
  { name: 'Colorado', abbreviation: 'CO', taxRate: 0.044 },
  { name: 'Connecticut', abbreviation: 'CT', taxRate: 0.0699 },
  { name: 'Delaware', abbreviation: 'DE', taxRate: 0.066 },
  { name: 'Florida', abbreviation: 'FL', taxRate: 0 },
  { name: 'Georgia', abbreviation: 'GA', taxRate: 0.0549 },
  { name: 'Hawaii', abbreviation: 'HI', taxRate: 0.11 },
  { name: 'Idaho', abbreviation: 'ID', taxRate: 0.058 },
  { name: 'Illinois', abbreviation: 'IL', taxRate: 0.0495 },
  { name: 'Indiana', abbreviation: 'IN', taxRate: 0.0315 },
  { name: 'Iowa', abbreviation: 'IA', taxRate: 0.06 },
  { name: 'Kansas', abbreviation: 'KS', taxRate: 0.057 },
  { name: 'Kentucky', abbreviation: 'KY', taxRate: 0.04 },
  { name: 'Louisiana', abbreviation: 'LA', taxRate: 0.0425 },
  { name: 'Maine', abbreviation: 'ME', taxRate: 0.0715 },
  { name: 'Maryland', abbreviation: 'MD', taxRate: 0.0575 },
  { name: 'Massachusetts', abbreviation: 'MA', taxRate: 0.09 },
  { name: 'Michigan', abbreviation: 'MI', taxRate: 0.0425 },
  { name: 'Minnesota', abbreviation: 'MN', taxRate: 0.0985 },
  { name: 'Mississippi', abbreviation: 'MS', taxRate: 0.05 },
  { name: 'Missouri', abbreviation: 'MO', taxRate: 0.0495 },
  { name: 'Montana', abbreviation: 'MT', taxRate: 0.0675 },
  { name: 'Nebraska', abbreviation: 'NE', taxRate: 0.0584 },
  { name: 'Nevada', abbreviation: 'NV', taxRate: 0 },
  { name: 'New Hampshire', abbreviation: 'NH', taxRate: 0.04 },
  { name: 'New Jersey', abbreviation: 'NJ', taxRate: 0.1075 },
  { name: 'New Mexico', abbreviation: 'NM', taxRate: 0.059 },
  { name: 'New York', abbreviation: 'NY', taxRate: 0.109 },
  { name: 'North Carolina', abbreviation: 'NC', taxRate: 0.0475 },
  { name: 'North Dakota', abbreviation: 'ND', taxRate: 0.029 },
  { name: 'Ohio', abbreviation: 'OH', taxRate: 0.04 },
  { name: 'Oklahoma', abbreviation: 'OK', taxRate: 0.0475 },
  { name: 'Oregon', abbreviation: 'OR', taxRate: 0.099 },
  { name: 'Pennsylvania', abbreviation: 'PA', taxRate: 0.0307 },
  { name: 'Rhode Island', abbreviation: 'RI', taxRate: 0.0599 },
  { name: 'South Carolina', abbreviation: 'SC', taxRate: 0.064 },
  { name: 'South Dakota', abbreviation: 'SD', taxRate: 0 },
  { name: 'Tennessee', abbreviation: 'TN', taxRate: 0 },
  { name: 'Texas', abbreviation: 'TX', taxRate: 0 },
  { name: 'Utah', abbreviation: 'UT', taxRate: 0.0485 },
  { name: 'Vermont', abbreviation: 'VT', taxRate: 0.0875 },
  { name: 'Virginia', abbreviation: 'VA', taxRate: 0.0575 },
  { name: 'Washington', abbreviation: 'WA', taxRate: 0.07 },
  { name: 'West Virginia', abbreviation: 'WV', taxRate: 0.055 },
  { name: 'Wisconsin', abbreviation: 'WI', taxRate: 0.0765 },
  { name: 'Wyoming', abbreviation: 'WY', taxRate: 0 },
  { name: 'District of Columbia', abbreviation: 'DC', taxRate: 0.1075 },
];

// Fixed effective federal tax rate for capital gains (simplified)
export const FEDERAL_TAX_RATE = 0.30;

export function getStateByAbbreviation(abbreviation: string): StateInfo | undefined {
  return US_STATES.find((state) => state.abbreviation === abbreviation);
}

export function calculateTax(pnl: number, stateAbbreviation: string) {
  const state = getStateByAbbreviation(stateAbbreviation);
  
  if (!state) {
    throw new Error(`Invalid state: ${stateAbbreviation}`);
  }

  // If PNL is negative or zero, no tax owed
  if (pnl <= 0) {
    return {
      totalPnl: pnl,
      federalTax: 0,
      stateTax: 0,
      totalTax: 0,
      federalRate: FEDERAL_TAX_RATE,
      stateRate: state.taxRate,
      isLoss: true,
    };
  }

  const federalTax = pnl * FEDERAL_TAX_RATE;
  const stateTax = pnl * state.taxRate;
  const totalTax = federalTax + stateTax;

  return {
    totalPnl: pnl,
    federalTax,
    stateTax,
    totalTax,
    federalRate: FEDERAL_TAX_RATE,
    stateRate: state.taxRate,
    isLoss: false,
  };
}
