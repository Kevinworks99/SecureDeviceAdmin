export const DEFAULT_SESSION_DURATION_MINUTES = 60
export const MIN_SESSION_DURATION_MINUTES = 1
export const MAX_SESSION_DURATION_MINUTES = 1440

export function isValidSessionDurationMinutes(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_SESSION_DURATION_MINUTES &&
    value <= MAX_SESSION_DURATION_MINUTES
  )
}

export function normalizeSessionDurationMinutes(
  value: unknown,
): number | null {
  if (value == null) {
    return null
  }

  const parsed = typeof value === 'number' ? value : Number(value)
  return isValidSessionDurationMinutes(parsed) ? parsed : null
}

export function getSessionDurationValidationMessage(): string {
  return `Session Expire Time must be between ${MIN_SESSION_DURATION_MINUTES} and ${MAX_SESSION_DURATION_MINUTES} minutes.`
}
