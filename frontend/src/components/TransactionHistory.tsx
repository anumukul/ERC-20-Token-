"use client"

import type React from "react"

import { useState, useEffect, useContext, createContext } from "react"
import { useAccount } from "wagmi"

interface Transaction {
  hash: string
  type: "Transfer" | "Approval" | "TransferFrom"
  status: "pending" | "success" | "failed"
  timestamp: string
  amount?: string
  to?: string
  from?: string
  blockNumber?: number
}

interface TransactionContextType {
  addTransaction: (tx: Transaction) => void
  transactions: Transaction[]
  updateTransactionStatus: (hash: string, status: "success" | "failed", blockNumber?: number) => void
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
          console.error("Failed to parse stored transactions:", e)
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
    setTransactions((prev) => {
      const exists = prev.find((t) => t.hash === tx.hash)
      if (exists) return prev

      const updated = [tx, ...prev.slice(0, 49)]
      return updated
    })
  }

  const updateTransactionStatus = (hash: string, status: "success" | "failed", blockNumber?: number) => {
    setTransactions((prev) => prev.map((tx) => (tx.hash === hash ? { ...tx, status, blockNumber } : tx)))
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
    throw new Error("TransactionHistory must be used within TransactionProvider")
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
      case "success":
        return (
          <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
      case "pending":
        return (
          <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm animate-pulse">
            <svg className="w-3 h-3 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )
      case "failed":
        return (
          <div className="w-6 h-6 bg-gradient-to-r from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-6 h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">?</span>
          </div>
        )
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Transfer":
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        )
      case "Approval":
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )
      case "TransferFrom":
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        )
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
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl"></div>

      <div className="relative backdrop-blur-sm bg-white/90 rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Transaction History
              </h2>
              <p className="text-sm text-gray-500 mt-1">Track your Web3 transactions</p>
            </div>
            <div className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full shadow-sm">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {transactions.length} total
              </span>
            </div>
          </div>
          {transactions.length > 0 && (
           
            <button
              onClick={clearHistory}
              className="group px-4 py-2 text-sm font-medium text-gray-600 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border-red-200 hover:text-red-600 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear All
              </span>
            </button>
          )}
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
          {transactions.length === 0 ? (
           
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No transaction history yet</h3>
              <p className="text-gray-500 mb-6">Your transactions will appear here automatically</p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-800 mb-1">💡 Tip</p>
                    <p className="text-xs text-blue-600">
                      Transaction history is stored locally and will persist between sessions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            transactions.map((tx, index) => (
             
              <div
                key={`${tx.hash}-${index}`}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  tx.status === "success"
                    ? "bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-green-200/50 hover:from-green-50 hover:to-emerald-50 hover:border-green-300"
                    : tx.status === "pending"
                      ? "bg-gradient-to-r from-yellow-50/50 to-orange-50/50 border-yellow-200/50 hover:from-yellow-50 hover:to-orange-50 hover:border-yellow-300"
                      : "bg-gradient-to-r from-red-50/50 to-rose-50/50 border-red-200/50 hover:from-red-50 hover:to-rose-50 hover:border-red-300"
                }`}
                style={{
                  animation: `slideInFromTop 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      {getTypeIcon(tx.type)}
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            tx.type === "Transfer"
                              ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800"
                              : tx.type === "Approval"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                                : "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800"
                          }`}
                        >
                          {tx.type}
                        </span>
                        {getStatusIcon(tx.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            tx.status === "success"
                              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                              : tx.status === "pending"
                                ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800"
                                : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800"
                          }`}
                        >
                          {tx.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-lg">
                        {formatTimestamp(tx.timestamp)}
                      </span>
                    </div>
                  </div>

                  {(tx.amount || tx.to || tx.from) && (
                   
                    <div className="space-y-2 mb-4 p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
                      {tx.amount && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Amount:</span>
                          <span className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            {tx.amount} INR
                          </span>
                        </div>
                      )}
                      {tx.to && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">To:</span>
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-lg">
                            {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                          </span>
                        </div>
                      )}
                      {tx.from && tx.from !== address && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">From:</span>
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-lg">
                            {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-white/30">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <span className="group-hover/link:underline">View on Etherscan</span>
                    </a>
                    <span className="text-xs text-gray-400 font-mono bg-gray-100/60 px-2 py-1 rounded-lg">
                      {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {transactions.length > 0 && (
          
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Showing {transactions.length} transactions • History is saved locally
            </p>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
