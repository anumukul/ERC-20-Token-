import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, ERC20_ABI, type Address } from '../contracts/contractConfig'
import { parseUnits, formatUnits } from 'viem'

export const TransferFromForm = () => {
  const { address, isConnected } = useAccount()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  
  const { data: hash, isPending, writeContract, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })


  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: from && address && from.length === 42 ? [from as Address, address] : undefined,
    query: {
      enabled: !!(from && address && from.length === 42),
    },
  })


  const { data: fromBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: from && from.length === 42 ? [from as Address] : undefined,
    query: {
      enabled: !!(from && from.length === 42),
    },
  })

  const handleTransferFrom = () => {
    console.log('TransferFrom button clicked!')
    alert('TransferFrom button clicked!')
    
    setError('')
    
   
    if (!from || !to || !amount) {
      setError('Please fill in all fields')
      return
    }

    if (!from.startsWith('0x') || from.length !== 42) {
      setError('Please enter a valid FROM address')
      return
    }

    if (!to.startsWith('0x') || to.length !== 42) {
      setError('Please enter a valid TO address')
      return
    }

    const amountNumber = parseFloat(amount)
    if (amountNumber <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    
    if (allowanceData) {
      const allowanceFormatted = parseFloat(formatUnits(allowanceData as bigint, 18))
      if (amountNumber > allowanceFormatted) {
        setError(`Insufficient allowance. You can spend ${allowanceFormatted.toFixed(4)} INR`)
        return
      }
    }

   
    if (fromBalance) {
      const balanceFormatted = parseFloat(formatUnits(fromBalance as bigint, 18))
      if (amountNumber > balanceFormatted) {
        setError(`Insufficient balance in FROM address. Balance: ${balanceFormatted.toFixed(4)} INR`)
        return
      }
    }

    try {
      const parsedAmount = parseUnits(amount, 18)
      
      console.log('Calling transferFrom:', {
        from,
        to,
        amount: parsedAmount.toString()
      })

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transferFrom',
        args: [from as Address, to as Address, parsedAmount],
      })
    } catch (err) {
      console.error('TransferFrom error:', err)
      setError(err instanceof Error ? err.message : 'TransferFrom failed')
    }
  }

  
  if (isSuccess && hash) {
    setTimeout(() => {
      setFrom('')
      setTo('')
      setAmount('')
      refetchAllowance()
    }, 3000)
  }

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">TransferFrom</h2>
        <p className="text-gray-600">Connect your wallet to use TransferFrom.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">TransferFrom</h2>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          Advanced
        </span>
      </div>
      
      <div className="space-y-4">
        
        <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
          <p className="text-purple-700 text-sm">
            <strong>TransferFrom</strong> allows you to spend tokens on behalf of another address 
            (if they have approved you). You must have sufficient allowance.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Address (Token Owner)
          </label>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="0x... (address that owns the tokens)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Address (Recipient)
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x... (where to send the tokens)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

       
        {from.length === 42 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-xs text-blue-600 font-medium">FROM Balance</p>
              <p className="text-sm text-blue-800">
                {fromBalance ? formatUnits(fromBalance as bigint, 18) : '0'} INR
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-xs text-green-600 font-medium">Your Allowance</p>
              <p className="text-sm text-green-800">
                {allowanceData ? formatUnits(allowanceData as bigint, 18) : '0'} INR
              </p>
            </div>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
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
          {allowanceData && (
            <button
              onClick={() => setAmount(formatUnits(allowanceData as bigint, 18))}
              className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 rounded"
            >
              Max Allowance
            </button>
          )}
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
            <p className="text-green-600 text-sm">✅ TransferFrom successful!</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Status: {isPending ? 'Waiting for confirmation...' : isConfirming ? 'Processing transaction...' : 'Ready'}
        </div>
        
      
        <button
          onClick={handleTransferFrom}
          disabled={!from || !to || !amount || isPending || isConfirming}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {isPending ? 'Waiting for Wallet...' : isConfirming ? 'Processing...' : 'Execute TransferFrom'}
        </button>

      
        <button
          onClick={() => alert('TransferFrom test button works!')}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded-md text-sm"
        >
          🧪 Test TransferFrom Button
        </button>
      </div>
    </div>
  )
}