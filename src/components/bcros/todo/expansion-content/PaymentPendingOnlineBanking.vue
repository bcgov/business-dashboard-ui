<script setup lang="ts">
const prop = defineProps({
  draftTitle: { type: String, required: true }
})

let cfsAccountId: string = null

// const accountId = sessionStorage.getItem('ACCOUNT_ID')
// N.B getting account id from the account store instead of session storage
const accountId = useBcrosAccount().currentAccount?.id

const replaceDraftTitle = {
  pattern: /DRAFT_TITLE/g,
  replacement: prop.draftTitle
}

onMounted(async () => {
  cfsAccountId = await fetchCfsAccountId(accountId)
})
</script>

<template>
  <div class="bg-gray-200" data-cy="todoItemBody-paymentPendingOnlineBanking">
    <p>
      <strong>{{ $t('text.todoItem.expansionPanel.paymentPendingOnlineBanking.title') }}</strong>
    </p>
    <p class="pt-3 mb-2">
      <BcrosI18Helper
        translation-path="text.todoItem.expansionPanel.paymentPendingOnlineBanking.text"
        :replacements="[replaceDraftTitle]"
      />
    </p>
    <ul class="list-disc ml-8">
      <li>
        <BcrosI18Helper
          translation-path="text.todoItem.expansionPanel.paymentPendingOnlineBanking.list.item1"
          :replacements="[replaceBold]"
        />
      </li>
      <li>
        <BcrosI18Helper
          translation-path="text.todoItem.expansionPanel.paymentPendingOnlineBanking.list.item2"
          :replacements="[replaceBold]"
        />
      </li>
      <li>
        {{ $t('text.todoItem.expansionPanel.paymentPendingOnlineBanking.list.item3') + ' ' }}
        <strong>{{ cfsAccountId }}</strong>
      </li>
      <li>
        <BcrosI18Helper
          translation-path="text.todoItem.expansionPanel.paymentPendingOnlineBanking.list.item4"
          :replacements="[replaceBold]"
        />
      </li>
      <li>
        <BcrosI18Helper
          translation-path="text.todoItem.expansionPanel.paymentPendingOnlineBanking.list.item5"
          :replacements="[replaceBold, replaceDraftTitle]"
        />
      </li>
      <li>
        <BcrosI18Helper
          translation-path="text.todoItem.expansionPanel.paymentPendingOnlineBanking.list.item6"
          :replacements="[replaceBold, replaceDraftTitle]"
        />
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
</style>
