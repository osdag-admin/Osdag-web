import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { buttJointWeldedConfig } from './config/buttJointWeldedConfig';
import { buttJointWeldedOutputConfig } from './config/buttJointWeldedOutputConfig';


function ButtJointWelded() {
    return (
        <EngineeringModule
            moduleConfig={buttJointWeldedConfig}
            outputConfig={buttJointWeldedOutputConfig}
            title="Butt Joint — Welded"
        />
    );
}

export default ButtJointWelded; 