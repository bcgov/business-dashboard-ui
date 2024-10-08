<script lang="ts" setup>
import type { courtOrderFileT } from '~/types/create-filing'

// const t = useNuxtApp().$i18n.t
const { kcUserKeycloakGuid } = storeToRefs(useBcrosKeycloak())

const props = defineProps({
  name: { type: String, required: true },
  modelValue: { type: Object as () => courtOrderFileT, required: true },
  maxSize: { type: Number, default: 0 },
  pageSize: { type: String as () => PageSizeE, default: null },
  disabled: { type: Boolean, default: false },
  getPresignedUrl: { type: Function, required: true },
  uploadToUrl: { type: Function, required: true }
})

const emit = defineEmits(['set-error', 'clear-selection', 'update:modelValue'])

const fileUploadingMessage = ref(null)
const filePath = ref('')

const handleFileSelection = async (files: FileList) => {
  if (!files || files.length === 0) {
    emit('clear-selection')
    return
  }

  const file: File = files[0]

  // update the status message
  fileUploadingMessage.value = 'Processing...'

  const fileIsValid = await validateFile(file)
  if (!fileIsValid) {
    return
  }

  fileUploadingMessage.value = 'Uploading...'

  const fileKey = await uploadFile(file)
  // const fileKey = '2222'

  if (!fileKey) {
    return
  }

  const newFileInfo: courtOrderFileT = {
    fileKey,
    fileName: file.name,
    fileLastModified: file.lastModified,
    fileSize: file.size
  }

  // Emit the updated file to the parent
  emit('update:modelValue', newFileInfo)

  fileUploadingMessage.value = undefined

  emit('set-error', undefined)
}

const validateFile = async (file: File): Promise<boolean> => {
  if (typeof file.arrayBuffer === 'undefined') { return true }

  // verity file size
  if (props.maxSize && file?.size > props.maxSize * 1024 * 1024) {
    emit('set-error', FileUploadErrorE.MAX_SIZE_EXCEEDED)
    return false
  }

  // try to retrieve file info
  const fileInfo = await retrieveFileInfo(file).catch(() => null as PdfInfoI)
  if (fileInfo === null) {
    console.error('Error: failed to retrieve file info')
    emit('set-error', FileUploadErrorE.INVALID_TYPE)
    return false
  }

  // verify encryption
  if (fileInfo.isEncrypted) {
    console.error('Error: file is encrypted')
    emit('set-error', FileUploadErrorE.ENCRYPTED)
    return false
  }

  // verify content lock
  if (fileInfo.isContentLocked) {
    console.error('Error: file content is locked')
    emit('set-error', FileUploadErrorE.LOCKED)
    return false
  }

  // verify page sizes
  if (props.pageSize) {
    const valid = await isPageSize(file, props.pageSize).catch(() => null as boolean)
    if (valid === null) {
      console.error('Error: failed to check page size')
      emit('set-error', FileUploadErrorE.INVALID_TYPE)
      return false
    }

    if (!valid) {
      console.error('Error: invalid page size')
      emit('set-error', FileUploadErrorE.INVALID_PAGE_SIZE)
      return false
    }
  }

  return true
}

const uploadFile = async (file: File): Promise<string | null> => {
  try {
    const preSignedUrl = await props.getPresignedUrl(file.name)

    const response = await props.uploadToUrl(
      preSignedUrl.preSignedUrl, file, preSignedUrl.key, kcUserKeycloakGuid.value
    )

    if (response?.status === 200) {
      return preSignedUrl.key
    } else {
      emit('set-error', FileUploadErrorE.UPLOAD_FAILED)
      return null
    }
  } catch (err) {
    emit('set-error', FileUploadErrorE.UPLOAD_FAILED)
    return null
  }
}
</script>

<template>
  <UFormGroup
    v-slot="{ error }"
    :name="name"
    :help="fileUploadingMessage"
    :ui="{ help: 'ml-9', error: 'ml-9' }"
  >
    <div class="flex items-center space-x-2 cursor-pointer">
      <UIcon name="i-mdi-paperclip" class="text-3xl" :class="error ? 'text-red-500' : ''" />
      <UInput
        v-model="filePath"
        :disabled="props.disabled"
        accept=".pdf"
        class="flex-grow mt-3 text-gray-200 w-full"
        content="text-gray-700"
        type="file"
        @change="handleFileSelection"
      />
    </div>
  </UFormGroup>
</template>
