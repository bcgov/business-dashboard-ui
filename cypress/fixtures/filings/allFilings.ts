import { ApiResponseFilingI } from '../../../src/interfaces/filing-i'
import { addressChange } from './addressChange/completed'
import { annualReport } from './annualReport/completed'
import { directorChange } from './directorChange/directorChange'
import { administrativeDissolution } from './dissolution/administrativeDissolution'
import { bcGeneralPartnershipRegistration } from './bcGeneralPartnershipRegistration/bcGeneralPartnershipRegistration'
import { changeOfRegistrationApplication } from './changeOfRegistrationApplication/changeOfRegistrationApplication'
import { incorporationApplication } from './incoporationApplication/incorporationApplication'

export const allFilings: ApiResponseFilingI[] =
  [
    addressChange,
    annualReport,
    directorChange,
    administrativeDissolution,
    bcGeneralPartnershipRegistration,
    changeOfRegistrationApplication,
    incorporationApplication
  ]
