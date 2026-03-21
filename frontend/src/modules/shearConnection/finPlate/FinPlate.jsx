import React from "react";
import { EngineeringModule } from "../../shared/components/EngineeringModule";
import { finPlateConfig } from "./configs/finPlateConfig";
import { finPlateOutputConfig } from "./configs/finPlateOutputConfig";
import { UI_STRINGS } from '../../../constants/UIStrings';

function FinPlate() {
  return (
    <EngineeringModule
      moduleConfig={finPlateConfig}
      outputConfig={finPlateOutputConfig}
      title={UI_STRINGS.OUTPUT_DOCK} 
    />
  );
}

export default FinPlate;
