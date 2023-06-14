import React from 'react'

let endOfDesignLog = ""
const Logs = ({ logs }) => {

    return (
        <div className='log-box'>
            {logs && logs.map((log, index) => {
                if (log.msg.includes('=== End Of Design ===')) {
                    endOfDesignLog = log.msg
                    return <></>
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