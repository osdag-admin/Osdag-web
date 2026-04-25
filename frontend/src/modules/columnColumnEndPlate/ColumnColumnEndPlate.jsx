import React from 'react';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { columnColumnEndPlateConfig } from './configs/columnColumnEndPlateConfig';
import { columnColumnEndPlateOutputConfig } from './configs/columnColumnEndPlateOutputConfig';

function ColumnColumnEndPlate() {
  return (
    <EngineeringModule
      moduleConfig={columnColumnEndPlateConfig}
      outputConfig={columnColumnEndPlateOutputConfig}
      title="Column Column End Plate Connection"
    />
  );
}

export default ColumnColumnEndPlate;