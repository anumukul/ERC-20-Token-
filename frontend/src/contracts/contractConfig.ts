
import ERC20TokenABI from './ERC20Token.json'


export type Address = `0x${string}`



// Contract configuration
export const CONTRACT_CONFIG = {
  
  address: '0x5a9dD4a684a908AD55eE2d4D6F0C0891b14066bA' as Address,
  abi: ERC20TokenABI.abi,
  
  // Token details 
  name: 'Indian Rupee',
  symbol: 'INR',
  decimals: 18,
} as const


export const ERC20_ABI = CONTRACT_CONFIG.abi
export const CONTRACT_ADDRESS = CONTRACT_CONFIG.address


export const SUPPORTED_CHAINS = {

  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: import.meta.env.VITE_RPC_URL,

  },

} as const



// Token formatting utilities
export const TOKEN_CONFIG = {
  name: CONTRACT_CONFIG.name,
  symbol: CONTRACT_CONFIG.symbol,
  decimals: CONTRACT_CONFIG.decimals,
  displayDecimals: 4,
  maxDisplayValue: '999,999,999',
} as const

// Common contract function names
export const CONTRACT_FUNCTIONS = {
  balanceOf: 'balanceOf',
  allowance: 'allowance',
  totalSupply: 'totalSupply',
  name: 'name',
  symbol: 'symbol',
  decimals: 'decimals',
  transfer: 'transfer',
  approve: 'approve',
  transferFrom: 'transferFrom',
} as const

// Event names
export const CONTRACT_EVENTS = {
  Transfer: 'Transfer',
  Approval: 'Approval',
} as const

