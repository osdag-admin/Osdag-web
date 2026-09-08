import { UI_STRINGS } from '../../constants/UIStrings';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { coverPlateWeldedConfig } from './configs/coverPlateWeldedConfig';
import { coverPlateWeldedOutputConfig } from './configs/coverPlateWeldedOutputConfig';

const CoverPlateWelded = () => {
  return (
    <EngineeringModule
      moduleConfig={coverPlateWeldedConfig}
      outputConfig={coverPlateWeldedOutputConfig}
      title={UI_STRINGS.COVER_PLATE_WELDED}
    />
  );
};

export default CoverPlateWelded;
