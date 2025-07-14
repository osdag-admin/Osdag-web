import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { finPlateOutputConfig } from "../configs/finPlateOutputConfig";
import { UI_STRINGS } from '../../../../constants/UIStrings';

const FinPlateOutputDock = ({ output, extraState }) => {
  return (
    <BaseOutputDock
      output={output}
      outputConfig={finPlateOutputConfig}
      title={UI_STRINGS.OUTPUT_DOCK}
      extraState={extraState}
    />
  );
};

export default FinPlateOutputDock;
