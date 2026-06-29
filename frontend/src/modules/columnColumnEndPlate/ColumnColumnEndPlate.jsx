import { UI_STRINGS } from '../../constants/UIStrings';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { columnColumnEndPlateConfig } from './configs/columnColumnEndPlateConfig';
import { columnColumnEndPlateOutputConfig } from './configs/columnColumnEndPlateOutputConfig';

function ColumnColumnEndPlate() {
  return (
    <EngineeringModule
      moduleConfig={columnColumnEndPlateConfig}
      outputConfig={columnColumnEndPlateOutputConfig}
      title={UI_STRINGS.END_PLATE}
    />
  );
}

export default ColumnColumnEndPlate;