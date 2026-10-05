export type CsvCell = string | number | boolean | null | undefined
export type CsvRow = CsvCell[]

function escapeCell(cell: CsvCell): string {
  if (cell === null || cell === undefined) return ''
  const text = String(cell)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** RFC 4180 CSV. The BOM makes Excel open accented characters (á, ñ…) correctly. */
export function toCsv(rows: CsvRow[]): string {
  return '﻿' + rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')
}
