import React from 'react';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { boltedToEndConfig } from './configs/boltedToEndConfig';
import { boltedToEndOutputConfig } from './configs/boltedToEndOutputConfig';

function BoltedToEnd() {
  return (
    <EngineeringModule
      moduleConfig={boltedToEndConfig}
      outputConfig={boltedToEndOutputConfig}
      title="Tension Member Bolted Design"
    />
  );
}

export default BoltedToEnd; 