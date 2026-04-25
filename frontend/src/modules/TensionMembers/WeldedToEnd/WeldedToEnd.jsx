import React from 'react';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { weldedToEndConfig } from './configs/weldedToEndConfig';
import { weldedToEndOutputConfig } from './configs/weldedToEndOutputConfig';

function WeldedToEnd() {
  return (
    <EngineeringModule
      moduleConfig={weldedToEndConfig}
      outputConfig={weldedToEndOutputConfig}
      title="Tension Member Bolted Design"
    />
  );
}

export default WeldedToEnd; 