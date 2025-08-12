"use client"

import { useState, useContext, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { CONTRACT_ADDRESS, ERC20_ABI, type Address } from "../contracts/contractConfig"
import { parseUnits, formatUnits } from "viem"
import { useTokenBalance } from "../hooks/useTokenBalance"
import { TransactionContext } from "./TransactionHistory"

export const TransferForm = () => {
  const { address, isConnected } = useAccount()
  const [to, setTo] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")

  const { balance, refetch: refetchBalance } = useTokenBalance(address)
  const transactionContext = useContext(TransactionContext)

  const { data: hash, isPending, writeContract, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (hash && transactionContext && to && amount) {
      transactionContext.addTransaction({
        hash: hash,
        type: "Transfer",
        status: "pending",
        timestamp: new Date().toISOString(),
        amount: amount,
        to: to,
        from: address || undefined,
      })
    }
  }, [hash, transactionContext, to, amount, address])

  useEffect(() => {
    if (isSuccess && hash && transactionContext) {
      transactionContext.updateTransactionStatus(hash, "success")
    }
  }, [isSuccess, hash, transactionContext])

  useEffect(() => {
    if (writeError && hash && transactionContext) {
      transactionContext.updateTransactionStatus(hash, "failed")
    }
  }, [writeError, hash, transactionContext])

  const handleTransfer = () => {
    console.log("Transfer button clicked!")

    setError("")

    if (!to || !amount) {
      setError("Please fill in all fields")
      return
    }

    if (!to.startsWith("0x") || to.length !== 42) {
      setError("Please enter a valid Ethereum address")
      return
    }

    const amountNumber = Number.parseFloat(amount)
    if (amountNumber <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    if (balance) {
      const balanceFormatted = Number.parseFloat(formatUnits(balance, 18))
      if (amountNumber > balanceFormatted) {
        setError(`Insufficient balance. You have ${balanceFormatted.toFixed(4)} INR`)
        return
      }
    }

    try {
      const parsedAmount = parseUnits(amount, 18)

      console.log("Calling writeContract with:", {
        address: CONTRACT_ADDRESS,
        functionName: "transfer",
        args: [to, parsedAmount.toString()],
      })

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [to as Address, parsedAmount],
      })
    } catch (err) {
      console.error("Transfer error:", err)
      setError(err instanceof Error ? err.message : "Transfer failed")
    }
  }

  if (isSuccess && hash) {
    setTimeout(() => {
      setTo("")
      setAmount("")
      refetchBalance()
    }, 3000)
  }

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
            Transfer Tokens
          </h2>
          <p className="text-slate-600 text-lg">Connect your wallet to transfer tokens.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Transfer Tokens
        </h2>
        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Direct Transfer
        </span>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <p className="text-blue-800 font-semibold">
              Your Balance: <span className="font-bold">{balance ? formatUnits(balance, 18) : "0"} INR</span>
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Recipient Address</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x1234567890123456789012345678901234567890"
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Amount (INR)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1.0"
            step="0.0001"
            min="0"
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400"
          />
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Try a small amount first, like 1 or 10 tokens
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setAmount("1")}
            className="flex-1 px-4 py-2 text-sm font-medium bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-lg transition-all duration-200 hover:scale-105"
          >
            1 INR
          </button>
          <button
            onClick={() => setAmount("10")}
            className="flex-1 px-4 py-2 text-sm font-medium bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-lg transition-all duration-200 hover:scale-105"
          >
            10 INR
          </button>
          <button
            onClick={() => setAmount("100")}
            className="flex-1 px-4 py-2 text-sm font-medium bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-lg transition-all duration-200 hover:scale-105"
          >
            100 INR
          </button>
        </div>

        {hash && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-purple-800 font-semibold mb-1">Transaction Status Tracking</p>
                <p className="text-purple-600 text-sm">
                  This transaction will appear in your Transaction History below with real-time status updates!
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {writeError && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-red-700 font-medium">Error: {writeError.message}</p>
            </div>
          </div>
        )}

        {hash && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <div>
                <p className="text-blue-800 font-semibold mb-1">Transaction submitted!</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200"
                >
                  View on Etherscan: {hash.slice(0, 10)}...{hash.slice(-8)}
                </a>
              </div>
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-green-800 font-semibold mb-1">Transfer successful!</p>
                <p className="text-green-600 text-sm">Check Transaction History below for details!</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div
            className={`w-2 h-2 rounded-full ${isPending || isConfirming ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`}
          ></div>
          Status: {isPending ? "Waiting for confirmation..." : isConfirming ? "Processing transaction..." : "Ready"}
        </div>

        <button
          onClick={handleTransfer}
          disabled={!to || !amount || isPending || isConfirming}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-[1.02] disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Waiting for Wallet...
            </span>
          ) : isConfirming ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Processing...
            </span>
          ) : (
            "Transfer Tokens"
          )}
        </button>

        <button
          onClick={() => {
            console.log("Test button clicked - TransferForm is working!")
            alert("✅ TransferForm test successful!")
          }}
          className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Test Transfer Form
        </button>
      </div>
    </div>
  )
}
