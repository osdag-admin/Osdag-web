/**
 * Convert design output data to CSV format.
 * @param {Object} data - Design output data.
 * @returns {string} CSV formatted string.
 */
export const convertToCSV = (data) => {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return '';
  }

  // Flatten nested objects
  const flattenObject = (obj, prefix = '') => {
    const flattened = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];

        if (value === null || value === undefined) {
          flattened[newKey] = '';
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(flattened, flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          flattened[newKey] = value
            .map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v)))
            .join('; ');
        } else {
          flattened[newKey] = value;
        }
      }
    }
    return flattened;
  };

  const flatData = flattenObject(data);
  const keys = Object.keys(flatData);
  const values = Object.values(flatData);

  if (keys.length === 0) {
    return '';
  }

  // Escape CSV values
  const escapeCSV = (value) => {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = keys.map(escapeCSV).join(',');
  const row = values.map(escapeCSV).join(',');

  return [header, row].join('\n');
};

/**
 * Export data to CSV (frontend-only, no API call).
 * @param {Object} data - Data to export.
 * @returns {{success: boolean, csvContent?: string, error?: string}}
 */
export const exportToCSV = async (data) => {
  try {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      return { success: false, error: 'No data available to export' };
    }

    const csvContent = convertToCSV(data);
    if (!csvContent) {
      return { success: false, error: 'Failed to generate CSV. Data is empty.' };
    }

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `design_output_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, csvContent };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

