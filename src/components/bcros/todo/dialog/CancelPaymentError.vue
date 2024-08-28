<script setup lang="ts">
defineEmits<{(e:'close'): void}>()

const t = useNuxtApp().$i18n.t

const prop = defineProps({
  display: { type: Boolean, required: true },
  errors: { type: Array<any>, required: true }
})

const { isStaffAccount } = useBcrosAccount()

const cancelPaymentDialogOptions = computed(() => {
  const title = t('text.dialog.error.cancelPaymentError.title')

  const text = (prop.errors.length < 1)
    ? t('text.dialog.error.cancelPaymentError.text.unableToCancel')
    : t('text.dialog.error.cancelPaymentError.text.hasErrors')

  return {
    title,
    text,
    hideClose: true,
    buttons: [{ text: t('button.general.ok'), slotId: 'ok', color: 'primary', onClickClose: true }]
  } as DialogOptionsI
})
</script>

<template>
  <BcrosDialog
    attach="#todoList"
    name="cancelPaymentError"
    :display="display"
    :options="cancelPaymentDialogOptions"
    @close="$emit('close')"
  >
    <template #content>
      <p v-for="(error, index) in errors" :key="index">
        {{ error.error || error.message }}
      </p>
      <template v-if="!isStaffAccount">
        <p>
          If you need help, please contact us.
        </p>
        <BcrosContactInfo :contacts="getContactInfo('registries')" class="mt-5" />
      </template>
    </template>
  </BcrosDialog>
</template>

<style scoped>
</style>
