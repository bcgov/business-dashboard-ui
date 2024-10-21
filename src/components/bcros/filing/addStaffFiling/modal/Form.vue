<script lang="ts" setup>
import { z, type RefinementCtx } from 'zod'
import type { FormError } from '#ui/types'
import { FilingTypes } from '@bcrs-shared-components/enums'

const t = useNuxtApp().$i18n.t
const filings = useBcrosFilings()
const business = useBcrosBusiness()
const { currentBusiness, currentBusinessName } = storeToRefs(business)
const emit = defineEmits(['close'])
const prop = defineProps({
  filingType: { type: String as () => FilingTypes, required: true }
})

const staffNotationForm = ref()
const open = ref(true) // N.B. this is always true just to ensure the modal is open
const MAX_FILE_SIZE = 30 // in MB

// error flag (enum) raised from the <BcrosFileUpload> component while uploading a court order file
const fileError: Ref<FileUploadErrorE> = ref()

// boolean indicating if the filing has an error
const filingError = ref(false)

// some text variables for the modal
const label = ref()
const notationText = ref()
const textareaPlaceholder = ref()

// populate the text content based on the filing type
watch(prop.filingType, () => {
  label.value = t('label.filing.staffFilingOptions.' + prop.filingType)

  if (prop.filingType === FilingTypes.PUT_BACK_ON) {
    label.value = 'Correction - ' + t('label.filing.staffFilingOptions.putBackOn')
    notationText.value = 'Enter a detail that will appear on the ledger for this entity:'
    textareaPlaceholder.value = 'Add Detail'
  } else if (prop.filingType === FilingTypes.DISSOLUTION) {
    notationText.value = 'Enter a detail that will appear on the ledger for this entity:'
    textareaPlaceholder.value = 'Add Detail'
  } else {
    notationText.value =
      `Enter a ${t('filing.name.' + prop.filingType)} that will appear on the ledger for this entity:`
    if (prop.filingType === FilingTypes.COURT_ORDER) {
      textareaPlaceholder.value = 'Court Order Text'
    } else {
      textareaPlaceholder.value = t('label.filing.staffFilingOptions.' + prop.filingType)
    }
  }
}, { immediate: true })

const submissionInProgress = ref(false)

// zod schema for the court order file
// N.B. no validation logic here; it just generate error message based on the error flag
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

// zod schema for the court order number
const courtOrderNumberSchema = z.string()
  .optional()
  .refine(
    (value) => {
      return prop.filingType !== FilingTypes.COURT_ORDER || (value !== undefined && value !== '')
    },
    'A Court Order number is required'
  )
  .refine(
    value => !value || !/^\s|[\s]$/g.test(value),
    'Invalid spaces'
  )
  .refine(
    value => !value || (value.length >= 5 && value.length <= 20),
    'Court order number is invalid'
  )

