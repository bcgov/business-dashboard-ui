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

<script setup lang="ts">
const route = useRoute()
const { isStaffAccount } = useBcrosAccount()

const crumbConstructors = computed(() => {
  let breadcrumbs = (route?.meta?.breadcrumbs || []) as (() => BreadcrumbI)[]

  if (isStaffAccount && breadcrumbs.length > 0) {
    breadcrumbs = [getStaffDashCrumb, getBusinessDashCrumb]
  }

  return breadcrumbs
})

const systemMessage = ref('')
onMounted(async () => {
  await useBcrosLaunchdarkly().ldClient.waitUntilReady()
  systemMessage.value = useBcrosLaunchdarkly().getStoredFlag('banner-text')
})
</script>

<style scoped>

</style>
