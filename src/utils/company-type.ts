import { CorpTypeCd } from '@bcrs-shared-components/enums'

/** Whether the entity is a Benefit Company. */
export const isEntityBenefitCompany = (legalType: CorpTypeCd): boolean => {
  return (legalType === CorpTypeCd.BENEFIT_COMPANY)
}

/** Whether the entity is a BC Limited Company. */
export const isEntityBcCompany = (legalType: CorpTypeCd): boolean => {
  return (legalType === CorpTypeCd.BC_COMPANY)
}

/** Whether the entity is a BC Community Contribution Company. */
export const isEntityBcCcc = (legalType: CorpTypeCd): boolean => {
  return (legalType === CorpTypeCd.BC_CCC)
}

/** Whether the entity is a BC Unlimited Liability Company. */
export const isEntityBcUlcCompany = (legalType: CorpTypeCd): boolean => {
  return (legalType === CorpTypeCd.BC_ULC_COMPANY)
}

/** Whether the entity is a Continued In Benefit Company. */
export const isEntityBenContinueIn = (legalType: CorpTypeCd): boolean => {
  return (legalType === CorpTypeCd.BEN_CONTINUE_IN)
}

/** Whether the entity is a Continued In BC Limited Company. */
export const isEntityContinueIn = (legalType: CorpTypeCd): boolean => {
  return (legalType === CorpTypeCd.CONTINUE_IN)
}

/** Whether the entity is a Continued In Community Contribution Company. */
export const isEntityCccContinueIn = (legalType: CorpTypeCd): boolean => {
  return (legalType === CorpTypeCd.CCC_CONTINUE_IN)
}

/** Whether the entity is a Continued In Unlimited Liability Company. */
export const isEntityUlcContinueIn = (legalType: CorpTypeCd): boolean => {
  return (legalType === CorpTypeCd.ULC_CONTINUE_IN)
}

/** Whether the entity is a Cooperative Assocation. */
export const isEntityCoop = (legalType: CorpTypeCd): boolean => {
  return (legalType === CorpTypeCd.COOP)
}

/** Whether the entity is a General Partnership. */
export const isEntityPartnership = (legalType: CorpTypeCd): boolean => {
  return (legalType === CorpTypeCd.PARTNERSHIP)
}

/** Whether the entity is a Sole Proprietorship. */
export const isEntitySoleProp = (legalType: CorpTypeCd): boolean => {
  return (legalType === CorpTypeCd.SOLE_PROP)
}

/** Whether the entity is a Sole Proprietorship or General Partnership. */
export const isEntityFirm = (legalType: CorpTypeCd): boolean => {
  return (isEntitySoleProp(legalType) || isEntityPartnership(legalType))
}

/** Whether the entity is a base company (BC/BEN/CC/ULC or C/CBEN/CCC/CUL). */
export const isBaseCompany = (legalType: CorpTypeCd): boolean => {
  return (
    isEntityBcCompany(legalType) ||
    isEntityBenefitCompany(legalType) ||
    isEntityBcCcc(legalType) ||
    isEntityBcUlcCompany(legalType) ||
    isEntityContinueIn(legalType) ||
    isEntityBenContinueIn(legalType) ||
    isEntityCccContinueIn(legalType) ||
    isEntityUlcContinueIn(legalType)
  )
}

/**
 * Is True for non-BEN corps if FF is disabled.
 * Is False for BENs and other entity types.
 * Used to apply special pre-go-live functionality.
 */
export const isDisableNonBenCorps = (legalType: CorpTypeCd): boolean => {
  // this method needs to be used after nuxt context has spun up
  const { getStoredFlag } = useBcrosLaunchdarkly()
  if (
    isEntityBcCompany(legalType) || isEntityBcCcc(legalType) || isEntityBcUlcCompany(legalType) ||
    isEntityContinueIn(legalType) || isEntityCccContinueIn(legalType) || isEntityUlcContinueIn(legalType)
  ) {
    return !!getStoredFlag('enable-non-ben-corps')
  }
  return false
}
