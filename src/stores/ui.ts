/** Manages bcros account data */
export const useBcrosDashboardUi = defineStore('bcros/dashboardUi', () => {
  const uiIsLoading = ref([])

  const trackUiLoadingStart = (trackingUuid: string) => {
    uiIsLoading.value.push(trackingUuid)
  }

  const trackUiLoadingStop = (trackerUuidDone: string) => {
    const index = uiIsLoading.value.findIndex(tracker => tracker === trackerUuidDone)
    if (index !== -1) {
      uiIsLoading.value.splice(index, 1)
    }
  }

  const dashboardIsLoading = computed(() => uiIsLoading.value.length > 0)
  const fetchingData = ref(false)
  const showDownloadingErrorDialog = ref(false)

  return {
    dashboardIsLoading,
    fetchingData,
    showDownloadingErrorDialog,
    trackUiLoadingStart,
    trackUiLoadingStop
  }
})
