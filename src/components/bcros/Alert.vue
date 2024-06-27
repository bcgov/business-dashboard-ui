<template>
  <div data-cy="alert-display" class="px-3 py-3">
    <h3>
      <UIcon
        :class="`${iconColour} mr-2`"
        :name="iconName"
        data-cy="contact-icon"
      />
      <span class="font-semibold flex-auto">{{$t(alertHeader)}}</span>
      <button class="float-right text-blue-600 hover:bg-blue-100 text-sm px-1 py-1mr-4" href="#" @click="expanded = !expanded">
        {{ !expanded ? 'View Details' : 'Hide Details' }}
        <UIcon
          :class="`text-blue-600 mr-2`"
          :name="!expanded ? 'i-mdi-chevron-down' : 'i-mdi-chevron-up'"
          data-cy="contact-icon"
        />
      </button>
    </h3>
    <div v-if="expanded">
      <p>{{$t(alertDescription)}}</p>
      <p class="mt-3" v-if="contact">
        {{ contact }}:
      </p>
      <p class="mt-3" v-if="contact">
        <bcros-contact-info class="font-normal font-16 mt-4" :contacts="getContactInfo('registries')" />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{ alert: Partial<AlertI>, contact: boolean }>()
const expanded = ref(false);
const t = useNuxtApp().$i18n.t

const iconName = computed((): string => {
  if (props.alert.alertType) {
    return 'i-mdi-alert'
  }

  switch (props.alert.severity?.toLowerCase()) {
    case 'error':
      return 'i-mdi-alert-circle'
    case 'warning':
      return 'i-mdi-alert'
    case 'info':
      return 'i-mdi-information'
    case 'success':
      return 'i-mdi-check'
    default:
      return 'i-mdi-alert-circle'
  }
})

const iconColour = computed((): string => {
  if (props.alert.alertType) {
    return 'text-yellow-600'
  }

  switch (props.alert.severity?.toLowerCase()) {
    case 'error':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    case 'info':
      return 'text-blue-600'
    case 'success':
      return 'text-green-600'
    default:
      return 'text-yellow-600'
  }
})

const alertHeader = computed((): string => {
  return props.alert.alertType? 'alerts.headers.'+props.alert.alertType : props.alert.text;
})

const alertDescription = computed((): string => {
  const date: string = props.alert?.date || 'unknown'
  let description = props.alert.alertType? 'alerts.descriptions.'+props.alert.alertType : props.alert.description;
  description.replaceAll('[date]', date)
  return description;
})

const contact = computed((): string => {
  //1 - assistance
  //2 - questions
  //3 - must contact
  // 4 - action
  if (props.alert.alertType === AlertTypesE.AMALGAMATION){
    return t('alerts.contact2')
  }
  if (props.alert.alertType === AlertTypesE.COMPLIANCE){
    return t('alerts.contact3')
  }
  if ( (props.alert.alertType === AlertTypesE.MISSINGINFO) || (props.alert.alertType === AlertTypesE.STANDING) ){
    return t('alerts.contact4')
  }

  return t('alerts.contact')
});
</script>
