/**
 * Utility to export tabular data to clean, Excel-compatible CSV files with UTF-8 BOM
 * Supports Spanish characters, accents, Colombian Pesos, and date formats.
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  // UTF-8 Byte Order Mark (BOM) ensures Microsoft Excel opens accents and ñ correctly
  const BOM = '\uFEFF';
  
  const escapeCell = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Semicolon delimiter is the standard for Windows Excel in Spanish locales
  const headerLine = headers.map(escapeCell).join(';');
  const dataLines = rows.map(row => row.map(escapeCell).join(';'));
  
  const csvContent = BOM + [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${filename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
