<script lang="ts" setup>
import { z, type RefinementCtx } from 'zod'
import type { FormError } from '#ui/types'

import { FilingTypes } from '@bcrs-shared-components/enums'

const t = useNuxtApp().$i18n.t
const filings = useBcrosFilings()
const business = useBcrosBusiness()
const { currentBusiness } = storeToRefs(business)
const emit = defineEmits(['close'])
const prop = defineProps({
  filingType: { type: String as () => FilingTypes, required: true }
})

const staffNotationForm = ref()
const open = ref(true)

const MAX_FILE_SIZE = 30 // in MB

const fileError: Ref<FileUploadErrorE> = ref()

const label = computed(() => {
  switch (prop.filingType) {
    case FilingTypes.REGISTRARS_NOTATION:
      return t('label.filing.staffFilingOptions.registrarsNotation')
    case FilingTypes.REGISTRARS_ORDER:
      return t('label.filing.staffFilingOptions.registrarsOrder')
    case FilingTypes.COURT_ORDER:
      return t('label.filing.staffFilingOptions.courtOrder')
    case FilingTypes.DISSOLUTION:
      return t('label.filing.staffFilingOptions.adminDissolution')
    case FilingTypes.PUT_BACK_ON:
      return t('label.filing.staffFilingOptions.putBackOn')
    default:
      return ''
  }
})

const submitFiling = async() => {
  // submissionInProgress.value = true
  // const response = await filings.createFiling(currentBusiness.value)
  // submissionInProgress.value = false
  // if (response.error?.value) {
  //   console.error(response.error.value)
  //   filingError.value = true
  //   return
  // }
  // filingError.value = false
  // business.loadBusiness(currentBusiness.value.identifier, true)
  // filings.loadFilings(currentBusiness.value.identifier, true)
  // emit('close')
}

const submissionInProgress = ref(false)
const filingError = ref(false)

const courtOrderFileSchema = z.object({
  fileKey: z.string().optional(),
  fileName: z.string().optional(),
  fileLastModified: z.number().optional(),
  fileSize: z.number().optional()
}).optional()
  .refine(
    () => prop.filingType !== FilingTypes.COURT_ORDER || fileError.value !== FileUploadErrorE.MAX_SIZE_EXCEEDED,
    `Exceeds maximum ${MAX_FILE_SIZE} MB file size`
  )
  .refine(
    () => prop.filingType !== FilingTypes.COURT_ORDER || fileError.value !== FileUploadErrorE.INVALID_TYPE,
    'Invalid PDF'
  )
  .refine(
    () => prop.filingType !== FilingTypes.COURT_ORDER || fileError.value !== FileUploadErrorE.ENCRYPTED,
    'File must be unencrypted'
  )
  .refine(
    () => prop.filingType !== FilingTypes.COURT_ORDER || fileError.value !== FileUploadErrorE.LOCKED,
    'File content cannot be locked'
  )
  .refine(
    () => prop.filingType !== FilingTypes.COURT_ORDER || fileError.value !== FileUploadErrorE.INVALID_PAGE_SIZE,
    PAGE_SIZE_DICT[PageSizeE.LETTER_PORTRAIT].validationErrorMsg
  )
  .refine(
    () => prop.filingType !== FilingTypes.COURT_ORDER || fileError.value !== FileUploadErrorE.UPLOAD_FAILED,
    'An error occurred while uploading. Please try again.'
  )
  .refine((value) => {
    return (prop.filingType !== FilingTypes.COURT_ORDER || value)
  }, 'Court order file is required')

const courtOrderNumberSchema = z.string()
  .optional()
  .refine(
    (value) => {
      return prop.filingType !== FilingTypes.COURT_ORDER || (value !== undefined && value !== '')
    },
    'Court order number is required'
  )
  .refine(
    value => !value || !/^\s|[\s]$/g.test(value),
    'Invalid spaces'
  )
  .refine(
    value => !value || (value.length >= 5 && value.length <= 20),
    'Court order number is invalid'
  )

const staffNotationSchema = z.object({
  notation: z
    .string()
    .min(1, `Enter a ${t('filing.name.' + prop.filingType)}`)
    .max(2000, 'Maximum characters exceeded.'),
  courtOrderFile: courtOrderFileSchema,
  courtOrderNumber: courtOrderNumberSchema,
  isPlanOfArrangement: z.boolean()
}).superRefine((form: any, ctx: RefinementCtx) => {
  if (
    prop.filingType !== FilingTypes.COURT_ORDER &&
    form.isPlanOfArrangement && (!form.courtOrderNumber || form.courtOrderNumber === ''
    )) {
    ctx.addIssue({
      path: ['courtOrderNumber'],
      code: z.ZodIssueCode.custom,
      message: 'Court Order Number is required when filing pursuant to a Plan of Arrangement',
      fatal: true
    })
    return z.NEVER
  }
  return z.NEVER
})

