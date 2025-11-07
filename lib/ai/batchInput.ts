/**
 * Parse batch input (CSV format: name, website).
 * Kept client-safe so importer UI helpers can safely reuse the logic.
 */
export function parseBatchInput(input: string): Array<{ name: string; website?: string }> {
  const lines = input.trim().split('\n')
  const companies: Array<{ name: string; website?: string }> = []

  for (const line of lines) {
    if (!line.trim()) continue

    const parts = line.split(',').map(part => part.trim())
    if (parts.length >= 1) {
      companies.push({
        name: parts[0],
        website: parts[1] || undefined,
      })
    }
  }

  return companies
}
