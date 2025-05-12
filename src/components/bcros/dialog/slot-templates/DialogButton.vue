<template>
  <UButton
    :class="['px-10 py-2', button.class || '']"
    :color="button.color ? button.color : 'primary'"
    :label="button.text"
    :loading="loading"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
const props = defineProps<{ button: DialogButtonI }>()
const emit = defineEmits<{(e:'close'): void}>()
const loading = ref(false) // Prevents multiple rapid executions of handleClick

const handleClick = async () => {
  if (loading.value) { return }

  loading.value = true // Set loading state for UI feedback
  await nextTick() // Wait for DOM updates to reflect loading state
  await new Promise(resolve => setTimeout(resolve, 0)) // Allow browser to render before continuing

  try {
    if (props.button.onClick && props.button.onClickArgs) {
      await props.button.onClick(...props.button.onClickArgs)
    } else if (props.button.onClick) {
      await props.button.onClick()
    }

    if (props.button.onClickClose) { emit('close') }
  } catch (error) {
    console.error('Button click error:', error)
  } finally {
    loading.value = false // Reset loading state
  }
}

</script>
