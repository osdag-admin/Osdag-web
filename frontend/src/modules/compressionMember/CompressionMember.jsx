import React from 'react';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { compressionMemberConfig } from './configs/compressionMemberConfig';
import { compressionMemberOutputConfig } from './configs/compressionMemberOutputConfig';

function CompressionMember() {
  return (
    <EngineeringModule
      moduleConfig={compressionMemberConfig}
      outputConfig={compressionMemberOutputConfig}
      title="Compression Member (Struts in Trusses)"
    />
  );
}

export default CompressionMember;


