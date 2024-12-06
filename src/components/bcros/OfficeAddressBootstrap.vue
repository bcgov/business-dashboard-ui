<script setup lang="ts">
import { getName } from 'country-list'
const bootstrap = useBcrosBusinessBootstrap()
const { bootstrapFiling } = storeToRefs(bootstrap)

defineProps<{ items: { title?: string, field?: string }[] }>()

const bootstrapFiledAndPaid: Ref<boolean> = computed(() => {
  return bootstrapFiling?.value?.filing?.header?.status === FilingStatusE.PAID
})

const bootstrapAddress: Ref<EntityAddressCollectionI> = computed(() => {
  return bootstrapFiledAndPaid.value ? bootstrapFiling.value?.filing?.incorporationApplication?.offices : undefined
})

const sameAs = function(addr1, addr2) {
  if (!addr1 || !addr2) {
    return false
  }
  return JSON.stringify(addr1) === JSON.stringify(addr2)
}

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
            <span v-if="bootstrapAddress?.[item.field]?.deliveryAddress?.streetAddress">
              <p>{{ bootstrapAddress?.[item.field]?.deliveryAddress?.streetAddress }}</p>
              <p>
                {{ bootstrapAddress?.[item.field]?.deliveryAddress?.addressCity }}
                &nbsp;{{ bootstrapAddress?.[item.field]?.deliveryAddress?.postalCode }}
              </p>
              <p>{{ getName(bootstrapAddress?.[item.field]?.deliveryAddress?.addressCountry) }}</p>
            </span>
            <p v-else>
              {{ $t('text.filing.completeYourFiling') }}
            </p>
          </div>
        </div>
      </div>
      <div class="flex pt-3">
        <UIcon name="i-mdi-email-outline" class="mr-5 text-2xl bg-primary" />
        <div class="flex flex-col">
          <div class="text-gray-900 pb-1">
            {{ $t('label.address.addressType.mailing') }}
          </div>
          <div class="flex justify-center">
            <span
              v-if="sameAs(
                bootstrapAddress?.[item.field]?.deliveryAddress,
                bootstrapAddress?.[item.field]?.mailingAddress
              )"
            >
              <p>{{ $t('text.general.sameAsAbove') }}</p>
            </span>
            <span v-else-if="bootstrapAddress?.[item.field]?.mailingAddress?.streetAddress">
              <p>{{ bootstrapAddress?.[item.field]?.mailingAddress?.streetAddress }}</p>
              <p>
                {{ bootstrapAddress?.[item.field]?.mailingAddress?.addressCity }}
                &nbsp;{{ bootstrapAddress?.[item.field]?.mailingAddress?.postalCode }}</p>
              <p>{{ getName(bootstrapAddress?.[item.field]?.mailingAddress?.addressCountry) }}</p>
            </span>
            <p v-else>
              {{ $t('text.filing.completeYourFiling') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
