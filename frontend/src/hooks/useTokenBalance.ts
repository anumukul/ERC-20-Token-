import { useReadContract, useAccount } from 'wagmi'
import { CONTRACT_ADDRESS, ERC20_ABI, type Address } from '../contracts/contractConfig'

export const useTokenBalance = (address?: Address) => {
  const { address: connectedAddress } = useAccount()
  const targetAddress = address || connectedAddress

  const { data: balance, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  })

  return {
    balance: balance as bigint,
    isLoading,
    isError,
    refetch,
  }
}