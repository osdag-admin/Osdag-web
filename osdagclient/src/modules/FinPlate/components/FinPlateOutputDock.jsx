import React from 'react';
import { BaseOutputDock } from '../../shared/components/BaseOutputDock';
import { finPlateOutputConfig } from '../configs/finPlateOutputConfig';

const FinPlateOutputDock = ({ output, extraState }) => {
  return (
    <BaseOutputDock 
      output={output}
      outputConfig={finPlateOutputConfig}
      title="Output Dock"
      extraState={extraState}
    />
  );
};

export default FinPlateOutputDock;