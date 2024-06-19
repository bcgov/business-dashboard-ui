<template>
  <div class="mt-8 mb-16 flex flex-wrap" data-cy="business-dashboard">
    <div class="w-full md:w-9/12">
      <BcrosSection name="todo">
        <template #header>
          {{ $t('title.section.toDo') }}
        </template>
        TBD
      </BcrosSection>
      <BcrosSection name="filingHistory" class="pt-5">
        <template #header>
          {{ $t('title.section.filingHistory') }}
        </template>
        TBD
      </BcrosSection>
    </div>
    <div class="w-full pt-5 md:w-3/12 md:pl-5 md:pt-0 flex flex-col">
      <BcrosSection name="address">
        <template #header>
          {{ $t('title.section.officeAddresses') }}
        </template>
        TBD
      </BcrosSection>
      <BcrosSection name="directors" class="pt-5">
        <template #header>
          {{ $t('title.section.currentDirectors') }}
        </template>
        TBD
      </BcrosSection>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
