/* eslint-disable no-unused-vars */
import React from "react";
import { EngineeringModule } from "../shared/components/EngineeringModule";
import { basePlateConfig } from "./configs/basePlateConfig";
import { basePlateOutputConfig } from "./configs/basePlateOutputConfig";
import { UI_STRINGS } from "../../constants/UIStrings";


export default function BasePlate() {
  return (
    <EngineeringModule
      moduleConfig={basePlateConfig}
      outputConfig={basePlateOutputConfig}
      title={UI_STRINGS.CONNECTING_MEMBERS}
    />
  );
}

