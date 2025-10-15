export function toIsoString(
  value: string | Date | null | undefined,
  fallback: string,
): string {
  if (!value) {
    return fallback
  }

  const dateValue = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(dateValue.getTime())) {
    return fallback
  }

  return dateValue.toISOString()
}

export function getBuildTimestamp(): string {
  const defaultBuildTimestamp = new Date().toISOString()
  const configuredTimestamp =
    process.env.NEXT_PUBLIC_BUILD_TIMESTAMP ?? process.env.BUILD_TIMESTAMP

  return toIsoString(configuredTimestamp ?? null, defaultBuildTimestamp)
}
