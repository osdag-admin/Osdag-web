import { UI_STRINGS } from '../../constants/UIStrings';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { coverPlateBoltedConfig } from './configs/coverPlateBoltedConfig';
import { coverPlateBoltedOutputConfig } from './configs/coverPlateBoltedOutputConfig';


function CoverPlateBolted() {
  return (
    <EngineeringModule
      moduleConfig={coverPlateBoltedConfig}
      outputConfig={coverPlateBoltedOutputConfig}
      title={UI_STRINGS.COVER_PLATE_BOLTED}
    />
  );
}

export default CoverPlateBolted;