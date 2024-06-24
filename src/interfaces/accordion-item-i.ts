import type { AccordionItem } from '#ui/types'

export interface BcrosAccordionItem extends AccordionItem {
  showAddressIcons: boolean,
  showAvatar: boolean,
  showEmail: boolean,
  address: deliveryAndMailingAddressI,
  email?: string
}
