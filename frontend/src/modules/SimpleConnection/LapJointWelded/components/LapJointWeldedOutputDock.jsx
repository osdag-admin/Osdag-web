import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { lapJointWeldedOutputConfig } from "../config/lapJointWeldedOutputConfig";
import { UI_STRINGS } from '../../../../constants/UIStrings';

function lapJointWeldedOutputDock({ output, extraState }) {
    return (
        <BaseOutputDock
            output={output}
            outputConfig={lapJointWeldedOutputConfig}
            title={UI_STRINGS.OUTPUT_DOCK}
            extraState={extraState}
        />
    );
}

export default lapJointWeldedOutputDock; 