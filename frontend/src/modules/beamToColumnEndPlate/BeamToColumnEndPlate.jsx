import React from 'react';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { beamToColumnEndPlateConfig } from './configs/beamToColumnEndPlateConfig';
import { beamToColumnEndPlateOutputConfig } from './configs/beamToColumnEndPlateOutputConfig';

function BeamToColumnEndPlate() {
  return (
    <EngineeringModule
      moduleConfig={beamToColumnEndPlateConfig}
      outputConfig={beamToColumnEndPlateOutputConfig}
      title="Beam-to-Column End Plate Connection"
    />
  );
}

export default BeamToColumnEndPlate;
