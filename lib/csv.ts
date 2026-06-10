export type CsvValue = string | number | boolean | null | undefined;

export function toCsv(headers: string[], rows: CsvValue[][]) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(','));
  return lines.join('\r\n');
}

export function csvResponse(filename: string, csv: string) {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}

function escapeCsvValue(value: CsvValue) {
  const text = value === null || value === undefined ? '' : String(value);
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}
