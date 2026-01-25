import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { openai } from '@/lib/openai'
import { getHistoricalData } from '@/server/kite'

export const getStockAdvice = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      symbol: z.string(),
      dateRange: z.enum(['7d', '30d', '1y']),
    }),
  )
  .handler(async ({ data }) => {
    const { symbol, dateRange } = data

    // Fetch historical data
    const historicalData = await getHistoricalData({
      data: { symbol, dateRange },
    })

    // Get the number of days for the system prompt
    const dateRangeDays =
      dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 365

    const systemPrompt = `You are a trading guru. Given data on share prices over the past ${dateRangeDays} days, write a report of no more than 150 words describing the stocks performance and recommending whether to buy, hold or sell.`

    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      instructions: systemPrompt,
      input: JSON.stringify(historicalData),
    })

    return {
      symbol: historicalData.symbol,
      name: historicalData.name,
      dateRange,
      advice: response.output_text,
    }
  })
