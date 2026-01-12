import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getStockPerformanceSummary } from '@/server/stock-analysis'

const getStockAnalysis = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    // Test with INFY (Infosys) for the last 1 year
    const analysis = await getStockPerformanceSummary({
      data: {
        symbol: 'INFY',
        dateRange: '1y',
      },
    })

    return analysis
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Stock analysis failed: ${error.message}`)
    }
    throw error
  }
})

export const Route = createFileRoute('/_authenticated/test')({
  loader: async () => {
    const stockAnalysis = await getStockAnalysis()
    return { stockAnalysis }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  const analysis = data.stockAnalysis

  if (!analysis) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-2xl font-bold">Stock Analysis Test</h1>
        <p className="text-muted-foreground">No analysis data available</p>
      </div>
    )
  }

  const isPositiveChange = analysis.metrics.priceChangePercent >= 0

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Stock Analysis Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>
            {analysis.name} ({analysis.symbol})
          </CardTitle>
          <CardDescription>Period: {analysis.dateRange}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Period High</p>
              <p className="text-lg font-semibold">
                ₹{analysis.metrics.periodHigh.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Period Low</p>
              <p className="text-lg font-semibold">
                ₹{analysis.metrics.periodLow.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Price Change</p>
              <p className="text-lg font-semibold">
                ₹{analysis.metrics.priceChange.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Change %</p>
              <p
                className={cn(
                  'text-lg font-semibold',
                  isPositiveChange ? 'text-green-600' : 'text-red-600',
                )}
              >
                {analysis.metrics.priceChangePercent.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">AI Analysis</p>
            <p className="text-lg whitespace-pre-wrap text-muted-foreground">
              {analysis.summary}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
