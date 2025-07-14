import React from 'react';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { coverPlateBoltedConfig } from './configs/coverPlateBoltedConfig';
import CoverPlateBoltedOutputDock from './components/CoverPlateBoltedOutputDock';
import { menuItems } from '../shared/utils/moduleUtils';


function CoverPlateBolted() {
  return (
    <EngineeringModule
      moduleConfig={coverPlateBoltedConfig}
      OutputDockComponent={CoverPlateBoltedOutputDock}
      menuItems={menuItems}
      title="Cover Plate Bolted Connection"
    />
  );
}

export default CoverPlateBolted;