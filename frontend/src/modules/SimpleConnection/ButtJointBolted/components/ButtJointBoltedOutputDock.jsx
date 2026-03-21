import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { buttJointBoltedOutputConfig } from "../config/buttJointBoltedOutputConfig";
import { UI_STRINGS } from '../../../../constants/UIStrings';

function buttJointBoltedOutputDock({ output, extraState }) {
    return (
        <BaseOutputDock
            output={output}
            outputConfig={buttJointBoltedOutputConfig}
            title={UI_STRINGS.OUTPUT_DOCK}
            extraState={extraState}
        />
    );
}

export default buttJointBoltedOutputDock; 