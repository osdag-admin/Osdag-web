import React from 'react';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { boltedToEndConfig } from './configs/boltedToEndConfig';
import BoltedToEndOutputDock from './components/BoltedToEndOutputDock';
import { menuItems } from '../../shared/utils/moduleUtils';

function BoltedToEnd() {
  return (
    <EngineeringModule
      moduleConfig={boltedToEndConfig}
      OutputDockComponent={BoltedToEndOutputDock}
      menuItems={menuItems}
      title="Tension Member Bolted Design"
    />
  );
}

export default BoltedToEnd; 