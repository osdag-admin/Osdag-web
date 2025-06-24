import React from "react";
import { EngineeringModule } from "../../shared/components/EngineeringModule";
import { finPlateConfig } from "./configs/finPlateConfig";
import FinPlateOutputDock from "./components/FinPlateOutputDock";
import { menuItems } from "../../shared/utils/moduleUtils";

function FinPlate() {
  return (
    <EngineeringModule
      moduleConfig={finPlateConfig}
      OutputDockComponent={FinPlateOutputDock}
      menuItems={menuItems}
      title="Cover Plate Bolted Connection"
    />
  );
}

export default FinPlate;
