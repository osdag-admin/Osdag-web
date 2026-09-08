import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { weldedToEndConfig } from './configs/weldedToEndConfig';
import { weldedToEndOutputConfig } from './configs/weldedToEndOutputConfig';
import { UI_STRINGS } from '../../../constants/UIStrings';

function WeldedToEnd() {
  return (
    <EngineeringModule
      moduleConfig={weldedToEndConfig}
      outputConfig={weldedToEndOutputConfig}
      title={UI_STRINGS.WELDED_TO_END_GUSSET}
    />
  );
}

export default WeldedToEnd; 