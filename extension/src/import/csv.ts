import Papa from "papaparse";

export type CsvRow = Record<string, string>;

export function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

export function parseCsvContent(content: string): {
  headers: string[];
  rows: CsvRow[];
  errors: Papa.ParseError[];
} {
  const cleaned = stripBom(content);
  const result = Papa.parse<CsvRow>(cleaned, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });
  const headers = result.meta.fields ?? [];
  return {
    headers,
    rows: result.data,
    errors: result.errors,
  };
}

export function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsvLine(fields: string[]): string {
  return fields.map(escapeCsvField).join(",");
}
