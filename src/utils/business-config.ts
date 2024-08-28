import type { CorpTypeCd } from '@bcrs-shared-components/enums'

import { BusinessConfigBc } from './business-config/BC'
import { BusinessConfigBen } from './business-config/BEN'
import { BusinessConfigC } from './business-config/C'
import { BusinessConfigCben } from './business-config/CBEN'
import { BusinessConfigCc } from './business-config/CC'
import { BusinessConfigCcc } from './business-config/CCC'
import { BusinessConfigCp } from './business-config/CP'
import { BusinessConfigCul } from './business-config/CUL'
import { BusinessConfigGp } from './business-config/GP'
import { BusinessConfigSp } from './business-config/SP'
import { BusinessConfigUlc } from './business-config/ULC'

export const BusinessConfigJson = [
  BusinessConfigBc,
  BusinessConfigBen,
  BusinessConfigC,
  BusinessConfigCben,
  BusinessConfigCc,
  BusinessConfigCcc,
  BusinessConfigCp,
  BusinessConfigCul,
  BusinessConfigGp,
  BusinessConfigSp,
  BusinessConfigUlc
]

export const getBusinessConfig = (corpType: CorpTypeCd): BusinessConfigI =>
  BusinessConfigJson.find(bcj => bcj.entityType === corpType)
