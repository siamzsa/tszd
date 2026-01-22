# Binary Trading Signal Board

A professional binary trading signal analysis dashboard built with Next.js, TypeScript, and Tailwind CSS. This application uses the CurrencyLayer API to analyze market data and provide BUY/SELL trading signals with confidence levels.

## Features

- 🎯 **Market Selection**: Choose from multiple currency pairs
- 📊 **Real-time Analysis**: Fetches live and historical market data via API
- 🔍 **Signal Generation**: AI-powered analysis provides BUY/SELL signals
- 📈 **Confidence Levels**: Each signal includes a confidence percentage (0-100%)
- 💹 **Price Tracking**: Shows current price, price change, and percentage change
- 📉 **Trend Analysis**: Displays market trend (UP/DOWN/NEUTRAL)
- 🎨 **Professional UI**: Modern, responsive design with dark mode support

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client for API calls
- **CurrencyLayer API** - Market data provider

## Project Structure

```
apppi/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── MarketSelector/      # Market selection component
│   ├── GenerateButton/      # Signal generation button
│   └── SignalDisplay/       # Signal display component
├── lib/
│   ├── api/
│   │   └── currencylayer.ts # CurrencyLayer API service
│   └── analysis/
│       └── signalAnalyzer.ts # Signal analysis logic
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## How It Works

1. **Market Selection**: User selects a currency pair (e.g., EUR/USD)
2. **API Call**: Application fetches:
   - Current live exchange rates
   - Historical rates for the last 7 days
3. **Analysis**: Signal analyzer processes the data using:
   - Moving averages (SMA)
   - Momentum calculation
   - Volatility analysis
   - Trend detection
4. **Signal Generation**: Provides BUY/SELL recommendation with:
   - Confidence level (0-100%)
   - Current price and price changes
   - Trend direction
   - Detailed analysis

## API Configuration

The application uses the CurrencyLayer API. The API key is configured in `lib/api/currencylayer.ts`. 

### API Validation System

**IMPORTANT**: The application includes a professional API validation system:

- ✅ **Signal Generation**: Signals are ONLY generated when:
  - API key is valid
  - API connection is successful
  - API returns valid data
  - API call completes without errors

- ❌ **No Signal on Error**: If API fails, no signal will be generated. The system will show clear error messages.

- 🔍 **Real-time Status**: API status indicator shows connection status in real-time.

**Note**: For production use, move the API key to environment variables.

## Components

### MarketSelector
Dropdown component for selecting currency pairs.

### GenerateButton
Button component that triggers signal generation.

### SignalDisplay
Displays the generated trading signal with:
- Signal type (BUY/SELL)
- Confidence percentage
- Price information
- Trend indicator
- Detailed analysis

## License

MIT
