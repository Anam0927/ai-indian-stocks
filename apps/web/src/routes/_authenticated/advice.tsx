import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { LoaderCircleIcon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import type { DateRange, StockSymbol } from '@/lib/instruments'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DATE_RANGES, INSTRUMENTS } from '@/lib/instruments'
import { getStockAdvice } from '@/server/advice'

export const Route = createFileRoute('/_authenticated/advice')({
  component: RouteComponent,
})

const stockSymbols = Object.keys(INSTRUMENTS) as StockSymbol[]
const dateRangeKeys = Object.keys(DATE_RANGES) as DateRange[]

const adviceFormSchema = z.object({
  stock: z.string().min(1, 'Please select a stock.'),
  dateRange: z.string().min(1, 'Please select a date range.'),
})

function RouteComponent() {
  const getAdvice = useServerFn(getStockAdvice)

  const {
    mutate: fetchAdvice,
    data: adviceResult,
    isPending,
    reset: resetAdvice,
  } = useMutation({
    mutationFn: (params: { symbol: string; dateRange: DateRange }) =>
      getAdvice({ data: params }),
    onError: (error) => {
      toast.error('Failed to get advice', {
        description: error.message,
      })
    },
  })

  const form = useForm({
    defaultValues: {
      stock: '',
      dateRange: '',
    },
    validators: {
      onSubmit: adviceFormSchema,
    },
    onSubmit: async ({ value }) => {
      fetchAdvice({
        symbol: value.stock,
        dateRange: value.dateRange as DateRange,
      })
    },
  })

  const handleReset = () => {
    form.reset()
    resetAdvice()
  }

  return (
    <div className="container mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Stock Analysis</CardTitle>
          <CardDescription>
            Select a stock and date range to get investment advice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="advice-form"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field
                name="stock"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field orientation="vertical" data-invalid={isInvalid}>
                      <FieldContent>
                        <FieldLabel>Stock</FieldLabel>
                        <FieldDescription>
                          Select the stock you want to analyze.
                        </FieldDescription>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </FieldContent>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value) => {
                          if (value !== null) {
                            field.handleChange(value)
                          }
                        }}
                      >
                        <SelectTrigger
                          aria-invalid={isInvalid}
                          className="w-full"
                        >
                          <SelectValue>
                            {field.state.value
                              ? `${INSTRUMENTS[field.state.value as StockSymbol]?.name} (${field.state.value})`
                              : 'Select a stock'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {stockSymbols.map((symbol) => (
                            <SelectItem key={symbol} value={symbol}>
                              {INSTRUMENTS[symbol].name} ({symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )
                }}
              />

              <form.Field
                name="dateRange"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field orientation="vertical" data-invalid={isInvalid}>
                      <FieldContent>
                        <FieldLabel>Date Range</FieldLabel>
                        <FieldDescription>
                          Select the time period for historical analysis.
                        </FieldDescription>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </FieldContent>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value) => {
                          if (value !== null) {
                            field.handleChange(value)
                          }
                        }}
                      >
                        <SelectTrigger
                          aria-invalid={isInvalid}
                          className="w-full"
                        >
                          <SelectValue>
                            {field.state.value
                              ? DATE_RANGES[field.state.value as DateRange]
                                  ?.label
                              : 'Select a date range'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {dateRangeKeys.map((key) => (
                            <SelectItem key={key} value={key}>
                              {DATE_RANGES[key].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )
                }}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" form="advice-form" disabled={isPending}>
              {isPending && <LoaderCircleIcon className="animate-spin" />}
              Get Advice
            </Button>
          </Field>
        </CardFooter>
      </Card>

      {adviceResult && (
        <Card>
          <CardHeader>
            <CardTitle>
              {adviceResult.name} ({adviceResult.symbol})
            </CardTitle>
            <CardDescription>
              Analysis for {DATE_RANGES[adviceResult.dateRange].label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed whitespace-pre-wrap text-foreground">
              {adviceResult.advice}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
