<script lang="ts" setup>
const t = useNuxtApp().$i18n.t
const filings = useBcrosFilings()
const business = useBcrosBusiness()
const { currentBusiness } = storeToRefs(business)
const emit = defineEmits(['close'])

const open = ref(true)

const label = currentBusiness?.value.adminFreeze ? t('filing.name.adminUnfreeze') : t('filing.name.adminFreeze')
const freezeOrUnfreeze = currentBusiness?.value.adminFreeze ? t('filing.freeze.messageUn') : t('filing.freeze.message')

const submitFiling = async() => {
  submissionInProgress.value = true
  const response = await filings.createFreezeFiling(currentBusiness.value)
  submissionInProgress.value = false
  if (response.error?.value) {
    console.error(response.error.value)
    filingError.value = true
    return
  }
  filingError.value = false
  business.loadBusiness(currentBusiness.value.identifier, true)
  filings.loadFilings(currentBusiness.value.identifier, true)
  emit('close')
}

const submissionInProgress = ref(false)
const filingError = ref(false)
</script>

<template>
  <UModal v-model="open">
    <UCard
      :ui="{ header: { background: 'bg-bcGovColor-darkBlue', base: 'font-2xl font-bold text-white rounded-t-lg' } }"
    >
      <template #header>
        <span id="dialog-title">{{ label }}</span>
      </template>
      <div data-cy="modal-body">
        {{ `${freezeOrUnfreeze} ${currentBusiness.legalName}, ${currentBusiness.identifier},` }}
        {{ t('filing.freeze.message2') }}
      </div>
      <template #footer>
        <div class="float-right space-x-3">
          <UButton
            variant="ghost"
            :disabled="submissionInProgress"
            class="font-bold"
            :class="{
              'text-red-500': filingError
            }"
            data-cy="submit-add-staff-filing-modal"
            @click="submitFiling"
          >
            {{ $t('button.dialog.file') }}
          </UButton>
          <UButton
            variant="ghost"
            :disabled="submissionInProgress"
            data-cy="cancel-add-staff-filing-modal"
            @click="$emit('close')"
          >
            {{ $t('button.dialog.cancel') }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
