<template>
  <div data-cy="alert-display" class="px-3 py-3">
    <div class="flex items-center justify-center">
      <UIcon
        v-if="showHeader"
        :class="`${iconColour} mr-2 font-semibold`"
        :name="iconName"
        data-cy="alert-icon"
      />
      <span v-if="showHeader" class="font-semibold flex-auto">{{ alertHeader }}</span>
      <UButton
        v-if="showHeader"
        color="primary"
        :icon="actualExpanded ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down'"
        :label="actualExpanded ? 'Hide Details' : 'View Details'"
        trailing
        variant="ghost"
        class="float-right"
        :ui="{ icon: { base: 'transition-all' } }"
        @click="toggleExpanded()"
      />
    </div>
    <div v-if="actualExpanded && showDescription" data-cy="alert-description">
      <div class="space-y-3">
        <p v-if="props.alert.alertType">
          <BcrosI18Helper
            :translation-path="'alerts.descriptions.' + props.alert.alertType"
            :replacements="[replaceBold, replaceItalicizedEmphasis, replaceDate]"
          />
        </p>
        <p v-else>
          {{ props.alert.description }}
        </p>
        <p v-if="alertDescriptionExtra">
          {{ alertDescriptionExtra }}
        </p>
        <div v-if="contactText">
          <p>{{ contactText }}:</p>
          <bcros-contact-info class="font-normal font-16 mt-4" :contacts="bcrosContacts" />
        </div>
      </div>
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
  open?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showDescription: true
})

const expanded = props.showHeader ? ref(false) : ref(true)

const actualExpanded = computed((): boolean => {
  return expanded.value || props.open
})

const toggleExpanded = () => {
  if (typeof props.open === 'boolean') {
    return
  }
  expanded.value = !expanded.value
}

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

const alertDescriptionExtra = computed((): string | undefined => {
  if ([AlertTypesE.DISSOLUTION, AlertTypesE.TRANSITIONREQUIRED].includes(props.alert.alertType)) {
    return t(`alerts.descriptions.${props.alert.alertType}Extra`)
  }
  return undefined
})

const contactText = computed((): string | undefined => {
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
  if ([AlertTypesE.DISSOLUTION, AlertTypesE.TRANSITIONREQUIRED].includes(props.alert.alertType)) {
    return undefined
  }
  return t('alerts.contact')
})

const bcrosContacts = computed(() => {
  const contacts = getContactInfo('registries')
  if (AlertTypesE.FROZEN === props.alert.alertType) {
    return contacts.filter(contact => contact.label.toLowerCase() === 'email')
  }
  return contacts
})

const replaceDate = {
  pattern: /DATE/g,
  replacement: props.alert?.date || 'unknown'
}

</script>