type StaffNotation = z.infer<typeof staffNotationSchema>

const staffNotation: StaffNotation = reactive({
  notation: '',
  courtOrderFile: undefined,
  courtOrderNumber: undefined,
  isPlanOfArrangement: false
})

const validate = () => {
  // validate the schema
  let errors: FormError[] = []
  const res = staffNotationSchema.safeParse(staffNotation)
  if (!res.success) {
    errors = res.error.issues.map(issue => ({ message: issue.message, path: issue.path.join('.') }))
    console.error(errors)
    staffNotationForm.value.setErrors(errors)
    return false
  }
  return true
}

const handleSubmit = () => {
  if (validate()) {
    submitFiling()
  }
}

</script>

<template>
  <UModal v-model="open" prevent-close>
    {{ staffNotation }}<br /><br/>
    {{ staffNotationForm }}<br /><br/>
    {{ filingType }}<br /><br/>
    <UCard
      :ui="{ header: { background: 'bg-bcGovColor-darkBlue', base: 'font-2xl font-bold text-white rounded-t-lg' } }"
    >
      <template #header>
        <span id="dialog-title" class="text-lg">{{ label }}</span>
      </template>

      <div data-cy="modal-body">
        <UForm ref="staffNotationForm" :schema="staffNotationSchema" :state="staffNotation" class="space-y-4">
          <template v-if="filingType === FilingTypes.PUT_BACK_ON">
            <div>
              You are about to put {{ currentBusiness.legalName }}, {{ currentBusiness.identifier }} back on the register.
            </div>
            <div>
              Enter a detail that will appear on the ledger for this entity:
            </div>
          </template>
          <template v-else-if="filingType === FilingTypes.DISSOLUTION">
            <div>
              You are about to dissolve {{ currentBusiness.legalName }}, {{ currentBusiness.identifier }}.
            </div>
            <div>
              Enter a detail that will appear on the ledger for this entity:
            </div>
          </template>
          <div v-else>
            Enter a {{ $t(`filing.name.${filingType}`) }} that will appear on the ledger for this entity:
          </div>

          <UFormGroup name="notation">
            <UTextarea
              v-model="staffNotation.notation"
              :disabled="submissionInProgress"
              :placeholder="`Add detailsssss:`"
              maxlength="2000"
            />
          </UFormGroup>

          <template v-if="filingType === FilingTypes.COURT_ORDER">
            <div>
              AND/OR upload a PDF of the Court Order:
              <ul class="list-disc ml-7 mt-3">
                <li>Use a white background and a legible font with contrasting font colour</li>
                <li>PDF file type (maximum {{ MAX_FILE_SIZE }} MB file size)</li>
              </ul>
            </div>
            <BcrosFileUpload
              v-model="staffNotation.courtOrderFile"
              :max-size="MAX_FILE_SIZE"
              :page-size="PageSizeE.LETTER_PORTRAIT"
              :disabled="submissionInProgress"
              :get-presigned-url="getPresignedUrl"
              :upload-to-url="uploadToUrl"
              @set-error="(error) => {
                fileError = error
                validate()
              }"
              @clear-selection="() => {
                staffNotation.courtOrderFile = undefined
                fileError = undefined
                validate()
              }"
            />
          </template>

          <div>If this filing is pursuant to a court order, enter the court order number. If this filing is pursuant to a plan of arrangement, enter the court order number and select Plan of Arrangement.</div>
          <UFormGroup name="courtOrderNumber">
            <UInput
              v-model="staffNotation.courtOrderNumber"
              :disabled="submissionInProgress"
              eager-validation
              placeholder="Enter Court Order Number"
            />
          </UFormGroup>

          <UFormGroup>
            <UCheckbox
              v-model="staffNotation.isPlanOfArrangement"
              :disabled="submissionInProgress"
              label="This filing is pursuant to a Plan of Arrangement"
            />
          </UFormGroup>
        </UForm>
      </div>

      <template #footer>
        <div class="float-right space-x-3 mb-3">
          <UButton
            variant="ghost"
            :disabled="submissionInProgress"
            class="font-bold"
            :class="{
              'text-red-500': filingError
            }"
            data-cy="submit-add-staff-filing-modal"
            @click="handleSubmit"
          >
            {{ $t('button.dialog.save') }}
          </UButton>
          <UButton
            variant="ghost"
            :disabled="submissionInProgress"
            data-cy="cancel-add-staff-filing-modal"
            @click.prevent="emit('close')"
          >
            {{ $t('button.dialog.cancel') }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
