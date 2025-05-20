import React from 'react';

const OutputDockTemplate = ({ outputFields = [], outputData = {} }) => {
  return (
    <>
      <h1 className='dock-title'>Output Dock</h1>
      <div className="output-dock-template-root">
        {outputFields.map((field, idx) =>
          field.isHeader ? (
            <div key={idx} className="output-dock-template-header">{field.label}</div>
          ) : (
            <div key={idx} className="output-dock-template-row">
              <label>{field.label}</label>
              <input value={outputData[field.name] || ''} readOnly />
              {field.button && <button className="output-dock-template-btn">{field.button}</button>}
            </div>
          )
        )}
        <div className="output-dock-template-btn-row">
          <button className="output-dock-template-btn primary">Create Design Report</button>
          <button className="output-dock-template-btn primary">Save Output</button>
        </div>
      </div>
    </>
  );
};

export default OutputDockTemplate; 