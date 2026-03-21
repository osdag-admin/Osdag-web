import React from 'react';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { purlinConfig } from './configs/purlinConfig';
import { simplySupportedBeamOutputConfig } from '../simplySupportedBeam/configs/simplySupportedBeamOutputConfig';

function Purlin() {
  return (
    <EngineeringModule
      moduleConfig={purlinConfig}
      outputConfig={simplySupportedBeamOutputConfig}
      title="Purlin (Flexural Member)"
    />
  );
}

export default Purlin;
