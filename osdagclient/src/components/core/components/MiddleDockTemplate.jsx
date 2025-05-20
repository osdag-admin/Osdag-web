import React from 'react';

const MiddleDockTemplate = ({ imageUrl, logs = [] }) => {
  return (
    <div className="middle-dock-template-root">
      <div className="middle-dock-template-image-bg">
        {imageUrl && <img src={imageUrl} alt="Middle Dock Visual" className="middle-dock-template-image" />}
      </div>
      <div className="middle-dock-template-log-box">
        {logs.map((log, idx) => {
          const level = log?.level?.toLowerCase?.() || 'info'; // Default to 'info' if missing
          const timestamp = log?.timestamp || 'Unknown time';
          const message = log?.message || 'No message provided';
          return (
            <div key={idx} className={`middle-dock-template-log middle-dock-template-log-${level}`}>
              {timestamp} - {log.level || 'INFO'} - {message}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiddleDockTemplate;
