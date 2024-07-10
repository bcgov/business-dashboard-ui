<template>
  <div id="bcros-business-details" class="bg-white h-[150px]" data-cy="business-details">
    <div class="grid grid-cols-2 pt-5 text-bcGovGray-900 app-inner-container">
      <div class="col-auto" data-cy="business-details-name">
        <BcrosBusinessDetailsHeader />
        <div class="pt-2">
          <BcrosBusinessDetailsStatus />
        </div>
        <div class="pt-3">
          <BcrosBusinessDetailsLinks :is-staff="true" :current-business="currentBusiness" />
        </div>
      </div>
      <div class="col-auto justify-self-end" data-cy="business-details-info">
        <dl class="text-sm">
          <template v-for="info in businessInfo" :key="info.term">
            <div class="flex mb-1">
              <dt class="font-bold mr-2">
                {{ info.term }}:
              </dt>
              <dd>{{ info.value }}</dd>
            </div>
          </template>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { CorpTypeCd } from '@bcrs-shared-components/enums'
import { useBcrosFilings } from '~/stores/filings'

const route = useRoute()
const t = useNuxtApp().$i18n.t
const business = useBcrosBusiness()
const filings = useBcrosFilings()
const todos = useBcrosTodos()
const { currentBusiness, currentBusinessContact } = storeToRefs(business)

const businessInfo = ref([] as { term: string, value: string }[])

function updateBusinessDetails () {
  const isFirm = [CorpTypeCd.PARTNERSHIP, CorpTypeCd.SOLE_PROP].includes(currentBusiness.value.legalType)
  const identifierLabel = isFirm ? t('label.business.registrationNum') : t('label.business.incorporationNum')
  businessInfo.value = [
    { term: t('label.business.businessNum'), value: currentBusiness.value.taxId || t('text.general.nA') },
    { term: identifierLabel, value: currentBusiness.value.identifier || t('text.general.nA') },
    { term: t('label.general.email'), value: currentBusinessContact.value.email || t('text.general.nA') },
    { term: t('label.general.phone'), value: currentBusinessContact.value.phone || t('text.general.nA') }
  ]
}

watch(currentBusiness, updateBusinessDetails)
watch(currentBusinessContact, updateBusinessDetails)

async function loadComponentData (identifier: string) {
  await business.loadBusiness(identifier)
  await business.loadBusinessContact(identifier)
  filings.loading = true
  await filings.loadFilings(identifier)
  filings.loading = false
  todos.loading = true
  await todos.loadAffiliations(identifier)
  todos.loading = false
}

// watcher required because layouts start rendering before the route is initialized
watch(() => route.params.identifier as string, loadComponentData)
onBeforeMount(() => {
  // onBeforeMount required for refresh case (route will be set already so ^ watcher will not fire)
  if (route.params.identifier) {
    loadComponentData(route.params.identifier as string)
  }
})

</script>
