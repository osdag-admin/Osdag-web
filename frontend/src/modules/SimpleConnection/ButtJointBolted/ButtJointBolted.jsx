import React from 'react';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { buttJointBoltedConfig } from './config/buttJointBoltedConfig';
import { buttJointBoltedOutputConfig } from './config/buttJointBoltedOutputConfig';


function ButtJointBolted() {
    return (
        <EngineeringModule
            moduleConfig={buttJointBoltedConfig}
            outputConfig={buttJointBoltedOutputConfig}
            title="Butt Joint Bolted"
        />
    );
}

export default ButtJointBolted; 