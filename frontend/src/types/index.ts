import type { Address } from '../contracts/contractConfig'

export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply: bigint
}

export interface TransferFormData {
  to: string
  amount: string
}

export interface ApprovalFormData {
  spender: string
  amount: string
}

export interface TransactionState {
  hash?: string
  isLoading: boolean
  isSuccess: boolean
  error?: string
}