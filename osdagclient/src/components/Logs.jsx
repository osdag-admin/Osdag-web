import React from 'react'

const Logs = ({ logs }) => {

    return (
        <div className='log-box'>
            {logs && logs.map((log, index) => {
                return (
                    <div key={index}>
                        <p style={{
                            color: log.type === 'error' ? 'red' : (
                                log.type === 'warning' ? 'orange' : 'blue'
                            )
                        }}>
                            <span className='log-info-text'>{log.type}: </span>
                            <span className='log-text'>{log.msg}</span>
                        </p>
                    </div>
                )
            })}
        </div>
    )
}

export default Logs