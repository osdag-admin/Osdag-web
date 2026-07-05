import { UI_STRINGS } from '../../../constants/UIStrings';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { buttJointWeldedConfig } from './config/buttJointWeldedConfig';
import { buttJointWeldedOutputConfig } from './config/buttJointWeldedOutputConfig';


function ButtJointWelded() {
    return (
        <EngineeringModule
            moduleConfig={buttJointWeldedConfig}
            outputConfig={buttJointWeldedOutputConfig}
            title={UI_STRINGS.BUTT_JOINT_WELDED}
        />
    );
}

export default ButtJointWelded; 