import React from 'react';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { strutsBoltedConfig } from './configs/strutsBoltedConfig';
import { strutsBoltedOutputConfig } from './configs/strutsBoltedOutputConfig';

function StrutsBolted() {
    return (
        <EngineeringModule
            moduleConfig={strutsBoltedConfig}
            outputConfig={strutsBoltedOutputConfig}
            title="Struts Bolted to End Gusset"
        />
    );
}

export default StrutsBolted;
