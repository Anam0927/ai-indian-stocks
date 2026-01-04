import { Link } from '@tanstack/react-router'
import { CandlestickChartIcon } from 'lucide-react'

import { ThemeSwitcher } from './theme-switcher'

export default function Header() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-6 py-2">
        <Link to="/">
          <CandlestickChartIcon className="size-8" />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
        </div>
      </div>
      <hr />
    </div>
  )
}
