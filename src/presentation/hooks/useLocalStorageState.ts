import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

/** useState that survives reloads. Storage can be unavailable (private mode, quota), so every
 *  access is guarded and the state keeps working in memory if it fails. */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) return JSON.parse(raw) as T
    } catch {
      // Fall through to the initial value.
    }
    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore: in-memory state still works.
    }
  }, [key, value])

  return [value, setValue]
}
