import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { cleatAngleOutputConfig } from "../configs/cleatAngleOutputConfig";

const CleatAngleOutputDock = ({ output }) => {
  console.log("Cleat Angle Output Dock - output received:", output);
  console.log("Cleat Angle Output Dock - outputConfig:", cleatAngleOutputConfig);
  
  return (
    <BaseOutputDock
      output={output}
      outputConfig={cleatAngleOutputConfig}
      title="Output Dock"
    />
  );
};

export default CleatAngleOutputDock;
