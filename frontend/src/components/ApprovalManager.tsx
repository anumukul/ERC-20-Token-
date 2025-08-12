
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, ERC20_ABI, type Address } from '../contracts/contractConfig'
import { parseUnits, formatUnits } from 'viem'
import { useState, useContext, useEffect } from 'react'
import { TransactionContext } from './TransactionHistory'


export const ApprovalManager = () => {
  const { address, isConnected } = useAccount()
  const [spender, setSpender] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const transactionContext = useContext(TransactionContext)
  const { data: hash, isPending, writeContract, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && spender && spender.length === 42 ? [address, spender as Address] : undefined,
    query: {
      enabled: !!(address && spender && spender.length === 42),
    },
  })

  const handleApprove = () => {
    console.log('Approve button clicked!')
    alert('Approve button clicked!') 
    
    setError('')
    
   
    if (!spender || !amount) {
      setError('Please fill in all fields')
      return
    }

    if (!spender.startsWith('0x') || spender.length !== 42) {
      setError('Please enter a valid Ethereum address')
      return
    }

    const amountNumber = parseFloat(amount)
    if (amountNumber <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    try {
      const parsedAmount = parseUnits(amount, 18)
      
      console.log('Calling writeContract for approve with:', {
        address: CONTRACT_ADDRESS,
        functionName: 'approve',
        args: [spender, parsedAmount.toString()]
      })

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender as Address, parsedAmount],
      })
    } catch (err) {
      console.error('Approval error:', err)
      setError(err instanceof Error ? err.message : 'Approval failed')
    }
  }

  const handleRevoke = () => {
    console.log('Revoke button clicked!')
    alert('Revoke button clicked!')
    
    setError('')
    
    if (!spender) {
      setError('Please enter spender address')
      return
    }

    if (!spender.startsWith('0x') || spender.length !== 42) {
      setError('Please enter a valid Ethereum address')
      return
    }

    try {
      console.log('Calling writeContract for revoke with:', {
        address: CONTRACT_ADDRESS,
        functionName: 'approve',
        args: [spender, '0']
      })

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender as Address, 0n], 
      })
    } catch (err) {
      console.error('Revoke error:', err)
      setError(err instanceof Error ? err.message : 'Revoke failed')
    }
  }

  if (isSuccess && hash) {
    setTimeout(() => {
      refetchAllowance()
    }, 3000)
  }


  useEffect(() => {
  if (hash && transactionContext && spender && amount) {
    transactionContext.addTransaction({
      hash: hash,
      type: 'Approval',
      status: 'pending',
      timestamp: new Date().toISOString(),
      amount: amount,
      to: spender,
      from: address || undefined,
    })
  }
}, [hash, transactionContext, spender, amount, address])

useEffect(() => {
  if (isSuccess && hash && transactionContext) {
    transactionContext.updateTransactionStatus(hash, 'success')
  }
}, [isSuccess, hash, transactionContext])

useEffect(() => {
  if (writeError && hash && transactionContext) {
    transactionContext.updateTransactionStatus(hash, 'failed')
  }
}, [writeError, hash, transactionContext])

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Approvals</h2>
        <p className="text-gray-600">Connect your wallet to manage approvals.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Manage Approvals</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spender Address
          </label>
          <input
            type="text"
            value={spender}
            onChange={(e) => setSpender(e.target.value)}
            placeholder="0x1234567890123456789012345678901234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Address that will be allowed to spend your tokens
          </p>
        </div>

        {currentAllowance !== undefined && spender.length === 42 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-yellow-700 text-sm">
              Current Allowance: {formatUnits(currentAllowance as bigint, 18)} INR
            </p>
          </div>
        )}
        
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
            Amount the spender will be allowed to spend
          </p>
        </div>

       
        <div className="flex gap-2">
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
          <button
            onClick={() => setAmount('1000')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            1000 INR
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-500">Quick test addresses:</p>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setSpender(address || '')}
              className="text-left px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded font-mono"
            >
              Your own address: {address?.slice(0, 20)}...
            </button>
          </div>
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
            <p className="text-green-600 text-sm">✅ Transaction successful!</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Status: {isPending ? 'Waiting for confirmation...' : isConfirming ? 'Processing transaction...' : 'Ready'}
        </div>
        
        
        <div className="flex space-x-2">
          <button
            onClick={handleApprove}
            disabled={!spender || !amount || isPending || isConfirming}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? 'Waiting...' : isConfirming ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={handleRevoke}
            disabled={!spender || isPending || isConfirming}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? 'Waiting...' : isConfirming ? 'Processing...' : 'Revoke'}
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => alert('Approve test button works!')}
            className="flex-1 bg-gray-500 text-white py-1 px-2 rounded text-sm"
          >
            🧪 Test Approve Button
          </button>
          <button
            onClick={() => alert('Revoke test button works!')}
            className="flex-1 bg-gray-500 text-white py-1 px-2 rounded text-sm"
          >
            🧪 Test Revoke Button
          </button>
        </div>
      </div>
    </div>
  )
}