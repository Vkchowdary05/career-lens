import { useEffect, useState } from 'react'

/**
 * Debounce hook - delays value update until after a specified wait time
 * Useful for search inputs, resize handlers, etc.
 */
export function useDebounce<T>(value: T, waitMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, waitMs)

    return () => {
      clearTimeout(timer)
    }
  }, [value, waitMs])

  return debouncedValue
}

/**
 * Async debounce hook - debounces an async function call
 */
export function useDebouncedCallback<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  waitMs: number = 300
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args)
    }, waitMs)

    setTimeoutId(newTimeoutId)
  }
}
