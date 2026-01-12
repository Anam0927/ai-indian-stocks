export const INSTRUMENTS = {
  RELIANCE: { name: 'Reliance Industries', token: 738561 },
  TCS: { name: 'Tata Consultancy Services', token: 2953217 },
  HDFCBANK: { name: 'HDFC Bank', token: 341249 },
  INFY: { name: 'Infosys', token: 408065 },
  ICICIBANK: { name: 'ICICI Bank', token: 1270529 },
  HINDUNILVR: { name: 'Hindustan Unilever', token: 356865 },
  SBIN: { name: 'State Bank of India', token: 779521 },
  BHARTIARTL: { name: 'Bharti Airtel', token: 2714625 },
  ITC: { name: 'ITC Limited', token: 424961 },
  KOTAKBANK: { name: 'Kotak Mahindra Bank', token: 492033 },
  LT: { name: 'Larsen & Toubro', token: 2939649 },
  AXISBANK: { name: 'Axis Bank', token: 1510401 },
  ASIANPAINT: { name: 'Asian Paints', token: 60417 },
  MARUTI: { name: 'Maruti Suzuki', token: 2815745 },
  HCLTECH: { name: 'HCL Technologies', token: 1850625 },
  SUNPHARMA: { name: 'Sun Pharmaceutical', token: 857857 },
  TATAMOTORS: { name: 'Tata Motors', token: 884737 },
  WIPRO: { name: 'Wipro', token: 969473 },
  BAJFINANCE: { name: 'Bajaj Finance', token: 81153 },
  TITAN: { name: 'Titan Company', token: 897537 },
} as const

export type StockSymbol = keyof typeof INSTRUMENTS

export const DATE_RANGES = {
  '7d': { label: 'Last 7 Days', days: 7 },
  '30d': { label: 'Last 30 Days', days: 30 },
  '1y': { label: 'Last Year', days: 365 },
} as const

export type DateRange = keyof typeof DATE_RANGES
