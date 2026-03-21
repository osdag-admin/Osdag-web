import React from 'react';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { onCantileverConfig } from './configs/onCantileverConfig';
import { simplySupportedBeamOutputConfig } from '../simplySupportedBeam/configs/simplySupportedBeamOutputConfig';

function OnCantilever() {
  return (
    <EngineeringModule
      moduleConfig={onCantileverConfig}
      outputConfig={simplySupportedBeamOutputConfig}
      title="On Cantilever Beam (Flexural Member)"
    />
  );
}

export default OnCantilever;
