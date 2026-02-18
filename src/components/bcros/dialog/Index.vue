<template>
  <UModal
    :attach="attach || ''"
    :model-value="display"
    :data-cy="'bcros-dialog' + (name ? `-${name}` : '')"
  >
    <div v-if="options" class="px-10 py-9">
      <div :class="`relative flex flex-col ${options.headerLeft ? 'items-start' : 'items-center'}`">
        <div :class="`flex flex-col ${options.headerLeft ? 'items-start' : 'items-center'}`">
          <UIcon v-if="options.alertIcon" name="i-mdi-information-outline" class="text-4xl text-red-500 mb-2" />
          <h1 data-cy="bcros-dialog-title" class="text-2xl">
            {{ options.title }}
          </h1>
        </div>
        <UButton
          v-if="!options.hideClose"
          color="primary"
          class="absolute top-1 right-0 p-0"
          icon="i-heroicons-x-mark-20-solid"
          size="xl"
          variant="ghost"
          data-cy="bcros-dialog-close-btn"
          @click="close()"
        />
      </div>
      <div class="pt-9" data-cy="bcros-dialog-text">
        <!-- can be replaced with <template v-slot:content> -->
        <slot name="content" :options="options">
          <dialog-content
            :base-text="options.text"
            :extra-text="options.textExtra"
          />
        </slot>
      </div>
      <slot name="extra-content" :options="options" />
      <div class="pt-7">
        <!-- can be replaced with <template v-slot:buttons> -->
        <slot name="buttons" :options="options">
          <div class="flex justify-center gap-5">
            <div v-for="button, i in options.buttons" :key="'dialog-btn-' + i">
              <slot :name="'dialog-btn-slot-' + button.slotId">
                <dialog-button
                  :variant="button.variant"
                  :button="button"
                  :loading="isProcessingButtonSlotId && isProcessingButtonSlotId === button.slotId"
                  :disabled="isProcessingButtonSlotId && isProcessingButtonSlotId !== button.slotId"
                  data-cy="bcros-dialog-btn"
                  @close="emit('close')"
                  @click="handleClick(button)"
                />
              </slot>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { DialogButton, DialogContent } from './slot-templates'

const isProcessingButtonSlotId: Ref<string | null> = ref(null)

const props = defineProps<{
  name?: string,
  attach?: string,
  display: boolean,
  options?: DialogOptionsI
}>()

const emit = defineEmits<{(e:'close'): void}>()

const handleClick = async (button: DialogButtonI) => {
  isProcessingButtonSlotId.value = button.slotId
  if (button.onClick && button.onClickArgs) {
    await button.onClick(...button.onClickArgs)
  } else if (button.onClick) {
    await button.onClick()
  }

  if (button.onClickClose) { emit('close') }
  isProcessingButtonSlotId.value = null
}

const close = () => {
  if (props.options?.onClose && props.options.onCloseArgs) {
    props.options.onClose(...props.options.onCloseArgs)
  } else if (props.options?.onClose) {
    props.options.onClose()
  }

  emit('close')
}
</script>
