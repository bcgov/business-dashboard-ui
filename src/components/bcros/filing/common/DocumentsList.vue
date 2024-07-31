<template>
  12311 - document list
  <div class="flex flex-col gap-1" data-cy="filing-history-document-list">
    <UButton
      v-for="document in filing.documents"
      :label="document.title"
      variant="ghost"
      @click="downloadOne(document)"
      leading-icon="i-mdi-file-pdf-outline"
      :disabled="isLoading && !!loadingDocuments.find(doc => doc === document)"
      :loading="isLoading"
      class="px-4 py-2 min-w-10 resize-x"
    />

    <UButton
      :label="$t('button.filing.common.downloadAll')"
      variant="ghost"
      @click="downloadAll()"
      :disabled="isLoading"
      :loading="isLoading"
      leading-icon="i-mdi-download"
      class="px-4 py-2 min-w-10"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI, DocumentI, FetchDocumentsI } from '#imports'
import { dateToYyyyMmDd, fetchDocuments, saveBlob } from '#imports'

const t = useNuxtApp().$i18n.t

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const downloadOne = async (document: DocumentI) => {
  const doc = await fetchDocuments(document.link)
  saveBlob(doc, document.title)
}

const downloadAll = async () => {
  for (const document of props.filing.documents) {
    await downloadOne(document)
  }
}

const loadingDocuments = ref([] as DocumentI[])
const isLoading = computed(() => loadingDocuments.value.length !== 0)

const pushDocument = (title: string, filename: string, link: string) => {
  if (title && filename && link) {
    props.filing.documents.push({ title, filename, link } as DocumentI)
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
  if (!props.filing.documents && props.filing.documentsLink) {
    console.log('loading filing documents', props.filing.documentsLink)
    // todo: add global UI loader start and end #22059
    try {
      props.filing.documents = []
      const documentListObj = await fetchDocumentList(props.filing.documentsLink)
      const documentList = documentListObj.documents || []

      for (const groupName in documentList) {
        if (groupName === 'legalFilings' && Array.isArray(documentList.legalFilings)) {
          // iterate over legalFilings array
          for (const legalFilings of documentList.legalFilings) {
            // iterate over legalFilings properties
            for (const legalFiling in legalFilings) {
              // this is a legal filing output
              let title: string
              // use display name for primary document's title
              if (legalFiling === props.filing.name) {
                title = props.filing.displayName
              } else {

                title = t(`filing.name.${legalFiling}`)
                if (title === `filing.name.${legalFiling}`) {
                  title = camelCaseToWords(legalFiling)
                }
              }

              const date = dateToYyyyMmDd(new Date(props.filing.submittedDate))
              const filename = `${currentBusinessIdentifier} ${title} - ${date}.pdf`
              const link = legalFilings[legalFiling]
              pushDocument(title, filename, link)
            }
          }
        } else if (groupName === 'staticDocuments' && Array.isArray(documentList.staticDocuments)) {
          // iterate over staticDocuments array
          for (const document of documentList.staticDocuments) {
            const title = document.name
            const filename = title
            const link = document.url
            pushDocument(title, filename, link)
          }
        } else if (groupName === 'uploadedCourtOrder') {
          // const fileNumber = props.filing.data?.order?.fileNumber || '[unknown]'
          // const title = isStaff ? `${filing.displayName} ${fileNumber}` : `${filing.displayName}`
          const title = `${props.filing.displayName}`
          const filename = title
          const link = documentList[groupName] as string
          pushDocument(title, filename, link)
        } else {
          // this is a submission level output
          const title = camelCaseToWords(groupName)
          const date = dateToYyyyMmDd(new Date(props.filing.submittedDate))
          const filename = `${currentBusinessIdentifier} ${title} - ${date}.pdf`
          const link = documentList[groupName] as string
          pushDocument(title, filename, link)
        }
      }

    } catch (error) {
      // set property to null to retry next time
      props.filing.documents = null
      // eslint-disable-next-line no-console
      console.log('loadDocuments() error =', error)
      // FUTURE: enable some error dialog?
    }
  }
}

if (props.filing.documents === undefined && props.filing.documentsLink) {
  loadDocumentList()
}
</script>
