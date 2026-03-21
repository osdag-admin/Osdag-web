import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { lapJointBoltedOutputConfig } from "../config/lapJointBoltedOutputConfig";
import { UI_STRINGS } from '../../../../constants/UIStrings';

function lapJointBoltedOutputDock({ output, extraState }) {
    return (
        <BaseOutputDock
            output={output}
            outputConfig={lapJointBoltedOutputConfig}
            title={UI_STRINGS.OUTPUT_DOCK}
            extraState={extraState}
        />
    );
}

export default lapJointBoltedOutputDock; 