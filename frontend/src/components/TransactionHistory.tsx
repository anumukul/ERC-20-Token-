import { useState, useEffect, useContext, createContext } from 'react'
import { useAccount } from 'wagmi'

interface Transaction {
  hash: string
  type: 'Transfer' | 'Approval' | 'TransferFrom'
  status: 'pending' | 'success' | 'failed'
  timestamp: string
  amount?: string
  to?: string
  from?: string
  blockNumber?: number
}


interface TransactionContextType {
  addTransaction: (tx: Transaction) => void
  transactions: Transaction[]
  updateTransactionStatus: (hash: string, status: 'success' | 'failed', blockNumber?: number) => void
}

export const TransactionContext = createContext<TransactionContextType | null>(null)

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount()
  const [transactions, setTransactions] = useState<Transaction[]>([])


  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`txHistory-${address}`)
      if (stored) {
        try {
          setTransactions(JSON.parse(stored))
        } catch (e) {
          console.error('Failed to parse stored transactions:', e)
        }
      }
    } else {
      setTransactions([])
    }
  }, [address])


  useEffect(() => {
    if (address && transactions.length > 0) {
      localStorage.setItem(`txHistory-${address}`, JSON.stringify(transactions))
    }
  }, [transactions, address])

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => {
     
      const exists = prev.find(t => t.hash === tx.hash)
      if (exists) return prev
      
      const updated = [tx, ...prev.slice(0, 49)] 
      return updated
    })
  }

  const updateTransactionStatus = (hash: string, status: 'success' | 'failed', blockNumber?: number) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.hash === hash 
          ? { ...tx, status, blockNumber }
          : tx
      )
    )
  }

  return (
    <TransactionContext.Provider value={{ addTransaction, transactions, updateTransactionStatus }}>
      {children}
    </TransactionContext.Provider>
  )
}

export const TransactionHistory = () => {
  const { address } = useAccount()
  const context = useContext(TransactionContext)
  
  if (!context) {
    throw new Error('TransactionHistory must be used within TransactionProvider')
  }

  const { transactions } = context

  const clearHistory = () => {
    if (address) {
      localStorage.removeItem(`txHistory-${address}`)
      window.location.reload() 
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'pending': return '⏳'
      case 'failed': return '❌'
      default: return '❓'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Transfer': return '📤'
      case 'Approval': return '✋'
      case 'TransferFrom': return '🔄'
      default: return '📝'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return timestamp
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {transactions.length} total
          </span>
        </div>
        {transactions.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm text-gray-500 hover:text-red-600 px-3 py-1 border rounded hover:border-red-300 hover:bg-red-50"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📜</div>
            <p className="font-medium">No transaction history yet</p>
            <p className="text-sm">Your transactions will appear here automatically</p>
            <div className="mt-4 text-xs bg-yellow-50 p-3 rounded-lg">
              <p className="text-yellow-700">
                💡 Tip: Transaction history is stored locally and will persist between sessions
              </p>
            </div>
          </div>
        ) : (
          transactions.map((tx, index) => (
            <div
              key={`${tx.hash}-${index}`}
              className={`p-4 border rounded-lg transition-all duration-200 ${
                tx.status === 'success' 
                  ? 'hover:bg-green-50 border-green-200' 
                  : tx.status === 'pending'
                  ? 'hover:bg-yellow-50 border-yellow-200'
                  : 'hover:bg-red-50 border-red-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getTypeIcon(tx.type)}
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      tx.type === 'Transfer'
                        ? 'bg-blue-100 text-blue-800'
                        : tx.type === 'Approval'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {tx.type}
                  </span>
                  <span className="text-lg">
                    {getStatusIcon(tx.status)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      tx.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : tx.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {tx.status.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(tx.timestamp)}
                </span>
              </div>
              
              {(tx.amount || tx.to || tx.from) && (
                <div className="space-y-1 mb-3 text-sm">
                  {tx.amount && (
                    <p className="text-gray-700">
                      <span className="font-medium">Amount:</span> 
                      <span className="font-bold ml-2">{tx.amount} INR</span>
                    </p>
                  )}
                  {tx.to && (
                    <p className="text-gray-700">
                      <span className="font-medium">To:</span> 
                      <span className="font-mono text-xs ml-2">
                        {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                      </span>
                    </p>
                  )}
                  {tx.from && tx.from !== address && (
                    <p className="text-gray-700">
                      <span className="font-medium">From:</span> 
                      <span className="font-mono text-xs ml-2">
                        {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                      </span>
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <a
                  href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  <span>View on Etherscan</span>
                  <span>↗</span>
                </a>
                <span className="text-xs text-gray-400 font-mono">
                  {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {transactions.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Showing {transactions.length} transactions • History is saved locally
          </p>
        </div>
      )}
    </div>
  )
}