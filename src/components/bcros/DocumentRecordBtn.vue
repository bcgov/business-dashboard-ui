<script setup lang="ts">
const documentId = defineModel('documentId', { type: String, required: true })
const openDocumentRecord = (documentId: string) => {
  const url = `${useRuntimeConfig().public.documentsURL}/document-records/${documentId}`
  window.open(url, '_blank')
}
</script>
<template>
  <UButton
    :label="$t('button.filing.common.manageDocumentRecord') + ' ' + documentId"
    variant="ghost"
    class="px-4 py-2"
    :data-cy="`document-record-btn-${documentId}`"
    @click="openDocumentRecord(documentId)"
  >
    <template #trailing>
      <UIcon name="i-mdi-open-in-new" class="w-4 h-4" />
    </template>
  </UButton>
</template>
