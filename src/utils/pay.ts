import { PaymentErrorIF } from '@/interfaces'

/**
 * Fetches a payment error object (description) by its code.
 * @param code the error code to look up
 * @returns the payment error object
 */
export const getPayErrorObj = async (code: string): Promise<PaymentErrorIF> => {
  const payApiURL = useRuntimeConfig().public.payApiURL
  const url = `${payApiURL}/codes/errors/${code}`
  return await useBcrosFetch<PaymentErrorIF>(url, {})
}
