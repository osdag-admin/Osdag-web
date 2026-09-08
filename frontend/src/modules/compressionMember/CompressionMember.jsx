import { UI_STRINGS } from '../../constants/UIStrings';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { compressionMemberConfig } from './configs/compressionMemberConfig';
import { compressionMemberOutputConfig } from './configs/compressionMemberOutputConfig';

function CompressionMember() {
  return (
    <EngineeringModule
      moduleConfig={compressionMemberConfig}
      outputConfig={compressionMemberOutputConfig}
      title={UI_STRINGS.COMPRESSION_MEMBER_STRUTS}
    />
  );
}

export default CompressionMember;


