<template>
  <div class="mt-8 mb-16 flex flex-wrap" data-cy="business-dashboard">
    <div class="w-full md:w-9/12">
      <BcrosSection name="todo">
        <template #header>
          To Do
        </template>
        TBD
      </BcrosSection>
      <BcrosSection name="filingHistory" class="pt-5">
        <template #header>
          Recent Filing History
        </template>
        TBD
      </BcrosSection>
    </div>
    <div class="w-full pt-5 md:w-3/12 md:pl-5 md:pt-0 flex flex-col">
      <BcrosSection name="address">
        <template #header>
          <div class="flex justify-between">
            Office Addresses
            <UButton
              :ui="{
                rounded: 'rounded-none focus-visible:rounded-md',
                padding: { default: 'py-0' }
              }"
              icon="i-mdi-pencil"
              :label="`Change`"
              data-cy="change-button"
              @click="()=>{console.log('clicked!')}"
            />
          </div>
        </template>
        <BcrosAddress name="address" />
      </BcrosSection>
      <BcrosSection name="directors" class="pt-5">
        <template #header>
          Current Directors
        </template>
        TBD
      </BcrosSection>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
