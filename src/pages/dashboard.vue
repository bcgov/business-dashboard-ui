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
          <div class="flex justify-between">
            {{ $t('title.section.officeAddresses') }}
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :label="$t('button.general.change')"
              data-cy="address-change-button"
              @click="()=>{
                // TO-DO  confirm the redirect logic
                console.log('clicked!')
              }"
            />
          </div>
        </template>
        <BcrosOfficeAddress name="officeAddress" />
      </BcrosSection>
      <BcrosSection name="directors" class="pt-5">
        <template #header>
          <div class="flex justify-between">
            {{ $t('title.section.currentDirectors') }}
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :label="$t('button.general.change')"
              data-cy="change-button"
              @click="()=>{
                // TO-DO  confirm the redirect logic
                console.log('clicked!')
              }"
            />
          </div>
        </template>
        TBD
      </BcrosSection>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
