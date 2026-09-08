import { UI_STRINGS } from '../../../constants/UIStrings';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { buttJointBoltedConfig } from './config/buttJointBoltedConfig';
import { buttJointBoltedOutputConfig } from './config/buttJointBoltedOutputConfig';


function ButtJointBolted() {
    return (
        <EngineeringModule
            moduleConfig={buttJointBoltedConfig}
            outputConfig={buttJointBoltedOutputConfig}
            title={UI_STRINGS.BUTT_JOINT_BOLTED}
        />
    );
}

export default ButtJointBolted; 