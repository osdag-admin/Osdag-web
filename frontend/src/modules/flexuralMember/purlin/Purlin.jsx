import React from 'react';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { purlinConfig } from './configs/purlinConfig';
import { purlinOutputConfig } from './configs/purlinOutputConfig';

function Purlin() {
  return (
    <EngineeringModule
      moduleConfig={purlinConfig}
      outputConfig={purlinOutputConfig}
      title="Purlin (Flexural Member)"
    />
  );
}

export default Purlin;
