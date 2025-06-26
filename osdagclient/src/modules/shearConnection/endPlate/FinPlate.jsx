import React from "react";
import { EngineeringModule } from "../../shared/components/EngineeringModule";
import FinPlateOutputDock from "./components/FinPlateOutputDock";
import { menuItems } from "../../shared/utils/moduleUtils";
import { finPlateConfig } from "../finPlate/configs/finPlateConfig";

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
