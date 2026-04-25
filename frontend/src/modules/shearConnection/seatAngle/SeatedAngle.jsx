/* eslint-disable no-unused-vars */
import React from "react";
import { EngineeringModule } from "../../shared/components/EngineeringModule";
import { seatedAngleConfig } from "./configs/seatedAngleConfig";
import { seatedAngleOutputConfig } from "./configs/seatedAngleOutputConfig";
import { UI_STRINGS } from '../../../constants/UIStrings';

function SeatedAngle() {
  return (
    <EngineeringModule
      moduleConfig={seatedAngleConfig}
      outputConfig={seatedAngleOutputConfig}
      title={UI_STRINGS.SEATED_ANGLE}
    />  
  );
}


export default SeatedAngle;
