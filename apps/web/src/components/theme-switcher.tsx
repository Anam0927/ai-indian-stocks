import type { LucideIcon } from 'lucide-react'

import { Monitor, Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { useIsMatchMedia } from '@/hooks/use-is-match-media'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark' | 'system'

const themes: { key: Theme; icon: LucideIcon; label: string }[] = [
  {
    key: 'system',
    icon: Monitor,
    label: 'System theme',
  },
  {
    key: 'light',
    icon: Sun,
    label: 'Light theme',
  },
  {
    key: 'dark',
    icon: Moon,
    label: 'Dark theme',
  },
]

export function ThemeSwitcher() {
  const isSystemDark = useIsMatchMedia('(prefers-color-scheme: dark)')

  const [savedTheme, setSavedTheme] = useLocalStorage<Theme | null>(
    'anaam_theme',
    null,
  )

  const [theme, setTheme] = useState<Theme>(savedTheme ?? 'system')

  const handleThemeClick = (newTheme: Theme) => {
    setTheme(newTheme)
    setSavedTheme(newTheme)
  }

  useEffect(() => {
    const root = document.documentElement

    const appliedTheme =
      theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme

    if (appliedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isSystemDark, theme])

  return (
    <div
      className={cn(
        `
          relative isolate flex h-8 rounded-full bg-background p-1 ring-1
          ring-border
        `,
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key

        return (
          <button
            aria-label={label}
            className="relative h-6 w-6 rounded-full"
            key={key}
            onClick={() => handleThemeClick(key as 'light' | 'dark' | 'system')}
            type="button"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-secondary"
                layoutId="activeTheme"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                'relative z-10 m-auto h-4 w-4',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
