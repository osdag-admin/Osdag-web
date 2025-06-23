import React, { useState, useEffect } from 'react'

const Logs = ({ logs }) => {
    // Move endOfDesignLog INSIDE the component as state
    const [endOfDesignLog, setEndOfDesignLog] = useState("");

    // Reset endOfDesignLog when logs prop changes or becomes null/empty
    useEffect(() => {
        if (!logs || logs.length === 0) {
            console.log("🧹 LOGS: Clearing endOfDesignLog - no logs");
            setEndOfDesignLog("");
            return;
        }

        // Find the end of design log in the current logs
        let foundEndLog = "";
        logs.forEach(log => {
            if (log.msg.includes('=== End Of Design ===')) {
                foundEndLog = log.msg;
            }
        });
        
        setEndOfDesignLog(foundEndLog);
        
        if (foundEndLog) {
            console.log("LOGS: Found end of design log");
        } else {
            console.log("LOGS: No end of design log found");
        }
    }, [logs]);

    return (
        <div className='log-box'>
            {logs && logs.map((log, index) => {
                if (log.msg.includes('=== End Of Design ===')) {
                    return null;
                }
                return (
                    <p key={index} style={{
                        color: log.type === 'error' ? 'red' : (
                            log.type === 'warning' ? 'orange' : 'blue'
                        )
                    }}>
                        <span className='log-info-text'>{log.type}: </span>
                        <span className='log-text'>{log.msg}</span>
                    </p>
                )
            })}
            {endOfDesignLog && <p style={{ color: 'green' }}>
                <span className='log-info-text'>INFO: </span>
                <span className='log-text'>{endOfDesignLog}</span>
            </p>}
        </div>
    )
}

export default Logs