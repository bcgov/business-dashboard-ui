import { CorpTypeCd } from '@bcrs-shared-components/enums'
import { BusinessConfigBen } from './BEN'

// FUTURE: this object needs an interface or type
export const BusinessConfigCben = {
  ...BusinessConfigBen,
  entityType: CorpTypeCd.BEN_CONTINUE_IN
}
