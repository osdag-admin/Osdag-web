import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { endPlateOutputConfig } from "../configs/endPlateOutputConfig";

const EndPlateOutputDock = ({ output }) => {
  return (
    <BaseOutputDock
      output={output}
      outputConfig={endPlateOutputConfig}
      title="Output Dock"
    />
  );
};

export default EndPlateOutputDock;
