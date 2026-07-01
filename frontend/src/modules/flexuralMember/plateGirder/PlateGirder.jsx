import React from 'react';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { plateGirderConfig } from './configs/plateGirderConfig';
import { plateGirderOutputConfig } from './configs/plateGirderOutputConfig';

function PlateGirder() {
  return (
    <EngineeringModule
      moduleConfig={plateGirderConfig}
      outputConfig={plateGirderOutputConfig}
      title="Plate Girder (Flexural Member)"
    />
  );
}

export default PlateGirder;

