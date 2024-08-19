<script setup lang="ts">
defineEmits<{(e:'close'): void}>()

const prop = defineProps({
  display: { type: Boolean, required: true },
  errors: { type: Array<any>, required: true },
  warnings: { type: Array<any>, required: true }
})

const { isStaffAccount } = useBcrosAccount()

const deleteErrorDialogOptions = computed(() => {
  const title = (prop.errors.length > 0 || prop.warnings.length < 1)
    ? 'Unable to Delete Filing'
    : 'Filing Deleted with Warnings'

  let text = ''
  if (prop.errors.length + prop.warnings.length < 1) {
    text = 'We were unable to delete your filing.'
  } else if (prop.errors.length > 0) {
    text = 'We were unable to delete your filing due to the following errors:'
  } else {
    text = 'Please note the following:'
  }

  return {
    title, text, hideClose: true, buttons: [{ text: 'OK', slotId: 'ok', color: 'primary', onClickClose: true }]
  } as DialogOptionsI
})
</script>

<template>
  <BcrosDialog
    attach="#todoList"
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
