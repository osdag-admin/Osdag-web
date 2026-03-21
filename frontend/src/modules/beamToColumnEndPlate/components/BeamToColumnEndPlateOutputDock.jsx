import React from 'react';
import { BaseOutputDock } from '../../shared/components/BaseOutputDock';
import { beamToColumnEndPlateOutputConfig } from '../configs/beamToColumnEndPlateOutputConfig';

const BeamToColumnEndPlateOutputDock = ({ output, extraState }) => {
  return (
    <BaseOutputDock 
      output={output}
      outputConfig={beamToColumnEndPlateOutputConfig}
      title="Output Dock"
      disabled={!output}
      extraState={extraState}
    />
  );
};

export default BeamToColumnEndPlateOutputDock;