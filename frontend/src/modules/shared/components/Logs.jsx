/* eslint-disable react/prop-types */

const Logs = ({ logs }) => {
  const safeLogs = logs || [];
  
  return (
    <div className="h-full bg-white dark:bg-osdag-dark-color dark:text-white p-4 font-mono text-sm overflow-y-auto">
      <div className="mb-4 pb-2 border-b border-gray-700">
        <h3 className="text-lg font-semibold">System Logs</h3>
      </div>
      
      {safeLogs.length === 0 ? (
        <div className="italic">
          No logs available. System logs will appear here during operation.
        </div>
      ) : (
        <div className="space-y-2">
          {safeLogs.map((log, index) => {
            let logType = 'info';
            let logMessage = '';
            let logTimestamp = '';
            
            if (typeof log === 'object' && log !== null) {
              logType = log.type || 'info';
              logMessage = log.message || log.msg || JSON.stringify(log); 
              logTimestamp = log.timestamp || '';
            } else if (typeof log === 'string') {
              logMessage = log;
            } else {
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

