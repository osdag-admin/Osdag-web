import React from 'react';
import { BaseOutputDock } from '../../shared/components/BaseOutputDock';
import { coverPlateBoltedOutputConfig } from '../configs/coverPlateBoltedOutputConfig';

const CoverPlateBoltedOutputDock = ({ output }) => {
  return (
    <BaseOutputDock 
      output={output}
      outputConfig={coverPlateBoltedOutputConfig}
      title="Output Dock"
    />
  );
};

export default CoverPlateBoltedOutputDock;