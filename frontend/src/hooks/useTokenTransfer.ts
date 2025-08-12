import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS, ERC20_ABI, type Address } from '../contracts/contractConfig'
import { parseTokenAmount } from '../utils/formatters'
import { useState } from 'react'

export const useTokenTransfer = () => {
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { 
    data: hash, 
    isPending: isWritePending, 
    writeContract 
  } = useWriteContract()

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash,
  })

  const transfer = async (to: Address, amount: string) => {
    try {
      setError(null)
      setIsSuccess(false)
      
      const parsedAmount = parseTokenAmount(amount, 18)
      
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to, parsedAmount],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed')
    }
  }

  
  if (isConfirmed && !isSuccess) {
    setIsSuccess(true)
  }

  return {
    transfer,
    hash,
    isLoading: isWritePending || isConfirming,
    isSuccess: isSuccess && isConfirmed,
    error,
  }
}