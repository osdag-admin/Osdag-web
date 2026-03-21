// CleatAngleOutputDock.jsx - Fixed version
import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { cleatAngleOutputConfig } from "../configs/cleatAngleOutputConfig";
import { UI_STRINGS } from '../../../../constants/UIStrings';

const CleatAngleOutputDock = ({ output, extraState }) => {
  return (
    <BaseOutputDock
      output={output}
      outputConfig={cleatAngleOutputConfig}
      title={UI_STRINGS.OUTPUT_DOCK}
      extraState={extraState}
    />
  );
};

export default CleatAngleOutputDock;