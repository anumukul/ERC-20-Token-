import { isAddress } from 'viem'

export const validateAddress = (address: string): boolean => {
  return isAddress(address)
}

export const validateAmount = (amount: string): boolean => {
  if (!amount || amount === '') return false
  const num = parseFloat(amount)
  return !isNaN(num) && num > 0
}

export const validateTransferForm = (to: string, amount: string) => {
  const errors: Record<string, string> = {}
  
  if (!to) {
    errors.to = 'Recipient address is required'
  } else if (!validateAddress(to)) {
    errors.to = 'Invalid Ethereum address'
  }
  
  if (!amount) {
    errors.amount = 'Amount is required'
  } else if (!validateAmount(amount)) {
    errors.amount = 'Invalid amount'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}