import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, ERC20_ABI, type Address } from '../contracts/contractConfig'
import { parseTokenAmount } from '../utils/formatters'
import { useState } from 'react'

export const useTokenApproval = (owner?: Address) => {
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

  const approve = async (spender: Address, amount: string) => {
    try {
      setError(null)
      setIsSuccess(false)
      
      const parsedAmount = parseTokenAmount(amount, 18)
      
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, parsedAmount],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed')
    }
  }

  // Get current allowance
  const getAllowance = (spender: Address) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: owner && spender ? [owner, spender] : undefined,
      query: {
        enabled: !!(owner && spender),
      },
    })
  }

  if (isConfirmed && !isSuccess) {
    setIsSuccess(true)
  }

  return {
    approve,
    getAllowance,
    hash,
    isLoading: isWritePending || isConfirming,
    isSuccess: isSuccess && isConfirmed,
    error,
  }
}