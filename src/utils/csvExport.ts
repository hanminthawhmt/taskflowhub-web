/**
 * Helper utility to export arbitrary JSON objects/arrays as a formatted CSV file download.
 */

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
) {
  if (!data || data.length === 0) return

  let headers: string[] = []
  let keys: (keyof T)[] = []

  if (columns && columns.length > 0) {
    headers = columns.map((c) => c.header)
    keys = columns.map((c) => c.key)
  } else {
    keys = Object.keys(data[0]) as (keyof T)[]
    headers = keys.map((k) => String(k))
  }

  const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return '""'
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>
      if (obj.name) return `"${String(obj.name).replace(/"/g, '""')}"`
      if (obj.title) return `"${String(obj.title).replace(/"/g, '""')}"`
      return `"${JSON.stringify(val).replace(/"/g, '""')}"`
    }
    const str = String(val)
    return `"${str.replace(/"/g, '""')}"`
  }

  const csvRows: string[] = []
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','))

  for (const row of data) {
    const rowValues = keys.map((k) => formatValue(row[k]))
    csvRows.push(rowValues.join(','))
  }

  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
