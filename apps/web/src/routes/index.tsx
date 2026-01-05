import { createFileRoute } from '@tanstack/react-router'
import { BotIcon, CandlestickChartIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth'
import { getKiteLoginUrl } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <section>
        <h1
          className={`
            container mx-auto flex items-center justify-center gap-3 px-6 py-20
            text-6xl leading-snug font-medium text-balance
            [&_svg]:mx-2 [&_svg]:text-primary
            [&>svg]:inline-block [&>svg]:size-12
          `}
        >
          <BotIcon /> AI Stock <CandlestickChartIcon /> Advisor
        </h1>
      </section>

      {!isAuthenticated && (
        <section className="container mx-auto my-20 px-6 text-center">
          <Button
            size="2xl"
            render={<a href={getKiteLoginUrl()} />}
            nativeButton={false}
          >
            Login to Get Started
          </Button>
        </section>
      )}
    </>
  )
}
