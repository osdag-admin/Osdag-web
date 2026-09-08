import { UI_STRINGS } from '../../constants/UIStrings';
import { EngineeringModule } from "../shared/components/EngineeringModule";
import { axiallyLoadedColumnConfig } from "./configs/axiallyLoadedColumnConfig";
import { axiallyLoadedColumnOutputConfig } from "./configs/axiallyLoadedColumnOutputConfig";

function AxiallyLoadedColumn() {
  return (
    <EngineeringModule
      moduleConfig={axiallyLoadedColumnConfig}
      outputConfig={axiallyLoadedColumnOutputConfig}
      title={UI_STRINGS.AXIALLY_LOADED_COLUMN}
    />
  );
}

export default AxiallyLoadedColumn;

