import React from 'react';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { beamBeamEndPlateConfig } from './configs/beamBeamEndPlateConfig';
import BeamBeamEndPlateOutputDock from './components/BeamBeamEndPlateOutputDock';
import { menuItems } from '../shared/utils/moduleUtils';

function BeamBeamEndPlate() {
  return (
    <EngineeringModule
      moduleConfig={beamBeamEndPlateConfig}
      OutputDockComponent={BeamBeamEndPlateOutputDock}
      menuItems={menuItems}
      title="Beam Beam End Plate Connection"
    />
  );
}

export default BeamBeamEndPlate;