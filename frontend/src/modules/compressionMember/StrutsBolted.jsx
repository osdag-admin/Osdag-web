import { UI_STRINGS } from '../../constants/UIStrings';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { strutsBoltedConfig } from './configs/strutsBoltedConfig';
import { strutsBoltedOutputConfig } from './configs/strutsBoltedOutputConfig';

function StrutsBolted() {
    return (
        <EngineeringModule
            moduleConfig={strutsBoltedConfig}
            outputConfig={strutsBoltedOutputConfig}
            title={UI_STRINGS.STRUTS_BOLTED_TO_END_GUSSET}
        />
    );
}

export default StrutsBolted;
