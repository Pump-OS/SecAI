# SecAI - Solana Tax Estimator

SecAI is an informational tax-assistant service for US-based Solana wallet users. Enter your wallet address to get instant federal and state tax estimates based on your lifetime trading PNL.

## Features

- **Instant PNL Analysis**: Fetches total lifetime PNL from your Solana wallet
- **Federal Tax Estimates**: Calculates estimated federal tax using simplified effective rates
- **State Tax Coverage**: Supports all 50 US states plus DC with state-specific tax rates
- **Privacy First**: No login, no data storage - only public blockchain data is used
- **Stateless Design**: No database required, purely informational service

## Tech Stack

- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **API Integration**: gm.gn for PNL data
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/secai.git
cd secai

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Currently, no API keys are required as the gm.gn API is used for PNL data.

## Usage

1. Enter your Solana wallet address
2. Select your filing status (Single, MFJ, MFS, or HOH)
3. Select your US state
4. Click "Calculate Taxes"
5. View your estimated tax breakdown

## Tax Calculation Notes

This service provides **estimates only** based on:

- Aggregate lifetime PNL (not individual transactions)
- Fixed effective federal tax rate (~30%)
- State-specific income tax rates

**Not included in calculations:**
- Cost basis adjustments
- Short-term vs long-term capital gains differentiation
- Wash sale rules
- Individual transaction details

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/secai)

Or deploy manually:

```bash
npm run build
npm run start
```

## Disclaimer

**Estimates only. Not tax advice.**

SecAI provides informational estimates based on aggregate PNL data. This does not constitute professional tax advice. Please consult a qualified tax professional for actual tax filing. No personal data is stored.

## License

MIT License - see LICENSE file for details
