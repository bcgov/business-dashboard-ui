<template>
  <BcrosTooltip
    :text="displayDate.toLocaleString()"
    :popper="{
          placement: 'right',
          arrow: true
        }"
  >
    <span class="font-13 ml-1 underline">{{ displayDate.toLocaleDateString() }}</span>
  </BcrosTooltip>
</template>

<script setup lang="ts">
const props = defineProps({
  date: { type: String, required: true }
})

const displayDate = computed(() => new Date(props.date))

</script>
