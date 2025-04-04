<script setup lang="ts">
const route = useRoute()
const t = useNuxtApp().$i18n.t
const business = useBcrosBusiness()
const { currentBusiness, currentBusinessContact, currentBusinessIdentifier, isFirm } = storeToRefs(business)
const bootstrap = useBcrosBusinessBootstrap()
const { goToBusinessProfilePage } = useBcrosNavigate()
const { bootstrapFiling, bootstrapNrNumber } = storeToRefs(bootstrap)

const registrationDate = computed(() => {
  if (currentBusiness.value && isFirm.value) {
    return (dateToPacificDate(apiToDate(currentBusiness.value.foundingDate), true) || t('text.general.nA'))
  }
  return null
})

const businessInfo = ref([] as {
  term: string, // label text in the UI
  name: string, // for data-cy
  value: string,
  show: boolean, // whether this info should be displayed
  hasChangeButton?: boolean,
  showChangeButton?: boolean
}[])

const updateBusinessDetails = () => {
  businessInfo.value = []
  if (currentBusinessIdentifier.value) {
    businessInfo.value = [
      {
        term: t('label.business.registrationDate'),
        name: 'registration-date',
        show: !!registrationDate.value, // add registration date if it exists
        value: registrationDate.value
      },
      {
        term: t('label.business.registrationNum'),
        name: 'registration-number',
        show: isFirm.value, // only SP and GP businesses have registration numbers
        value: currentBusiness.value.identifier || t('text.general.nA')
      },
      {
        term: t('label.business.businessNum'),
        name: 'business-number',
        show: true,
        value: currentBusiness.value.taxId || t('text.general.nA')
      },
      {
        term: t('label.business.incorporationNum'),
        name: 'incorporation-number',
        show: !isFirm.value, // non SP/GP businesses have incorporation numbers
        value: currentBusiness.value.identifier || t('text.general.nA')
      },
      {
        term: t('label.general.email'),
        name: 'email',
        show: true,
        value: currentBusinessContact.value.email || t('text.general.nA'),
        hasChangeButton: !business.isDisableNonBenCorps(),
        showChangeButton: false
      },
      {
        term: t('label.general.phone'),
        name: 'phone',
        show: true,
        value: currentBusinessContact.value.phone || t('text.general.nA'),
        hasChangeButton: !business.isDisableNonBenCorps(),
        showChangeButton: false
      }
    ]
  } else if (bootstrapNrNumber.value) {
    businessInfo.value = [{ term: 'Name Request', name: 'name-request', show: true, value: bootstrapNrNumber.value }]
  }
}

watch(bootstrapFiling, updateBusinessDetails)
watch(currentBusiness, updateBusinessDetails)
watch(currentBusinessContact, updateBusinessDetails)

/** Load in the business data required for this layout. */
async function loadComponentData (identifier: string) {
  if (bootstrap.checkIsTempReg(identifier)) {
    // this is a business bootstrap (actual business does not exist yet)
    bootstrap.loadBusinessBootstrap(identifier)
  } else {
    await business.loadBusiness(identifier)
    await business.loadBusinessContact(identifier)
  }
}

// watcher required because layouts start rendering before the route is initialized
watch(() => route.params.identifier as string, loadComponentData, { immediate: true })

</script>

<template>
  <div
    id="bcros-business-details"
    class="flex gap-5 bg-white w-full pt-7 px-3 justify-center"
    data-cy="business-details"
  >
    <div class="flex flex-wrap pt-5 text-bcGovGray-900 grow max-w-bcros">
      <div data-cy="business-details-name" class="grow md:w-3/4 w-full p-3">
        <BcrosBusinessDetailsHeader />
        <div class="pt-2">
          <BcrosBusinessDetailsStatus />
        </div>
        <div class="pt-3">
          <BcrosBusinessDetailsLinks :is-staff="true" :current-business="currentBusiness" />
        </div>
      </div>
      <div class="md:w-1/4 w-full p-3" data-cy="business-details-info">
        <dl class="text-sm">
          <template v-for="info in businessInfo" :key="info.name">
            <div v-if="info.show" class="flex flex-wrap gap-0 mb-1 items-center">
              <dt class="font-bold mr-2">
                {{ info.term }}:
              </dt>
              <dd v-if="!info.hasChangeButton">
                {{ info.value }}
              </dd>
              <dd
                v-else
                class="items-center cursor-pointer"
                :data-cy="'value-' + info.name"
                @mouseenter="info.showChangeButton = true"
                @mouseleave="info.showChangeButton = false"
                @click="goToBusinessProfilePage"
              >
                <span class="break-normal">{{ info.value }}</span>
                <UButton
                  v-show="info.showChangeButton"
                  class="ml-1 text-sm"
                  size="2xs"
                  variant="ghost"
                  icon="i-mdi-pencil"
                  :label="$t('button.general.change')"
                  :data-cy="'change-button-' + info.name"
                />
              </dd>
            </div>
          </template>
        </dl>
      </div>
    </div>
  </div>
</template>
