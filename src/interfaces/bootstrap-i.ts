export interface BootstrapFilingDataI {
  nameRequest?: NameRequestFilingI
}

export interface BootstrapFilingI extends FilingI {
  amalgamationApplication?: AmalgamationApplicationI
  continuationIn?: BootstrapFilingDataI
  incorporationApplication?: BootstrapFilingDataI
  registration?: BootstrapFilingDataI
}
