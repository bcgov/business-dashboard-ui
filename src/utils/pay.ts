import { PaymentErrorIF } from '@/interfaces'

/**
 * Fetches a payment error object (description) by its code.
 * @param code the error code to look up
 * @returns the payment error object
 */
export const getPayErrorObj = async (code: string): Promise<PaymentErrorIF> => {
  const payApiGwURL = useRuntimeConfig().public.payApiGwURL
  const url = `${payApiGwURL}/codes/errors/${code}`
  return await useBcrosFetch<PaymentErrorIF>(url, {}).then(({ data, error }) => {
    if (error.value) {
      console.error('Error fetching data from Pay API:', error.value)
    } else {
      return data.value
    }
  })
}

type CfsAccountResponse = {
  data: {
    cfsAccount: {
      cfsAccountNumber: string
    }
  }
}

/**
 * Fetches the CFS account ID from the pay-api.
 * @param accountId the ID for which to fetch the CFS account ID
 * @returns the CFS account ID
 */
export const fetchCfsAccountId = async (accountId: number): Promise<string> => {
  const payApiGwURL = useRuntimeConfig().public.payApiGwURL
  const url = `${payApiGwURL}/accounts/${accountId}`

  return await useBcrosFetch<CfsAccountResponse>(url, {}).then(({ data, error }) => {
    if (error.value) {
      console.error('Error fetching data from Pay API:', error.value)
    } else {
      return data.value.cfsAccount.cfsAccountNumber
    }
  })
}
