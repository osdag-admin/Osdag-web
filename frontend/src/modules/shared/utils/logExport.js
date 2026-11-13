export const buildLogFileContent = (logs) => {
  if (!logs || logs.length === 0) return '';

  const lines = [];

  for (const log of logs) {
    if (!log) continue;

    if (typeof log === 'string') {
      lines.push(log);
      continue;
    }

    const message = log.message ?? log.msg ?? '';
    const level = (log.type || log.level || 'INFO').toString().toUpperCase();
    const timestamp = log.timestamp || '';

    if (!message) continue;

    const formatted = `[${level}] ${message}${timestamp ? ` ${timestamp}` : ''}`;
    lines.push(formatted);
  }

  return lines.join('\n');
};

