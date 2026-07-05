import { UI_STRINGS } from '../../../constants/UIStrings';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { purlinConfig } from './configs/purlinConfig';
import { purlinOutputConfig } from './configs/purlinOutputConfig';

function Purlin() {
  return (
    <EngineeringModule
      moduleConfig={purlinConfig}
      outputConfig={purlinOutputConfig}
      title={UI_STRINGS.PURLIN}
    />
  );
}

export default Purlin;
