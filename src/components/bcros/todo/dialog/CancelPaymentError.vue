<script setup lang="ts">
defineEmits<{(e:'close'): void}>()

const prop = defineProps({
  display: { type: Boolean, required: true },
  errors: { type: Array<any>, required: true }
})

const { isStaffAccount } = useBcrosAccount()

const cancelPaymentDialogOptions = computed(() => {
  const title = 'Unable to Cancel Payment'

  const text = (prop.errors.length < 1)
    ? 'We were unable to cancel your payment.'
    : 'We were unable to cancel your payment due to the following errors:'

  return {
    title, text, hideClose: true, buttons: [{ text: 'OK', slotId: 'ok', color: 'primary', onClickClose: true }]
  } as DialogOptionsI
})
</script>

<template>
  <BcrosDialog
    attach="#todoList"
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
