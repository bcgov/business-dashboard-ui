<template>
  <div class="mt-8 mb-16 flex flex-wrap" data-cy="business-dashboard">
    <div class="w-full md:w-9/12">
      <BcrosSection name="todo">
        <template #header>
          {{ $t('title.section.toDo') }}
        </template>
        TBD
      </BcrosSection>
      <BcrosSection name="filingHistory" class="pt-5">
        <template #header>
          {{ $t('title.section.filingHistory') }}
        </template>
        TBD
      </BcrosSection>
    </div>

    <div class="w-full pt-5 md:w-3/12 md:pl-5 md:pt-0 flex flex-col">
      <BcrosSection v-if="showCustodian" name="custodian">
        <template #header>
          <div class="flex justify-between">
            <span>
              {{ $t('title.section.custodianOfRecords') }}
            </span>
          </div>
        </template>
        <BcrosPartyInfo name="custodian" :role-type="RoleTypeE.CUSTODIAN" :show-email="false" :expand-top-item="true" />
      </BcrosSection>

      <BcrosSection name="address" :class="showCustodian ? 'pt-5' : ''">
        <template #header>
          <div class="flex justify-between">
            <span v-if="currentBusinessAddresses.businessOffice">
              {{ $t('title.section.businessAddresses') }}
            </span>
            <span v-else>
              {{ $t('title.section.officeAddresses') }}
            </span>
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :label="$t('button.general.change')"
              data-cy="address-change-button"
              @click="()=>{
                // TO-DO  confirm the redirect logic
                console.log('clicked!')
              }"
            />
          </div>
        </template>
        <BcrosOfficeAddress name="officeAddresses" :expand-top-item="!showCustodian" />
      </BcrosSection>

      <BcrosSection v-if="hasDirector" name="directors" class="pt-5">
        <template #header>
          <div class="flex justify-between">
            <span>
              {{ $t('title.section.currentDirectors') }}
            </span>
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :label="$t('button.general.change')"
              data-cy="change-button"
              @click="()=>{
                // TO-DO  confirm the redirect logic
                console.log('clicked!')
              }"
            />
          </div>
        </template>
        <BcrosPartyInfo name="directors" :role-type="RoleTypeE.DIRECTOR" :show-email="false" />
      </BcrosSection>

      <BcrosSection v-if="hasPartner" name="partner" class="pt-5">
        <template #header>
          <div class="flex justify-between">
            <span>
              {{ $t('title.section.partners') }}
            </span>
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :label="$t('button.general.change')"
              data-cy="change-button"
              @click="()=>{
                // TO-DO  confirm the redirect logic
                console.log('clicked!')
              }"
            />
          </div>
        </template>
        <BcrosPartyInfo name="partners" :role-type="RoleTypeE.PARTNER" :show-email="true" />
      </BcrosSection>

      <BcrosSection v-if="hasProprietor" name="proprietors" class="pt-5">
        <template #header>
          <div class="flex justify-between">
            <span>
              {{ $t('title.section.proprietors') }}
            </span>
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :label="$t('button.general.change')"
              data-cy="change-button"
              @click="()=>{
                // TO-DO  confirm the redirect logic
                console.log('clicked!')
              }"
            />
          </div>
        </template>
        <BcrosPartyInfo name="proprietors" :role-type="RoleTypeE.PROPRIETOR" :show-email="true" />
      </BcrosSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

const route = useRoute()
const business = useBcrosBusiness()
const { currentBusinessAddresses, currentBusiness } = storeToRefs(business)

const hasDirector = computed(() => {
  if (business.currentParties.parties && business.currentParties.parties.length > 0) {
    return containRole(RoleTypeE.DIRECTOR)
  }
  return false
})

const hasPartner = computed(() => {
  if (business.currentParties.parties && business.currentParties.parties.length > 0) {
    return containRole(RoleTypeE.PARTNER)
  }
  return false
})

const hasProprietor = computed(() => {
  if (business.currentParties.parties && business.currentParties.parties.length > 0) {
    return containRole(RoleTypeE.PROPRIETOR)
  }
  return false
})

const hasCustodian = computed(() => {
  if (business.currentParties.parties && business.currentParties.parties.length > 0) {
    return containRole(RoleTypeE.CUSTODIAN)
  }
  return false
})

const showCustodian = computed(() => {
  return hasCustodian.value && currentBusiness.value.state === BusinessStateE.HISTORICAL
})

// check if the business has a party that has a certain role type
const containRole = (roleType) => {
  return business.currentParties.parties.find(party =>
    party.roles.find(role => role.roleType === roleType && !role.cessationDate)
  )
}
const loadBusinessInfo = () => {
  if (route.params.identifier) {
    business.loadBusinessAddresses(route.params.identifier as string)
    business.loadParties(route.params.identifier as string)
    business.loadBusiness(route.params.identifier as string)
  }
}

onBeforeMount(() => {
  loadBusinessInfo()
})
</script>
