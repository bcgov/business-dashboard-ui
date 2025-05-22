<template>
  <UModal
    :attach="attach || ''"
    :model-value="display"
    :data-cy="'bcros-dialog' + (name ? `-${name}` : '')"
  >
    <UCard
      v-if="options"
      :ui="{
        header: {
          background: backgroundColor ? backgroundColor : 'bg-bcGovColor-darkBlue',
          base: 'font-2xl font-bold text-white rounded-t-lg'
        },
      }"
    >
      <template #header>
        <slot name="header">
          <UIcon v-if="options.alertIcon" name="i-mdi-information-outline" class="text-4xl text-red-500 mb-2" />
          <h3 data-cy="bcros-dialog-title" class="text-white">
            {{ options.title }}
          </h3>
          <UButton
            v-if="!options.hideClose"
            color="primary"
            class="absolute top-0 right-0"
            icon="i-heroicons-x-mark-20-solid"
            variant="ghost"
            data-cy="bcros-dialog-close-btn"
            @click="close()"
          />
        </slot>
      </template>

      <div data-cy="bcros-dialog-text">
        <!-- can be replaced with <template v-slot:content> -->
        <slot name="content" :options="options">
          <dialog-content
            :base-text="options.text"
            :extra-text="options.textExtra"
          />
        </slot>
      </div>
      <slot name="extra-content" :options="options" />

      <template #footer>
        <!-- can be replaced with <template v-slot:buttons> -->
        <slot name="buttons" :options="options">
          <div class="flex gap-5" :class="options.buttons.length > 1 ? 'justify-between' : 'justify-end'">
            <div v-for="button, i in options.buttons" :key="'dialog-btn-' + i">
              <slot :name="'dialog-btn-slot-' + button.slotId">
                <dialog-button
                  variant="link"
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
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { DialogButton, DialogContent } from './slot-templates'

const isProcessingButtonSlotId: Ref<string | null> = ref(null)

const props = defineProps<{
  name?: string,
  attach?: string,
  display: boolean,
  options?: DialogOptionsI,
  backgroundColor?: string
}>()

const emit = defineEmits<{(e: 'close'): void }>()

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
