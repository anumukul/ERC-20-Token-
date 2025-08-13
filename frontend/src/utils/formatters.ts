import { formatUnits, parseUnits } from 'viem'

export const formatTokenAmount = (
  amount: bigint | undefined,
  decimals: number = 18,
  displayDecimals: number = 4
): string => {
  if (!amount) return '0'
  const formatted = formatUnits(amount, decimals)
  const num = parseFloat(formatted)
  return num.toFixed(displayDecimals)
}

export const parseTokenAmount = (amount: string, decimals: number = 18): bigint => {
  if (!amount || amount === '') return 0n
  return parseUnits(amount, decimals)
}

export const formatTxHash = (hash: string): string => {
  if (!hash) return '';
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};