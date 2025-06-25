<script setup lang="ts">
import { isAuthorized } from '@/utils/authorizations'
import { AuthorizedActionsE } from '@/enums/authorized-actions-e'
import { LDFlags } from '~/enums/ld-flags'

const route = useRoute()
const t = useNuxtApp().$i18n.t

const { dashboardIsLoading, fetchingData } = storeToRefs(useBcrosDashboardUi())

const crumbConstructors = computed(() => {
  if (isAuthorized(AuthorizedActionsE.STAFF_BREADCRUMBS)) {
    return (route?.meta?.staffBreadcrumbs || []) as (() => BreadcrumbI)[]
  }

  return (route?.meta?.breadcrumbs || []) as (() => BreadcrumbI)[]
})

const systemMessage = ref('')
onMounted(async () => {
  await useBcrosLaunchdarkly().ldClient.waitUntilReady()
  systemMessage.value = (useBcrosLaunchdarkly().getStoredFlag(LDFlags.BannerText) || '').trim()
})
</script>

<template>
  <BcrosLoadingModal :open="dashboardIsLoading" :spinner-text="t('text.general.loadingDashboard')" />
  <BcrosLoadingModal :open="fetchingData" :spinner-text="t('text.general.fetchingData')" />
  <div v-show="!dashboardIsLoading" class="app-container" data-cy="default-layout">
    <bcros-header />
    <div class="justify-center">
      <bcros-system-banner
        class="justify-center"
        :message="systemMessage"
      />
    </div>
    <bcros-breadcrumb v-if="crumbConstructors.length > 0" :crumb-constructors="crumbConstructors" />
    <bcros-business-details />
    <div class="app-inner-container app-body">
      <slot />
    </div>
    <bcros-footer />
  </div>
</template>
<style scoped>

</style>
