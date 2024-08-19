<script setup lang="ts">
defineEmits<{(e:'close'): void}>()

const t = useNuxtApp().$i18n.t

const prop = defineProps({
  display: { type: Boolean, required: true },
  errors: { type: Array<any>, required: true },
  warnings: { type: Array<any>, required: true }
})

const { isStaffAccount } = useBcrosAccount()

const deleteErrorDialogOptions = computed(() => {
  const title = (prop.errors.length > 0 || prop.warnings.length < 1)
    ? t('text.dialog.error.deleteError.title.unableToDelete')
    : t('text.dialog.error.deleteError.title.filingWithWarnings')

  let text = ''
  if (prop.errors.length + prop.warnings.length < 1) {
    text = t('text.dialog.error.deleteError.text.unableToDelete')
  } else if (prop.errors.length > 0) {
    text = t('text.dialog.error.deleteError.text.hasErrors')
  } else {
    text = t('text.dialog.error.deleteError.text.other')
  }

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
    name="deleteError"
    :display="display"
    :options="deleteErrorDialogOptions"
    @close="$emit('close')"
  >
    <template #content>
      <p v-for="(error, index) in errors" :key="index">
        {{ error.error || error.message }}
      </p>
      <p v-for="(warning, index) in warnings" :key="index">
        {{ warning.warning || warning.message }}
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
