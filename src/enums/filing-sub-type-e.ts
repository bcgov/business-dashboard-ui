import { AmalgamationTypes, FilingTypes, RestorationTypes } from '@bcrs-shared-components/enums'

/** Filing sub-types used by Legal API. */
// FUTURE: move these to shared enum and import that instead
export enum FilingSubTypeE {
  ADMIN_FREEZE = 'adminFreeze',
  ADMIN_UNFREEZE = 'adminUnfreeze',
  AMALGAMATION_REGULAR = AmalgamationTypes.REGULAR,
  AMALGAMATION_HORIZONTAL = AmalgamationTypes.HORIZONTAL,
  AMALGAMATION_VERTICAL = AmalgamationTypes.VERTICAL,
  COURT_ORDERED_LIQUIDATION = 'courtOrderedLiquidation',
  DISSOLUTION_ADMINISTRATIVE = 'administrative',
  DISSOLUTION_DELAY = 'delay',
  DISSOLUTION_INVOLUNTARY = 'involuntary',
  DISSOLUTION_VOLUNTARY = 'voluntary',
  FULL_RESTORATION = RestorationTypes.FULL,
  LIMITED_RESTORATION = RestorationTypes.LIMITED,
  LIMITED_RESTORATION_EXTENSION = RestorationTypes.LTD_EXTEND,
  LIMITED_RESTORATION_TO_FULL = RestorationTypes.LTD_TO_FULL,
  APPOINT_RECEIVER = FilingTypes.APPOINT_RECEIVER, // Low Volume Filing
  CEASE_RECEIVER = FilingTypes.CEASE_RECEIVER, // Low Volume Filing
  AMEND_RECEIVER = FilingTypes.AMEND_RECEIVER, // Low Volume Filing
  CHANGE_ADDRESS_RECEIVER = FilingTypes.CHANGE_ADDRESS_RECEIVER, // Low Volume Filing
  APPOINT_LIQUIDATOR = FilingTypes.APPOINT_LIQUIDATOR, // Low Volume Filing
  CEASE_LIQUIDATOR = FilingTypes.CEASE_LIQUIDATOR, // Low Volume Filing
  CHANGE_ADDRESS_LIQUIDATOR = FilingTypes.CHANGE_ADDRESS_LIQUIDATOR, // Low Volume Filing
  INTENT_TO_LIQUIDATE = 'intentToLiquidate', // Low Volume Filing
  LIQUIDATION_REPORT = 'liquidationReport', // Low Volume Filing
  VOLUNTARY_LIQUIDATION = 'voluntaryLiquidation',

  // FUTURE: add these dissolution names as needed
  // DISS_D1A = 'DISS_1_ADMIN',
  // DISS_D1F = 'DISS_1_FILE',
  // DISS_D1T = 'DISS_1_TRANS',
  // DISS_D2A = 'DISS_2_ADMIN',
  // DISS_D2F = 'DISS_2_FILE',
  // DISS_D2T = 'DISS_2_TRANS',
  // DISS_HDA = 'DISS_ADMIN',
  // DISS_HDB = 'DISS_CONVERTED',
  // DISS_HDF = 'DISS_FAIL_FILE',
  // DISS_HDT = 'DISS_FAIL_TRANS',
  // DISS_HDP = 'DISS_LLP_REG',
  // DISS_HDO = 'DISS_OTHER',
  // DISS_HDV = 'DISS_VOLUNTARY',
}
