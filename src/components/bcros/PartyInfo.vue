<template>
  <BcrosAccordion
    :name="name"
    :items="partyItems"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

const business = useBcrosBusiness()
const { currentParties } = storeToRefs(business)

const props = defineProps({
  name: { type: String, required: true },
  roleType: { type: String, required: true },
  showEmail: { type: Boolean, required: true }
})

const partyItems = computed(() => {
  const items: BcrosAccordionItem[] = []

  if (currentParties.value.parties) {
    currentParties.value.parties.forEach((party) => {
      if (party.roles.find(role => role.roleType === props.roleType && !role.cessationDate)) {
        items.push({
          label: getName(party),
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
      }
    })
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
