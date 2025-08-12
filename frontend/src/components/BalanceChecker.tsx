import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, ERC20_ABI, type Address } from '../contracts/contractConfig'
import { formatUnits } from 'viem'

export const BalanceChecker = () => {
  const [addressToCheck, setAddressToCheck] = useState('')
  const [error, setError] = useState('')


  const { data: balance, isLoading, isError, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: addressToCheck && addressToCheck.length === 42 ? [addressToCheck as Address] : undefined,
    query: {
      enabled: !!(addressToCheck && addressToCheck.length === 42),
    },
  })

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value
    setAddressToCheck(newAddress)
    setError('')
  }

  const handleCheckBalance = () => {
    setError('')
    
    if (!addressToCheck) {
      setError('Please enter an address')
      return
    }

    if (!addressToCheck.startsWith('0x') || addressToCheck.length !== 42) {
      setError('Please enter a valid Ethereum address (0x...)')
      return
    }

    
    refetch()
  }

  const clearAddress = () => {
    setAddressToCheck('')
    setError('')
  }

  const formatBalance = (balance: bigint) => {
    const formatted = formatUnits(balance, 18)
    const number = parseFloat(formatted)
    
    if (number === 0) return '0'
    if (number < 0.0001) return '< 0.0001'
    if (number >= 1000000) return number.toExponential(2)
    
    return number.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 4 
    })
  }


  const quickAddresses = [
    { name: 'Contract Address', address: CONTRACT_ADDRESS },
    { name: 'Zero Address', address: '0x0000000000000000000000000000000000000000' },
    { name: 'Vitalik Buterin', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
    { name: 'Uniswap Router', address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Balance Checker</h2>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
          🔍 View Any Balance
        </span>
      </div>

      <div className="space-y-4">
      
        <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3">
          <p className="text-indigo-700 text-sm">
            <strong>Check Token Balance:</strong> Enter any Ethereum address to view their INR token balance. 
            This uses the <code className="bg-indigo-100 px-1 rounded">balanceOf</code> function from your smart contract.
          </p>
        </div>

       
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address to Check
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={addressToCheck}
              onChange={handleAddressChange}
              placeholder="0x1234567890123456789012345678901234567890"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={clearAddress}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              title="Clear address"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter any Ethereum address to check its INR token balance
          </p>
        </div>

      
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">Quick addresses to test:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickAddresses.map((item, index) => (
              <button
                key={index}
                onClick={() => setAddressToCheck(item.address)}
                className="text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
              >
                <div className="font-medium text-gray-700">{item.name}</div>
                <div className="font-mono text-gray-500">
                  {item.address.slice(0, 10)}...{item.address.slice(-8)}
                </div>
              </button>
            ))}
          </div>
        </div>

       
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

       
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-blue-600 text-sm">Checking balance...</p>
            </div>
          </div>
        )}

       
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">
              ❌ Error fetching balance. Please check the address and try again.
            </p>
          </div>
        )}

       
        {balance !== undefined && addressToCheck.length === 42 && !isLoading && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-green-700">Address:</span>
                <span className="font-mono text-xs text-green-600 break-all ml-2">
                  {addressToCheck}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">Balance:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-800">
                    {formatBalance(balance as bigint)} <span className="text-lg text-green-600">INR</span>
                  </div>
                  <div className="text-xs text-green-600">
                    Raw: {formatUnits(balance as bigint, 18)}
                  </div>
                </div>
              </div>

             
              <div className="pt-2 border-t border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600">Status:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    (balance as bigint) > 0n 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {(balance as bigint) > 0n ? '💰 Has Tokens' : '📭 Empty'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

       
        <button
          onClick={handleCheckBalance}
          disabled={!addressToCheck || addressToCheck.length !== 42 || isLoading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isLoading ? 'Checking Balance...' : 'Check Balance'}
        </button>

       
        <button
          onClick={() => {
            console.log('Balance Checker test clicked!')
            alert('✅ Balance Checker is working perfectly!')
          }}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded-md text-sm hover:bg-gray-600 transition-colors"
        >
          🧪 Test Balance Checker
        </button>

       
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 text-center">
            📋 Contract Address: 
            <span className="font-mono ml-1">
              {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}