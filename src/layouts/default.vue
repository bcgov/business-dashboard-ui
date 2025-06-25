<script setup lang="ts">
import { isAuthorized } from '@/utils/authorizations'
import { AuthorizedActionsE } from '@/enums/authorized-actions-e'
import { LDFlags } from '~/enums/ld-flags'

const route = useRoute()

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
  <div class="app-container" data-cy="default-layout">
    <bcros-header />
    <bcros-system-banner
      class="justify-center"
      :message="systemMessage"
    />
    <bcros-breadcrumb v-if="crumbConstructors.length > 0" :crumb-constructors="crumbConstructors" />
    <div class="app-inner-container app-body">
      <slot />
    </div>
    <bcros-footer />
  </div>
</template>
