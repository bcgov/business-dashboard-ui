<template>
  <div data-cy="alert-display" class="p-4 ml-3">
    <div class="flex items-start">
      <UIcon
        v-if="showHeader"
        :class="`${iconColour} mt-1 mr-2 font-semibold`"
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
      <div class="space-y-0">
        <p v-if="props.alert.alertType">
          <BcrosI18Helper
            :translation-path="alertDescriptionPath"
            :replacements="[replaceBold, replaceItalicizedEmphasis, replaceDate, replaceEntityType]"
          />
        </p>
        <p v-else>
          {{ props.alert.description }}
        </p>
        <p v-if="alertDescriptionExtra">
          <BcrosI18Helper
            :translation-path="alertDescriptionExtraKey"
            :replacements="[replaceBold, replaceEmailLink]"
          />
        </p>

        <!-- Amalgamating business details -->
        <div v-if="isAmalgamatingAlert" data-cy="alert-amalgamation-details" class="space-y-3">
          <p>
            <BcrosI18Helper
              :translation-path="amalgamatingIntoPath"
              :replacements="[replaceTargetName, replaceFilingIdLink]"
            />
          </p>
          <p>{{ t('alerts.descriptions.amalgamatingBusinessListHeader') }}</p>
          <ul class="list-none pl-5 space-y-2">
            <li v-for="business in amalgamatingBusinesses" :key="business.identifier">
              {{ business.identifier }} - {{ business.name }}
              <span v-if="isCurrentBusiness(business)">
                ({{ t('alerts.descriptions.thisCompany') }})
              </span>
            </li>
          </ul>
        </div>

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
import { replaceBold, replaceItalicizedEmphasis } from '~/utils/i18n-helper'

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

const alertDescriptionPath = computed((): string => {
  if (props.alert.alertType === AlertTypesE.STANDING && props.alert.options?.overdueLiquidation) {
    return 'alerts.descriptions.standingDueToLiquidation'
  }
  const suffix = props.alert.options?.overdueTransition ? 'DueToTa' : ''
  return `alerts.descriptions.${props.alert.alertType}${suffix}`
})

const alertDescriptionExtra = computed((): string | undefined => {
  if ([AlertTypesE.DISSOLUTION, AlertTypesE.TRANSITIONREQUIRED].includes(props.alert.alertType)) {
    const suffix = props.alert.options?.delaysMaxed ? 'Maxed' : ''
    return t(`alerts.descriptions.${props.alert.alertType}Extra${suffix}`)
  }
  return undefined
})

const alertDescriptionExtraKey = computed((): string => {
  const suffix = props.alert.options?.delaysMaxed ? 'Maxed' : ''
  return `alerts.descriptions.${props.alert.alertType}Extra${suffix}`
})

const isAmalgamatingAlert = computed((): boolean => {
  return props.alert.alertType === AlertTypesE.AMALGAMATION
})

const amalgamatingBusinesses = computed((): Array<{ identifier: string, name: string }> => {
  return props.alert.options?.amalgamatingBusinesses || []
})

const filingId = computed((): number | undefined => {
  return props.alert.options?.filingId
})

const resultingBusinessIdentifier = computed((): string | undefined => {
  return props.alert.options?.resultingBusinessIdentifier
})

const amalgamatingIntoName = computed((): string | undefined => {
  return props.alert.options?.amalgamatingIntoName
})

const isNumberedAmalgamation = computed((): boolean => {
  return !amalgamatingIntoName.value
})

// The API only includes filingId in the warning data for staff users, so its presence
// doubles as the staff/client signal
const isStaff = computed((): boolean => {
  return Boolean(filingId.value)
})

const amalgamatingIntoPath = computed((): string => {
  const target = isNumberedAmalgamation.value ? 'Numbered' : 'Named'
  const staffSuffix = isStaff.value ? 'Staff' : ''
  return `alerts.descriptions.amalgamatingBusinessInto${target}${staffSuffix}`
})

const isCurrentBusiness = (business: { identifier: string }): boolean => {
  return business.identifier === props.alert.options?.currentBusinessIdentifier
}

const contactText = computed((): string | undefined => {
  // 1 - assistance
  // 2 - must contact
  // 3 - action
  if (props.alert.alertType === AlertTypesE.COMPLIANCE) {
    return t('alerts.contact2')
  }
  if ((props.alert.alertType === AlertTypesE.MISSINGINFO) || (props.alert.alertType === AlertTypesE.STANDING)) {
    return t('alerts.contact3')
  }
  if ([AlertTypesE.DISSOLUTION, AlertTypesE.TRANSITIONREQUIRED,
    AlertTypesE.AMALGAMATION].includes(props.alert.alertType)) {
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

const replaceEmailLink = {
  pattern: /EMAIL-LINK/g,
  replacement: `<a href="mailto:${t('alerts.email')}" class="underline text-primary-600 hover:text-primary-700">
                  ${t('alerts.email')}
                </a>`
}

const replaceFilingIdLink = computed(() => ({
  pattern: /FILING-ID-LINK/g,
  replacement: `<a href="/${resultingBusinessIdentifier.value}"
   class="underline text-primary-600 hover:text-primary-700">
                  ${filingId.value}
                </a>`
}))

const replaceTargetName = computed(() => ({
  pattern: /TARGET-NAME/g,
  replacement: amalgamatingIntoName.value || ''
}))

const replaceEntityType = {
  pattern: /\{entityType\}/g,
  replacement: props.alert?.options?.entityType || 'business'
}

</script>
