/**
 * A generic utility to export an array of data to a CSV file.
 * @param {string[]} headers - The column headers for the CSV.
 * @param {Array<Object>} data - The array of data objects to export.
 * @param {function(Object): Array<string|number>} rowMapper - A function that maps a data object to an array of cell values.
 * @param {string} filename - The desired filename for the download (e.g., 'export.csv').
 */
export const exportToCSV = (headers, data, rowMapper, filename) => {
  if (!data || data.length === 0) {
    console.warn("Export cancelled: No data to export.");
    return;
  }

  // Function to safely format a cell value for CSV
  const formatCell = (cell) => {
    const cellStr = String(cell ?? ''); // Use empty string for null/undefined
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
      return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
  };

  const headerRow = headers.join(',');
  const dataRows = data.map(item => rowMapper(item).map(formatCell).join(','));

  // Add BOM for Excel compatibility with UTF-8 characters
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};