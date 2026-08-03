import dayjs from 'dayjs'
import type { Timestamp } from 'firebase/firestore'

/** Convert a Firestore Timestamp (or compatible) to epoch milliseconds. */
export function timestampToMillis(
  value: Timestamp | { seconds: number; nanoseconds: number } | Date | null | undefined,
): number | null {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  if (typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') {
    return value.toMillis()
  }

  if (
    typeof value === 'object' &&
    'seconds' in value &&
    typeof value.seconds === 'number'
  ) {
    return value.seconds * 1000 + Math.floor((value.nanoseconds ?? 0) / 1e6)
  }

  return null
}

/** Format a timestamp as time only (e.g. 3:45 PM). */
export function formatTimeOnly(
  value: Timestamp | { seconds: number; nanoseconds: number } | Date | number | null | undefined,
  fallback = '—',
): string {
  const millis =
    typeof value === 'number' ? value : timestampToMillis(value as Timestamp | null)

  if (millis == null) {
    return fallback
  }

  return dayjs(millis).format('h:mm A')
}

/** Format a Firestore timestamp for display in grids and details. */
export function formatTimestamp(
  value: Timestamp | { seconds: number; nanoseconds: number } | Date | number | null | undefined,
  fallback = '—',
): string {
  const millis =
    typeof value === 'number' ? value : timestampToMillis(value as Timestamp | null)

  if (millis == null) {
    return fallback
  }

  return dayjs(millis).format('MMM D, YYYY h:mm A')
}
