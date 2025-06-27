import React from 'react';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { simplySupportedBeamConfig } from './configs/simplySupportedBeamConfig';
import SimplySupportedBeamOutputDock from './components/SimplySupportedBeamOutputDock';
import { menuItems } from '../../shared/utils/moduleUtils';

function SimplySupportedBeam() {
  return (
    <EngineeringModule
      moduleConfig={simplySupportedBeamConfig}
      OutputDockComponent={SimplySupportedBeamOutputDock}
      menuItems={menuItems}
      title="Simply Supported Beam (Flexural Member)"
    />
  );
}

export default SimplySupportedBeam; 