// CleatAngle.jsx - Fixed version
import React from "react";
import { EngineeringModule } from "../../shared/components/EngineeringModule";
import { cleatAngleConfig } from "./configs/cleatAngleConfig";
import { cleatAngleOutputConfig } from "./configs/cleatAngleOutputConfig";
import { UI_STRINGS } from '../../../constants/UIStrings';

function CleatAngle() {
  return (
    <EngineeringModule
      moduleConfig={cleatAngleConfig}
      outputConfig={cleatAngleOutputConfig}
      title={UI_STRINGS.OUTPUT_DOCK}
    />
  );
}

export default CleatAngle;
