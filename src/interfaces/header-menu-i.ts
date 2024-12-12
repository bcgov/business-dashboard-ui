export interface HeaderMenuItemI {
  label: string,
  action?: () => any
  args?: any
  icon?: string
  setActive?: boolean
  subLabel?: string
}

export interface HeaderMenuOptionsI {
  header?: string,
  items?: HeaderMenuItemI[]
}
