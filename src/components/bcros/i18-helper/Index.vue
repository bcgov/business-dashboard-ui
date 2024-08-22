<script setup lang="ts">
const props = defineProps({
  translationPath: { type: String, required: true },
  replacements: { type: Array<{ pattern: string | RegExp, replacement: string}>, required: true }
})

const t = useNuxtApp().$i18n.t

let textToDisplay = t(props.translationPath as string, {
  boldStart: '{b}',
  boldEnd: '{/b}'
})

for (const replacementObj of props.replacements) {
  textToDisplay = textToDisplay.replace(replacementObj.pattern, replacementObj.replacement)
}

</script>

<template>
  <!-- eslint-disable-next-line -->
  <span :data-cy="'i18n-bold-helper-' + translationPath" v-html="textToDisplay" />
</template>
