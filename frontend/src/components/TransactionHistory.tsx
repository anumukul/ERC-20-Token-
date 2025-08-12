import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { CONTRACT_ADDRESS } from '../contracts/contractConfig'

interface Transaction {
  hash: string
  type: 'Transfer' | 'Approval' | 'TransferFrom'
  status: 'pending' | 'success' | 'failed'
  timestamp: string
  amount?: string
  to?: string
  from?: string
}

export const TransactionHistory = () => {
  const { address } = useAccount()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  
  useEffect(() => {
    
    const stored = localStorage.getItem(`txHistory-${address}`)
    if (stored) {
      setTransactions(JSON.parse(stored))
    }
  }, [address])

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => {
      const updated = [tx, ...prev.slice(0, 19)] 
      localStorage.setItem(`txHistory-${address}`, JSON.stringify(updated))
      return updated
    })
  }

  const clearHistory = () => {
    setTransactions([])
    localStorage.removeItem(`txHistory-${address}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
        <button
          onClick={clearHistory}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 border rounded"
        >
          Clear
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📜</div>
            <p>No transaction history yet</p>
            <p className="text-sm">Your transactions will appear here</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.hash}
              className="p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded font-semibold ${
                      tx.type === 'Transfer'
                        ? 'bg-blue-100 text-blue-700'
                        : tx.type === 'Approval'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {tx.type}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      tx.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : tx.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{tx.timestamp}</span>
              </div>
              
              {tx.amount && (
                <p className="text-sm text-gray-700 mb-1">
                  Amount: <span className="font-semibold">{tx.amount} INR</span>
                </p>
              )}
              
              <div className="text-xs text-gray-500">
                <a
                  href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)} →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}