// form schema
const staffNotationSchema = z.object({
  notation: z
    .string()
    .max(2000, 'Maximum characters exceeded.'),
  courtOrderFile: courtOrderFileSchema,
  courtOrderNumber: courtOrderNumberSchema,
  isPlanOfArrangement: z.boolean()
}).superRefine((form: any, ctx: RefinementCtx) => {
  // For non-court-order filing, if the 'isPlanOfArrangement' is checked, the court order number is required.
  if (
    prop.filingType !== FilingTypes.COURT_ORDER &&
    form.isPlanOfArrangement && (!form.courtOrderNumber || form.courtOrderNumber === ''
    )) {
    ctx.addIssue({
      path: ['courtOrderNumber'],
      code: z.ZodIssueCode.custom,
      message: 'A Court Order number is required',
      fatal: true
    })
  }

  // For court order filing, either the notation text or the court order file is required
  // For other filings, the notation text is required
  if (prop.filingType === FilingTypes.COURT_ORDER) {
    if ((!form.notation || form.notation === '') && !form.courtOrderFile) {
      ctx.addIssue({
        path: ['notation'],
        code: z.ZodIssueCode.custom,
        message: 'Enter a Court Order and/or upload filed',
        fatal: true
      })
      ctx.addIssue({
        path: ['courtOrderFile'],
        code: z.ZodIssueCode.custom,
        message: 'Enter a Court Order and/or upload filed',
        fatal: true
      })
    }
  } else if (!form.notation || form.notation === '') {
    let message = ''
    if (prop.filingType === FilingTypes.DISSOLUTION || prop.filingType === FilingTypes.PUT_BACK_ON) {
      message = 'Enter a detailed comment'
    } else {
      message = `Enter a ${t('filing.name.' + prop.filingType)}`
    }
    ctx.addIssue({
      path: ['notation'],
      code: z.ZodIssueCode.custom,
      message,
      fatal: true
    })
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

// validate the schema and set errors if validation fails
const validate = () => {
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

// creating filing parameter object from the form data
const getFilingParams = () => {
  const notation = staffNotation.notation ? staffNotation.notation : ''
  const effectOfOrder = staffNotation.isPlanOfArrangement ? 'planOfArrangement' : ''
  const fileNumber = staffNotation.courtOrderNumber ? staffNotation.courtOrderNumber : ''

  const params: any = {}
  switch (prop.filingType) {
    case FilingTypes.PUT_BACK_ON:
      params.details = notation
      if (staffNotation.courtOrderNumber) {
        params.courtOrder = {
          effectOfOrder,
          fileNumber
        }
      }
      break
    case FilingTypes.DISSOLUTION:
      params.dissolutionType = FilingSubTypeE.DISSOLUTION_ADMINISTRATIVE
      params.dissolutionDate = todayIsoDateString()
      params.details = notation
      if (staffNotation.courtOrderNumber) {
        params.courtOrder = {
          effectOfOrder,
          fileNumber,
          orderDetails: notation
        }
      }
      break
    case FilingTypes.COURT_ORDER:
      params.details = notation
      params.effectOfOrder = effectOfOrder
      params.fileNumber = fileNumber
      params.orderDetails = notation
      if (staffNotation.courtOrderFile) {
        params.fileKey = staffNotation.courtOrderFile.fileKey
        params.fileName = staffNotation.courtOrderFile.fileName
        params.fileLastModified = staffNotation.courtOrderFile.fileLastModified
        params.fileSize = staffNotation.courtOrderFile.fileSize
      }
      break
    case FilingTypes.REGISTRARS_NOTATION:
    case FilingTypes.REGISTRARS_ORDER:
      params.effectOfOrder = effectOfOrder
      params.fileNumber = fileNumber
      params.orderDetails = notation
      break
    default:
      break
  }

  return params
}

// submit the filing; freeze the form while submitting
const submitFiling = async() => {
  submissionInProgress.value = true

  const filingParams = getFilingParams()

  const response = await filings.createFiling(
    currentBusiness.value,
    prop.filingType,
    filingParams
  )

  submissionInProgress.value = false

  if (response.error?.value) {
    filingError.value = true
    console.error(response.error.value)
    return
  }
  filingError.value = false
  business.loadBusiness(currentBusiness.value.identifier, true)
  filings.loadFilings(currentBusiness.value.identifier, true)
  emit('close')
}

// submit the filing upon successful validation
const handleSubmit = () => {
  if (validate()) {
    submitFiling()
  }
}
</script>

<template>
  <UModal v-model="open" prevent-close>
    <UCard
      :ui="{ header: { background: 'bg-bcGovColor-darkBlue', base: 'font-2xl font-bold text-white rounded-t-lg' } }"
    >
      <template #header>
        <span id="dialog-title" class="text-lg">{{ label }}</span>
      </template>

      <div data-cy="modal-body">
        <UForm ref="staffNotationForm" :schema="staffNotationSchema" :state="staffNotation" class="space-y-4">
          <div v-if="filingType === FilingTypes.DISSOLUTION">
            You are about to dissolve
            <strong>{{ currentBusinessName }}, {{ currentBusiness.identifier }}</strong>.
          </div>
          <div v-if="filingType === FilingTypes.PUT_BACK_ON">
            You are about to put
            <strong>{{ currentBusinessName }}, {{ currentBusiness.identifier }}</strong> back on the register.
          </div>
          <div v-if="notationText">
            {{ notationText }}
          </div>

          <UFormGroup
            v-slot="{ error }"
            name="notation"
            class="flex flex-col"
            eager-validation
            :ui="{ error: '-mt-6' }"
          >
            <UTextarea
              v-model="staffNotation.notation"
              :disabled="submissionInProgress"
              :placeholder="textareaPlaceholder"
              :variant="error ? 'error' : 'bcGov'"
              maxlength="2000"
              data-cy="notation"
            />
            <div class="text-right mt-2 mr-1" :class="error ? 'text-red-500' : ''">
              {{ staffNotation.notation ? staffNotation.notation.length : 0 }} / 2000
            </div>
          </UFormGroup>

          <template v-if="filingType === FilingTypes.COURT_ORDER">
            <div>
              AND/OR upload a PDF of the Court Order:
              <ul class="list-disc ml-7 mt-3">
                <li>Use a white background and a legible font with contrasting font colour</li>
                <li>PDF file type (maximum {{ MAX_FILE_SIZE }} MB file size)</li>
              </ul>
            </div>
            <div class="flex">
              <span class="font-bold mt-3 mr-5">Upload File</span>
              <BcrosFileUpload
                v-model="staffNotation.courtOrderFile"
                class="flex-grow"
                :max-size="MAX_FILE_SIZE"
                :page-size="PageSizeE.LETTER_PORTRAIT"
                :disabled="submissionInProgress"
                :get-presigned-url="getPresignedUrl"
                :upload-to-url="uploadToUrl"
                name="courtOrderFile"
                data-cy="court-order-upload"
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
            </div>
          </template>

          <div>
            If this filing is pursuant to a court order, enter the court order number.
            If this filing is pursuant to a plan of arrangement,
            enter the court order number and select Plan of Arrangement.
          </div>
          <UFormGroup v-slot="{ error }" name="courtOrderNumber">
            <UInput
              v-model="staffNotation.courtOrderNumber"
              :disabled="submissionInProgress"
              :ui="{ placeholder: error ? 'placeholder-red-500' : 'placeholder-gray-700' }"
              eager-validation
              placeholder="Court Order Number"
              data-cy="court-order-number"
            />
          </UFormGroup>

          <UFormGroup>
            <UCheckbox
              v-model="staffNotation.isPlanOfArrangement"
              :disabled="submissionInProgress"
              label="This filing is pursuant to a Plan of Arrangement"
              data-cy="plan-of-arrangement"
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
