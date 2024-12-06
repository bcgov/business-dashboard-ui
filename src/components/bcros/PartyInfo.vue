<template>
  <BcrosAccordion
    :name="name"
    :items="partyItems"
    :disabled="disableExpand"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

const business = useBcrosBusiness()
const bootstrap = useBcrosBusinessBootstrap()
const { currentParties } = storeToRefs(business)
const { bootstrapFiling } = storeToRefs(bootstrap)

const props = defineProps({
  name: { type: String, required: true },
  roleType: { type: String, required: true },
  showEmail: { type: Boolean, required: true },
  expandTopItem: { type: Boolean, default: false },
  showAddress: { type: Boolean, default: true }
})

const disableExpand = computed(() => {
  return !currentParties?.value?.parties && !!bootstrapFiling?.value?.filing?.incorporationApplication?.parties
})

const partyItems = computed(() => {
  const items: BcrosAccordionItem[] = []
  const parties = currentParties?.value?.parties || bootstrapFiling?.value?.filing?.incorporationApplication?.parties
  const disabled = !currentParties?.value?.parties &&
    !!bootstrapFiling?.value?.filing?.incorporationApplication?.parties
  if (parties) {
    parties.forEach((party) => {
      if (party.roles.find(role => role.roleType === props.roleType && !role.cessationDate)) {
        items.push({
          label: getName(party),
          disabled,
          defaultOpen: false,
          showAddressIcons: false,
          showAvatar: true,
          showEmail: props.showEmail,
          address: {
            deliveryAddress: party.deliveryAddress,
            mailingAddress: party.mailingAddress
          },
          email: party.officer.email
        })
        if (!props.showAddress) {
          delete items[items.length - 1].address
        }
      }
    })
  }

  if (items.length > 0 && props.expandTopItem) {
    items[0].defaultOpen = true
  }

  return items
})

/** get the name of the Officer associated with a PartyI
 *  - build the full name if the partyType is 'person'
 *  - return the organizationName field if the partyType is 'organization'
 */
const getName = (party: PartyI): string => {
  let name = ''

  if (party.officer.firstName) {
    name = party.officer.firstName
    if (party.officer.middleInitial) {
      name += ` ${party.officer.middleInitial}`
    }
    name += ` ${party.officer.lastName}`
  }

  if (party.officer.organizationName) {
    name = party.officer.organizationName
  }

  return name
}
</script>
