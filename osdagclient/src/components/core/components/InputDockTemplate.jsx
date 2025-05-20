import React from 'react';
import InputField from './InputField';

const InputDockTemplate = ({
  fieldGroups = [],
  inputData = {},
  setInputData,
  dropdowns = {},
  errors = {},
  onSubmit,
  submitLabel = 'Design',
  resetLabel = 'Reset',
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setInputData({});
  };

  return (
    <>
      <h1 className='dock-title'>Input Dock</h1>
      <form className="input-dock-template-form" onSubmit={e => { e.preventDefault(); onSubmit(inputData); }}>
        {fieldGroups.map((group, idx) => (
          <div key={group.label || idx} className="input-dock-group">
            {group.label && <h2 className="input-dock-group-label">{group.label}</h2>}
            {group.fields.map(field => (
              <InputField
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type}
                value={inputData[field.name] || ''}
                onChange={handleChange}
                options={dropdowns[field.name] || []}
                error={errors[field.name]}
              />
            ))}
          </div>
        ))}
        <div className="input-dock-btn-row">
          <button type="button" className="input-dock-btn secondary" onClick={handleReset}>{resetLabel}</button>
          <button type="submit" className="input-dock-btn primary">{submitLabel}</button>
        </div>
      </form>
    </>
  );
};

export default InputDockTemplate; 