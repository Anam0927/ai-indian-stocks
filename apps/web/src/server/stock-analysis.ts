import { createServerFn } from '@tanstack/react-start'
import OpenAI from 'openai'
import { z } from 'zod'

import type { DateRange, StockSymbol } from '@/lib/instruments'
import type { OHLCCandle } from '@/server/kite'

import { DATE_RANGES, INSTRUMENTS } from '@/lib/instruments'
import { openai } from '@/lib/openai'
import { getHistoricalData } from '@/server/kite'

interface StockAnalysisResult {
  symbol: string
  name: string
  dateRange: string
  summary: string
  metrics: {
    periodHigh: number
    periodLow: number
    priceChange: number
    priceChangePercent: number
  }
}

function formatCandlesForAI(candles: OHLCCandle[]): string {
  const header = 'Date, Open, High, Low, Close, Volume'
  const rows = candles.map(
    (c) =>
      `${c.timestamp.split('T')[0]}, ${c.open}, ${c.high}, ${c.low}, ${c.close}, ${c.volume}`,
  )

  // Limit to first 10 and last 10 candles for context window efficiency
  if (rows.length > 20) {
    const first10 = rows.slice(0, 10)
    const last10 = rows.slice(-10)
    return `${header}\n${first10.join('\n')}\n... (${rows.length - 20} rows omitted) ...\n${last10.join('\n')}`
  }

  return `${header}\n${rows.join('\n')}`
}

function calculateMetrics(candles: OHLCCandle[]) {
  if (candles.length === 0) {
    return {
      periodHigh: 0,
      periodLow: 0,
      priceChange: 0,
      priceChangePercent: 0,
    }
  }

  const highs = candles.map((c) => c.high)
  const lows = candles.map((c) => c.low)
  const periodHigh = Math.max(...highs)
  const periodLow = Math.min(...lows)

  const firstClose = candles[0]!.close
  const lastClose = candles[candles.length - 1]!.close
  const priceChange = lastClose - firstClose
  const priceChangePercent = (priceChange / firstClose) * 100

  return {
    periodHigh,
    periodLow,
    priceChange,
    priceChangePercent,
  }
}

export const getStockPerformanceSummary = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      symbol: z.string(),
      dateRange: z.enum(['7d', '30d', '1y']),
      userQuery: z.string().optional(),
    }),
  )
  .handler(async ({ data }): Promise<StockAnalysisResult> => {
    const { symbol, dateRange, userQuery } = data

    // Validate symbol exists
    if (!(symbol in INSTRUMENTS)) {
      throw new Error(`Invalid stock symbol: ${symbol}`)
    }

    const instrument = INSTRUMENTS[symbol as StockSymbol]
    const dateRangeLabel = DATE_RANGES[dateRange as DateRange].label

    // Fetch historical data
    const historicalData = await getHistoricalData({
      data: { symbol, dateRange },
    })

    const { candles } = historicalData

    if (candles.length === 0) {
      throw new Error('No historical data available for the selected period')
    }

    // Calculate metrics
    const metrics = calculateMetrics(candles)

    // Format data for AI
    const formattedCandles = formatCandlesForAI(candles)

    // Create prompt for OpenAI
    const systemPrompt = `You are a stock market analyst specializing in Indian equities.
Analyze the provided historical OHLC (Open, High, Low, Close) data and give a performance summary.
Focus on: price trends, volatility, percentage change, key observations, and potential patterns.
Keep the response concise (2-3 paragraphs) and professional.
Do not provide investment advice or recommendations.`

    const userPrompt = `Stock: ${instrument.name} (${symbol})
Period: ${dateRangeLabel}

Summary Statistics:
- Period High: ₹${metrics.periodHigh.toFixed(2)}
- Period Low: ₹${metrics.periodLow.toFixed(2)}
- Price Change: ₹${metrics.priceChange.toFixed(2)} (${metrics.priceChangePercent.toFixed(2)}%)

Historical Data (${candles.length} trading days):
${formattedCandles}

${userQuery || 'Provide a comprehensive performance analysis of this stock.'}`

    try {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      const summary =
        completion.choices[0]?.message?.content ||
        'Failed to generate analysis.'

      return {
        symbol,
        name: instrument.name,
        dateRange: dateRangeLabel,
        summary,
        metrics,
      }
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(
          `OpenAI API error: ${error.message} (Status: ${error.status})`,
        )
      }

      throw error
    }
  })
