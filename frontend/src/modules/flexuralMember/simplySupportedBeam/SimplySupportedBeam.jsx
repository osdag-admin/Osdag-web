import React from 'react';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { simplySupportedBeamConfig } from './configs/simplySupportedBeamConfig';
import { simplySupportedBeamOutputConfig } from './configs/simplySupportedBeamOutputConfig';

function SimplySupportedBeam() {
  return (
    <EngineeringModule
      moduleConfig={simplySupportedBeamConfig}
      outputConfig={simplySupportedBeamOutputConfig}
      title="Simply Supported Beam(Flexural Member)"
    />
  );
}

export default SimplySupportedBeam; 