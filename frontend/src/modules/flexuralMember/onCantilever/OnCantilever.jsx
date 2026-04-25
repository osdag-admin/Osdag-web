import React from 'react';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { onCantileverConfig } from './configs/onCantileverConfig';
import { onCantileverOutputConfig } from './configs/onCantileverOutputConfig';

function OnCantilever() {
  return (
    <EngineeringModule
      moduleConfig={onCantileverConfig}
      outputConfig={onCantileverOutputConfig}
      title="On Cantilever Beam (Flexural Member)"
    />
  );
}

export default OnCantilever;
