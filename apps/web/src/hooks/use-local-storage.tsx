import * as React from 'react'

import { isBrowser } from '@/lib/is-browser'

interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string
  deserializer?: (value: string) => T
  initializeWithValue?: boolean
}

const IS_SERVER = !isBrowser

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseLocalStorageOptions<T> = {},
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const { initializeWithValue = true } = options

  const getInitialValue = React.useCallback((): T => {
    return typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue
  }, [initialValue])

  const serializer = React.useCallback(
    (value: T): string => {
      if (options.serializer) {
        return options.serializer(value)
      }
      return JSON.stringify(value)
    },
    [options],
  )

  const deserializer = React.useCallback(
    (value: string): T => {
      if (options.deserializer) {
        return options.deserializer(value)
      }
      if (value === 'undefined') {
        return undefined as unknown as T
      }
      const defaultValue = getInitialValue()
      try {
        return JSON.parse(value) as T
      } catch {
        return defaultValue
      }
    },
    [options, getInitialValue],
  )

  const readValue = React.useCallback((): T => {
    const initialValueToUse = getInitialValue()

    if (IS_SERVER) {
      return initialValueToUse
    }

    try {
      const raw = window.localStorage.getItem(key)
      return raw ? deserializer(raw) : initialValueToUse
    } catch {
      return initialValueToUse
    }
  }, [getInitialValue, key, deserializer])

  const [storedValue, setStoredValue] = React.useState<T>(() => {
    if (initializeWithValue) {
      return readValue()
    }
    return getInitialValue()
  })

  const setValue: React.Dispatch<React.SetStateAction<T>> = React.useCallback(
    (value) => {
      if (IS_SERVER) {
        return
      }

      try {
        const newValue =
          typeof value === 'function'
            ? (value as (prevState: T) => T)(readValue())
            : value
        window.localStorage.setItem(key, serializer(newValue))
        setStoredValue(newValue)
        window.dispatchEvent(new StorageEvent('local-storage', { key }))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, serializer, readValue],
  )

  const removeValue = React.useCallback(() => {
    if (IS_SERVER) {
      return
    }

    const defaultValue = getInitialValue()

    window.localStorage.removeItem(key)
    setStoredValue(defaultValue)
    window.dispatchEvent(new StorageEvent('local-storage', { key }))
  }, [key, getInitialValue])

  React.useEffect(() => {
    setStoredValue(readValue())
  }, [key, readValue])

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key !== key) {
        return
      }
      setStoredValue(readValue())
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('local-storage' as any, handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage' as any, handleStorageChange)
    }
  }, [key, readValue])

  return [storedValue, setValue, removeValue]
}

export type { UseLocalStorageOptions }
