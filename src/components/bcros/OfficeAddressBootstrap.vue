<script setup lang="ts">
defineProps<{ items: { title?: string }[] }>()
</script>

<template>
  <div class="flex flex-col divide-y-[1px]">
    <div
      v-for="item, i in items"
      :key="'bootstrap-address-' + i"
      class="p-5"
    >
      <p v-if="item.title" class="font-bold pb-3">
        {{ item.title }}
      </p>
      <div class="flex">
        <UIcon name="i-mdi-truck" class="mr-5 text-2xl bg-primary" />
        <div class="flex flex-col">
          <div class="text-gray-900 pb-1">
            {{ $t('label.address.addressType.delivery') }}
          </div>
          <div class="flex justify-center">
            <p>{{ $t('text.filing.completeYourFiling') }}</p>
          </div>
        </div>
      </div>
      <div class="flex pt-3">
        <UIcon name="i-mdi-email-outline" class="mr-5 text-2xl bg-primary" />
        <div class="flex flex-col">
          <div class="text-gray-900 pb-1">
            {{ $t('label.address.addressType.delivery') }}
          </div>
          <div class="flex justify-center">
            <p>{{ $t('text.filing.completeYourFiling') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
