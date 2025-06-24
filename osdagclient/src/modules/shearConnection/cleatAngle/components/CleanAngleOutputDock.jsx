import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { cleatAngleOutputConfig } from "../configs/cleatAngleOutputConfig";

const CleatAngleOutputDock = ({ output }) => {
  return (
    <BaseOutputDock
      output={output}
      outputConfig={cleatAngleOutputConfig}
      title="Output Dock"
    />
  );
};

export default CleatAngleOutputDock;
