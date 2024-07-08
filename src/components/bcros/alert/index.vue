<template>
  <div :data-cy="`alert-display${index || index===0 ? '-' + index : ''}`" class="px-3 py-3">
    <UIcon
      v-if="showHeader"
      :class="`${iconColour} mr-2 font-semibold`"
      :name="iconName"
      data-cy="alert-icon"
    />
    <span v-if="showHeader" class="font-semibold flex-auto">{{ alertHeader }}</span>
    <button
      v-if="showHeader"
      class="font-semibold float-right text-primary-500 hover:bg-blue-100 text-sm px-1 py-1mr-4"
      href="#"
      @click="expanded = !expanded"
    >
      {{ !expanded ? 'View Details' : 'Hide Details' }}
      <UIcon
        v-if="showHeader"
        class="font-semibold text-primary-500 mr-2"
        :name="!expanded ? 'i-mdi-chevron-down' : 'i-mdi-chevron-up'"
        data-cy="expand-icon"
      />
    </button>
    <div v-if="expanded && showDescription" :data-cy="`alert-description${index || index===0 ? '-' + index : ''}`">
      <p>{{ $t(alertDescription) }}</p>
      <p v-if="contact" class="mt-3">
        {{ contact }}:
      </p>
      <p v-if="contact" class="mt-3">
        <bcros-contact-info class="font-normal font-16 mt-4" :contacts="getContactInfo('registries')" />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAlertIcon, getAlertHeader, getAlertColour } from '~/utils/alert'

interface Props {
  alert: Partial<AlertI>,
  contact: boolean,
  showHeader?: boolean,
  showDescription?: boolean,
  index?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showDescription: true,
  index: ''
})

const expanded = props.showHeader ? ref(false) : ref(true)
const t = useNuxtApp().$i18n.t

const iconName = computed((): string => {
  return getAlertIcon(props.alert)
})

const iconColour = computed((): string => {
  return getAlertColour(props.alert)
})

const alertHeader = computed((): string => {
  return getAlertHeader(props.alert)
})

const alertDescription = computed((): string => {
  const date: string = props.alert?.date || 'unknown'
  const description = t(props.alert.alertType
    ? 'alerts.descriptions.' + props.alert.alertType
    : props.alert.description)
  description.replaceAll('[date]', date)
  return description
})

const contact = computed((): string => {
  // 1 - assistance
  // 2 - questions
  // 3 - must contact
  // 4 - action
  if (props.alert.alertType === AlertTypesE.AMALGAMATION) {
    return t('alerts.contact2')
  }
  if (props.alert.alertType === AlertTypesE.COMPLIANCE) {
    return t('alerts.contact3')
  }
  if ((props.alert.alertType === AlertTypesE.MISSINGINFO) || (props.alert.alertType === AlertTypesE.STANDING)) {
    return t('alerts.contact4')
  }

  return t('alerts.contact')
})
</script>
