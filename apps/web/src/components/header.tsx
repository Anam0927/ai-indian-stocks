import { Link } from '@tanstack/react-router'
import { CandlestickChartIcon } from 'lucide-react'

import { ThemeSwitcher } from './theme-switcher'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-background">
      <div
        className={`
          container mx-auto flex flex-row items-center justify-between px-6 py-4
        `}
      >
        <Link to="/">
          <CandlestickChartIcon className="size-8 text-primary" />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
