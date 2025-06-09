import React from 'react';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { beamToColumnEndPlateConfig } from './configs/beamToColumnEndPlateConfig';
import BeamToColumnEndPlateOutputDock from './components/BeamToColumnEndPlateOutputDock';
import { menuItems } from '../shared/utils/moduleUtils';

function BeamToColumnEndPlate() {
  return (
    <EngineeringModule
      moduleConfig={beamToColumnEndPlateConfig}
      OutputDockComponent={BeamToColumnEndPlateOutputDock}
      menuItems={menuItems}
      title="Beam-to-Column End Plate Connection"
    />
  );
}

export default BeamToColumnEndPlate;
