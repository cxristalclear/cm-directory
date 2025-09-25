export function buildCursorUrl(
  pathname: string,
  params: URLSearchParams,
  cursor: string | null,
): string {
  if (cursor) {
    params.set("cursor", cursor)
  } else {
    params.delete("cursor")
  }
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
