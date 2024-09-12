<script setup lang="ts">
const route = useRoute()
const t = useNuxtApp().$i18n.t
const business = useBcrosBusiness()
const { currentBusiness, currentBusinessContact, currentBusinessIdentifier, isFirm } = storeToRefs(business)
const bootstrap = useBcrosBusinessBootstrap()
const { bootstrapFiling, bootstrapNrNumber } = storeToRefs(bootstrap)

const businessInfo = ref([] as { term: string, value: string }[])
const updateBusinessDetails = () => {
  businessInfo.value = []
  if (currentBusinessIdentifier.value) {
    const identifierLabel = isFirm.value ? t('label.business.registrationNum') : t('label.business.incorporationNum')
    businessInfo.value = [
      { term: t('label.business.businessNum'), value: currentBusiness.value.taxId || t('text.general.nA') },
      { term: identifierLabel, value: currentBusiness.value.identifier || t('text.general.nA') },
      { term: t('label.general.email'), value: currentBusinessContact.value.email || t('text.general.nA') },
      { term: t('label.general.phone'), value: currentBusinessContact.value.phone || t('text.general.nA') }
    ]
  } else if (bootstrapNrNumber.value) {
    businessInfo.value = [{ term: 'Name Request', value: bootstrapNrNumber.value }]
  }
}

watch(bootstrapFiling, updateBusinessDetails)
watch(currentBusiness, updateBusinessDetails)
watch(currentBusinessContact, updateBusinessDetails)

/** Load in the business data required for this layout. */
async function loadComponentData (identifier: string) {
  if (bootstrap.checkIsTempReg(identifier)) {
    // this is a business bootstrap (actual business does not exist yet)
    await bootstrap.loadBusinessBootstrap(identifier)
  } else {
    await business.loadBusiness(identifier)
    await business.loadBusinessContact(identifier)
  }
}

// watcher required because layouts start rendering before the route is initialized
watch(() => route.params.identifier as string, loadComponentData, { immediate: true })

</script>

<template>
  <div id="bcros-business-details" class="bg-white h-[150px]" data-cy="business-details">
    <div class="flex pt-5 text-bcGovGray-900 app-inner-container">
      <div class="grow" data-cy="business-details-name">
        <BcrosBusinessDetailsHeader />
        <div class="pt-2">
          <BcrosBusinessDetailsStatus />
        </div>
        <div class="pt-3">
          <BcrosBusinessDetailsLinks :is-staff="true" :current-business="currentBusiness" />
        </div>
      </div>
      <div class="justify-self-end" data-cy="business-details-info">
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
