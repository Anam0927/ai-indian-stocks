import { serverEnv } from '@stocks/env/server'
import { createServerFn } from '@tanstack/react-start'
import { format, subDays } from 'date-fns'
import { HTTPError } from 'ky'
import { z } from 'zod'

import type { DateRange, StockSymbol } from '@/lib/instruments'

import { DATE_RANGES, INSTRUMENTS } from '@/lib/instruments'
import { kite } from '@/lib/kite'
import { getCurrentUserFn, logoutFn } from '@/server/auth'

export interface OHLCCandle {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface HistoricalDataResponse {
  status: string
  data: {
    candles: [string, number, number, number, number, number][]
  }
}

function formatDateForKite(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}

function calculateDateRange(dateRange: DateRange): {
  from: string
  to: string
} {
  const to = new Date()
  const from = subDays(to, DATE_RANGES[dateRange].days)

  return {
    from: formatDateForKite(from),
    to: formatDateForKite(to),
  }
}

export const getHistoricalData = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      symbol: z.string(),
      dateRange: z.enum(['7d', '30d', '1y']),
    }),
  )
  .handler(async ({ data }) => {
    const { symbol, dateRange } = data

    // Validate symbol exists
    if (!(symbol in INSTRUMENTS)) {
      throw new Error(`Invalid stock symbol: ${symbol}`)
    }

    const instrument = INSTRUMENTS[symbol as StockSymbol]
    const { from, to } = calculateDateRange(dateRange as DateRange)

    try {
      // Get current user session
      const user = await getCurrentUserFn()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Fetch historical data from Kite API
      const response = await kite
        .get<HistoricalDataResponse>(
          `instruments/historical/${instrument.token}/day`,
          {
            searchParams: {
              from,
              to,
            },
            headers: {
              Authorization: `token ${serverEnv.KITE_API_KEY}:${user.token}`,
            },
          },
        )
        .json()

      // Transform candles to typed objects
      const candles: OHLCCandle[] = response.data.candles.map((candle) => ({
        timestamp: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
      }))

      return {
        symbol,
        name: instrument.name,
        dateRange,
        candles,
      }
    } catch (error) {
      if (error instanceof HTTPError) {
        const errorStatus = error.response.status
        if (errorStatus === 401) {
          await logoutFn()
          throw new Error('Session expired. Please log in again.')
        }

        const errorBody = (await error.response.json()) as {
          message?: string
        }
        throw new Error(
          `Failed to fetch historical data: ${errorBody.message || error.message}`,
        )
      }

      throw error
    }
  })
