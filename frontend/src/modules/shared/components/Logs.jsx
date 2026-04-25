import React from 'react';

const Logs = ({ logs }) => {
  // Ensure logs is always an array, even if null/undefined is passed
  const safeLogs = logs || [];
  // Reverse the logs so that the most recent log appears at the top
  const reversedLogs = [...safeLogs].reverse();
  
  return (
    <div className="h-full bg-white dark:bg-osdag-dark-color dark:text-white p-4 font-mono text-sm overflow-y-auto">
      <div className="mb-4 pb-2 border-b border-gray-700">
        <h3 className="text-lg font-semibold">System Logs</h3>
      </div>
      
      {reversedLogs.length === 0 ? (
        <div className="italic">
          No logs available. System logs will appear here during operation.
        </div>
      ) : (
        <div className="space-y-2">
          {reversedLogs.map((log, index) => {
            // Handle different log formats
            let logType = 'info';
            let logMessage = '';
            let logTimestamp = '';
            
            if (typeof log === 'object' && log !== null) {
              // Handle log object with message, type, and timestamp properties
              logType = log.type || 'info';
              logMessage = log.message || log.msg || JSON.stringify(log); // Check both 'message' and 'msg' for compatibility
              logTimestamp = log.timestamp || '';
            } else if (typeof log === 'string') {
              // Handle string logs
              logMessage = log;
            } else {
              // Handle other types
              logMessage = String(log);
            }
            
            return (
              <div key={index} className="mb-1">
                <div className="flex items-start space-x-2">
                  <span
                    className={`${
                      logType === 'error'
                        ? 'text-red-400'
                        : logType === 'warning'
                        ? 'text-yellow-400'
                        : logType === 'success'
                        ? 'text-green-400'
                        : 'text-blue-400'
                    }`}
                  >
                    [{logType.toUpperCase()}]
                  </span>
                  <span
                    className={`break-words flex-1${
                      logMessage === '=== End Of Design ==='
                        ? ' text-osdag-green font-semibold'
                        : ''
                    }`}
                  >
                    {logMessage}
                  </span>
                  {logTimestamp && (
                    <span className="text-gray-500 text-xs whitespace-nowrap">
                      {logTimestamp}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Logs;

