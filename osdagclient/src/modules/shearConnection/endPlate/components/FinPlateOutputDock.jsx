import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { finPlateOutputConfig } from "../configs/finPlateOutputConfig";

const FinPlateOutputDock = ({ output }) => {
  return (
    <BaseOutputDock
      output={output}
      outputConfig={finPlateOutputConfig}
      title="Output Dock"
    />
  );
};

export default FinPlateOutputDock;
