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
          :disabled="isLoading && !!loadingDocuments.find(doc => doc === document)"
          :loading="isLoading"
          class="px-4 py-2"
          :data-cy="`download-document-button-${document.title}`"
          @click="downloadOne(document)"
        />
      </div>
    </div>

    <div>
      <UButton
        :label="$t('button.filing.common.downloadAll')"
        variant="ghost"
        :disabled="isLoading"
        :loading="isLoading"
        leading-icon="i-mdi-download"
        class="px-4 py-2 min-w-10"
        data-cy="download-document-button-downloadAll"
        @click="downloadAll()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI, DocumentI, FetchDocumentsI } from '#imports'
import { dateToYyyyMmDd, fetchDocuments, saveBlob } from '#imports'

const t = useNuxtApp().$i18n.t
const unknownStr = `[${t('text.general.unknown')}]`

const { hasRoleStaff } = useBcrosKeycloak()

const filing = defineModel('filing', { type: Object as PropType<ApiResponseFilingI>, required: true })

const downloadOne = async (document: DocumentI) => {
  const doc = await fetchDocuments(document.link)
  saveBlob(doc, document.title)
}

const downloadAll = async () => {
  for (const document of filing.value.documents) {
    await downloadOne(document)
  }
}

const loadingDocuments = ref([] as DocumentI[])
const isLoading = computed(() => loadingDocuments.value.length !== 0)

const pushDocument = (title: string, filename: string, link: string) => {
  if (title && filename && link) {
    filing.value.documents.push({ title, filename, link } as DocumentI)
  } else {
    // eslint-disable-next-line no-console
    console.log(`invalid document = ${title} | ${filename} | ${link}`)
  }
}

const { currentBusinessIdentifier } = storeToRefs(useBcrosBusiness())

/**
 * Converts a string in "camelCase" (or "PascalCase") to a string of separate, title-case words,
 * suitable for a title or proper name.
 * @param s the string to convert
 * @returns the converted string
 */
const camelCaseToWords = (s: string): string => {
  const words = s?.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase()) || ''
  // SPECIAL CASE: convert 'Agm' to uppercase
  return words.replace('Agm', 'AGM')
}

const loadDocumentList = async () => {
  if (!filing.value.documents && filing.value.documentsLink) {
    // eslint-disable-next-line no-console
    console.log('loading filing documents for: ', filing.value.documentsLink)
    // todo: add global UI loader start and end #22059
    try {
      filing.value.documents = []
      const documentListObj = await fetchDocumentList(filing.value.documentsLink)
      const fetchedDocuments: FetchDocumentsI = documentListObj.documents || {}

      for (const groupName in fetchedDocuments) {
        if (groupName === 'legalFilings' && Array.isArray(fetchedDocuments.legalFilings)) {
          // iterate over legalFilings array
          for (const legalFilings of fetchedDocuments.legalFilings) {
            // iterate over legalFilings properties
            for (const legalFiling in legalFilings) {
              // this is a legal filing output
              let title: string
              // use display name for primary document's title
              if (legalFiling === filing.value.name) {
                title = filing.value.displayName
              } else {
                title = t(`filing.name.${legalFiling}`)
                if (title === `filing.name.${legalFiling}`) {
                  title = camelCaseToWords(legalFiling)
                }
              }
              const date = dateToYyyyMmDd(new Date(filing.value.submittedDate))
              const filename = `${currentBusinessIdentifier} ${title} - ${date}.pdf`
              const link = legalFilings[legalFiling]
              pushDocument(title, filename, link)
            }
          }
        } else if (groupName === 'staticDocuments' && Array.isArray(fetchedDocuments.staticDocuments)) {
          // iterate over staticDocuments array
          for (const document of fetchedDocuments.staticDocuments) {
            const title = document.name
            const filename = title
            const link = document.url
            pushDocument(title, filename, link)
          }
        } else if (groupName === 'uploadedCourtOrder') {
          const fileNumber = filing.value.data?.order?.fileNumber || unknownStr
          const title = hasRoleStaff ? `${filing.value.displayName} ${fileNumber}` : `${filing.value.displayName}`
          const filename = title
          const link = fetchedDocuments[groupName] as string
          pushDocument(title, filename, link)
        } else {
          // this is a submission level output
          const title = camelCaseToWords(groupName)
          const date = dateToYyyyMmDd(new Date(filing.value.submittedDate))
          const filename = `${currentBusinessIdentifier} ${title} - ${date}.pdf`
          const link = fetchedDocuments[groupName] as string
          pushDocument(title, filename, link)
        }
      }
    } catch (error) {
      // set property to null to retry next time
      filing.value.documents = null
      // eslint-disable-next-line no-console
      console.log('loadDocuments() error =', error)
      // FUTURE: enable some error dialog?
    }
  }
}

if (filing.value.documents === undefined && filing.value.documentsLink) {
  loadDocumentList()
}
</script>
