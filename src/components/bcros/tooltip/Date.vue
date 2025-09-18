<template>
  <span v-if="hideTooltip" class="font-13">
    {{ dateToPacificDate(displayDate) }}
  </span>
  <BcrosTooltip
    v-else
    :text="dateToPacificDateTime(displayDate)"
    :popper="{
      placement: 'right',
      arrow: true
    }"
  >
    <span class="font-13 underline decoration-dotted">
      {{ dateToPacificDate(displayDate) }}
    </span>
  </BcrosTooltip>
</template>

<script setup lang="ts">
import { dateToPacificDate, dateToPacificDateTime } from '#imports'

const props = defineProps({
  date: { type: String, required: true },
  hideTooltip: { type: Boolean, default: false }
})

const displayDate = computed(() => new Date(props.date))
</script>
