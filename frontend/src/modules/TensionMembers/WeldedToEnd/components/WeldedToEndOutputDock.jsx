import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { weldedToEndOutputConfig } from "../configs/weldedToEndOutputConfig";
import { UI_STRINGS } from '../../../../constants/UIStrings';

function WeldedToEndOutputDock({ output, extraState }) {
  return (
    <BaseOutputDock
      output={output}
      outputConfig={weldedToEndOutputConfig}
      title={UI_STRINGS.OUTPUT_DOCK}
      extraState={extraState}
    />
  );
}

export default WeldedToEndOutputDock; 