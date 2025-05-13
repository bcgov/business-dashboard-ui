<template>
  <UButton
    :class="['px-10 py-2', button.class || '']"
    :color="button.color ? button.color : 'primary'"
    :label="button.text"
    :disabled="disabled"
    :loading="loading"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
const props = defineProps<{ 
  button: DialogButtonI,
  loading: boolean,
  disabled: boolean
}>()
const emit = defineEmits<{(e:'close'): void}>()

const handleClick = async () => {
  if (props.button.onClick && props.button.onClickArgs) {
      await props.button.onClick(...props.button.onClickArgs)
    } else if (props.button.onClick) {
      await props.button.onClick()
    }

    if (props.button.onClickClose) { emit('close') }
}

</script>
