<template>
  <div class="bg-gray-200" data-cy="todoItemBody-paymentPendingOnlineBanking">
    <p>
      <strong>Online Banking Payment Pending</strong>
    </p>
    <p class="pt-3 mb-2">
      This {{ draftTitle }} is pending payment and/or processing at your bank.
    </p>
    <ul>
      <li>
        If you have not done so, <strong>log in to your online bank account</strong> to pay the
        outstanding balance on your BC Registries and Online Services account.
      </li>
      <li>
        Enter <strong>"BC Registries and Online Services"</strong> as payee.
      </li>
      <li>
        Enter the following account number: <strong>{{ cfsAccountId }}</strong>
      </li>
      <li>
        Once submitted through your bank, Online Banking payments can take <strong>2 to 5 days to
          be processed</strong>.
      </li>
      <li>
        <strong>Changes based on this {{ draftTitle }} will not appear</strong> and <strong>other
          products and services</strong> for this business <strong>will not be available</strong> until
        the payment for this {{ draftTitle }} is received by BC Registries and Online Services.
      </li>
      <li>
        You can <strong>use a credit card to pay</strong> for this {{ draftTitle }} immediately by
        selecting "Change Payment Type".
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps({
  draftTitle: { type: String, required: true }
})

let cfsAccountId: string = null

// const accountId = sessionStorage.getItem('ACCOUNT_ID')
// N.B getting account id from the account store instead of session storage
const accountId = useBcrosAccount().currentAccount?.id

onMounted(async () => {
  cfsAccountId = await fetchCfsAccountId(accountId)
})

</script>

<style lang="scss" scoped>
</style>
