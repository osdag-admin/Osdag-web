import React from 'react';

const InputField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  type = 'text',
  error,
  ...rest
}) => {
  return (
    <div className="input-field-group">
      {label && <label htmlFor={name} className="input-field-label">{label}</label>}
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="input-field-select"
          {...rest}
        >
          <option value="">Select</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className="input-field-input"
          {...rest}
        />
      )}
      {error && <span className="input-field-error">{error}</span>}
    </div>
  );
};

export default InputField; 