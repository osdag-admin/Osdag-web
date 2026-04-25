import React from 'react';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { beamBeamEndPlateConfig } from './configs/beamBeamEndPlateConfig';
import { beamBeamEndPlateOutputConfig } from './configs/beamBeamEndPlateOutputConfig';

function BeamBeamEndPlate() {
  return (
    <EngineeringModule
      moduleConfig={beamBeamEndPlateConfig}
      outputConfig={beamBeamEndPlateOutputConfig}
      title="Beam Beam End Plate Connection"
    />
  );
}

export default BeamBeamEndPlate;