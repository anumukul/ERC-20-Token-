import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS, ERC20_ABI, type Address } from '../contracts/contractConfig'
import { parseUnits, formatUnits } from 'viem'
import { useTokenBalance } from '../hooks/useTokenBalance'

export const TransferForm = () => {
  const { address, isConnected } = useAccount()
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  
  const { balance, refetch: refetchBalance } = useTokenBalance(address)
  
  const { data: hash, isPending, writeContract, error: writeError } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleTransfer = () => {
    console.log('Transfer button clicked!')
    alert('Transfer button clicked!') 
    
    setError('')
    
   
    if (!to || !amount) {
      setError('Please fill in all fields')
      return
    }

    if (!to.startsWith('0x') || to.length !== 42) {
      setError('Please enter a valid Ethereum address')
      return
    }

    const amountNumber = parseFloat(amount)
    if (amountNumber <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    
    if (balance) {
      const balanceFormatted = parseFloat(formatUnits(balance, 18))
      if (amountNumber > balanceFormatted) {
        setError(`Insufficient balance. You have ${balanceFormatted.toFixed(4)} INR`)
        return
      }
    }

    try {
      const parsedAmount = parseUnits(amount, 18)
      
      console.log('Calling writeContract with:', {
        address: CONTRACT_ADDRESS,
        functionName: 'transfer',
        args: [to, parsedAmount.toString()]
      })

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to as Address, parsedAmount],
      })
    } catch (err) {
      console.error('Transfer error:', err)
      setError(err instanceof Error ? err.message : 'Transfer failed')
    }
  }


  if (isSuccess && hash) {
    setTimeout(() => {
      setTo('')
      setAmount('')
      refetchBalance()
    }, 3000)
  }

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Transfer Tokens</h2>
        <p className="text-gray-600">Connect your wallet to transfer tokens.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Transfer Tokens</h2>
      
      <div className="space-y-4">
        {}
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-700">
            Your Balance: {balance ? formatUnits(balance, 18) : '0'} INR
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x1234567890123456789012345678901234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (INR)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1.0"
            step="0.0001"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Try a small amount first, like 1 or 10 tokens
          </p>
        </div>

   
        <div className="flex gap-2">
          <button
            onClick={() => setAmount('1')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            1 INR
          </button>
          <button
            onClick={() => setAmount('10')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            10 INR
          </button>
          <button
            onClick={() => setAmount('100')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            100 INR
          </button>
        </div>

        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

       
        {writeError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">
              Error: {writeError.message}
            </p>
          </div>
        )}

       
        {hash && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-blue-600 text-sm">
              Transaction submitted! 
              <br />
              <a 
                href={`https://sepolia.etherscan.io/tx/${hash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline"
              >
                View on Etherscan: {hash.slice(0, 10)}...{hash.slice(-8)}
              </a>
            </p>
          </div>
        )}

       
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-green-600 text-sm">✅ Transfer successful!</p>
          </div>
        )}

        
        <div className="text-xs text-gray-500">
          Status: {isPending ? 'Waiting for confirmation...' : isConfirming ? 'Processing transaction...' : 'Ready'}
        </div>
        
       
        <button
          onClick={handleTransfer}
          disabled={!to || !amount || isPending || isConfirming}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {isPending ? 'Waiting for Wallet...' : isConfirming ? 'Processing...' : 'Transfer Tokens'}
        </button>

       
        <button
          onClick={() => alert('Test button works!')}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded-md text-sm"
        >
          🧪 Test Button (Click to verify buttons work)
        </button>
      </div>
    </div>
  )
}