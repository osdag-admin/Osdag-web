import React from 'react';
import simplySupportedBeamConfig from './configs/simplySupportedBeamConfig';

const SimplySupportedBeam = () => {
  // This will be replaced with the actual form and logic
  return (
    <div>
      <h2>Simply Supported Beam (Flexural Member)</h2>
      <pre>{JSON.stringify(simplySupportedBeamConfig, null, 2)}</pre>
      {/* TODO: Render input form and output using config */}
    </div>
  );
};

export default SimplySupportedBeam; 