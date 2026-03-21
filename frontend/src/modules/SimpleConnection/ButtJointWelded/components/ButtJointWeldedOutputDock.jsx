import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { buttJointWeldedOutputConfig } from "../config/buttJointWeldedOutputConfig";
import { UI_STRINGS } from '../../../../constants/UIStrings';

function buttJointWeldedOutputDock({ output, extraState }) {
    return (
        <BaseOutputDock
            output={output}
            outputConfig={buttJointWeldedOutputConfig}
            title={UI_STRINGS.OUTPUT_DOCK}
            extraState={extraState}
        />
    );
}

export default buttJointWeldedOutputDock; 