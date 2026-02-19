<template>
  <UCard
    :ui="{
      base: 'border border-yellow-400',
      background: 'bg-[#fff7e3]',
      rounded: 'rounded-none',
      body: {
        padding: 'sm:px-3 sm:py-3'
      }
    }"
  >
    <slot />
  </UCard>
</template>
