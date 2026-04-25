import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { basePlateOutputConfig } from "../configs/basePlateOutputConfig";
import { UI_STRINGS } from '../../../../constants/UIStrings';

const BasePlateOutputDock = ({ output, extraState }) => {
  return (
    <BaseOutputDock
      output={output}
      outputConfig={basePlateOutputConfig}
      title={UI_STRINGS.OUTPUT_DOCK}
      extraState={extraState}
    />
  );
};

export default BasePlateOutputDock;
