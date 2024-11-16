<template>
  <div
    v-if="filing.documents?.length > 0"
    class="flex flex-col gap-1"
    data-cy="filing-history-document-list"
  >
    <div class="flex flex-col gap-1.5">
      <div v-for="(document, index) in filing.documents" :key="index">
        <UButton
          :label="document.title"
          variant="ghost"
          leading-icon="i-mdi-file-pdf-outline"
          :disabled="filings.downloadingInProgress || downloadingIndex !== -1 || downloadingAll === true"
          :loading="downloadingIndex === index"
          class="px-4 py-2"
          :data-cy="`download-document-button-${document.title}`"
          @click="downloadOne(document, index)"
        />
      </div>
    </div>

    <div>
      <UButton
        v-if="filing.documents?.length > 2"
        :label="$t('button.filing.common.downloadAll')"
        variant="ghost"
        :disabled="filings.downloadingInProgress || downloadingIndex !== -1 || downloadingAll === true"
        :loading="downloadingAll"
        leading-icon="i-mdi-download"
        class="px-4 py-2 min-w-10"
        data-cy="download-document-button-downloadAll"
        @click="downloadAll()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI, DocumentI } from '#imports'

const filings = useBcrosFilings()

const filing = defineModel('filing', { type: Object as PropType<ApiResponseFilingI>, required: true })

const downloadingIndex = ref(-1)
const downloadingAll = ref(false)

const downloadOne = async (document: DocumentI, index: number) => {
  downloadingIndex.value = index
  filings.downloadingInProgress = true
  await downloadFile(document)
  downloadingIndex.value = -1
  filings.downloadingInProgress = false
}

const downloadAll = async () => {
  downloadingAll.value = true
  filings.downloadingInProgress = true
  for (const document of filing.value.documents) {
    await downloadFile(document)
  }
  downloadingAll.value = false
  filings.downloadingInProgress = false
}
</script>
