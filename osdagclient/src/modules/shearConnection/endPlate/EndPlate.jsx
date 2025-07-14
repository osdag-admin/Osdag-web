import React from "react";
import { EngineeringModule } from "../../shared/components/EngineeringModule";
import { endPlateConfig } from "./configs/endPlateConfig";
import EndPlateOutputDock from "./components/EndPlateOutputDock";
import { menuItems } from "../../shared/utils/moduleUtils";

function EndPlate() {
  return (
    <EngineeringModule
      moduleConfig={endPlateConfig}
      OutputDockComponent={EndPlateOutputDock}
      menuItems={menuItems}
      title="End Plate"
    />
  );
}

export default EndPlate;
