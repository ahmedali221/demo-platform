import * as XLSX from 'xlsx';
import type { ImportRecord } from '../components/ImportLogsTable';

export function exportToExcel(records: ImportRecord[], filename = 'import-logs'): void {
  const rows = records.map((r) => ({
    'Import ID':   r.id,
    'File Name':   r.fileName,
    'Data Source': r.dataSource,
    'Total Rows':  r.rowsTotal,
    'Parsed':      r.rowsParsed,
    'Failed':      r.rowsFailed,
    'Status':      r.status,
    'Date':        r.createdAt,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 36 }, // Import ID
    { wch: 30 }, // File Name
    { wch: 18 }, // Data Source
    { wch: 12 }, // Total Rows
    { wch: 10 }, // Parsed
    { wch: 10 }, // Failed
    { wch: 14 }, // Status
    { wch: 20 }, // Date
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Import Logs');

  XLSX.writeFile(wb, `${filename}.xlsx`);
}
