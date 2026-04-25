import React from 'react';
import { BaseOutputDock } from '../../shared/components/BaseOutputDock';
import { columnColumnEndPlateOutputConfig } from '../configs/columnColumnEndPlateOutputConfig';

const ColumnColumnEndPlateOutputDock = ({ output, extraState }) => {
  return (
    <BaseOutputDock 
      output={output}
      outputConfig={columnColumnEndPlateOutputConfig}
      title="Output Dock"
      extraState={extraState}
    />
  );
};

export default ColumnColumnEndPlateOutputDock;