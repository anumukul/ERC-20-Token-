"use client"

import { useState, useContext, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { CONTRACT_ADDRESS, ERC20_ABI, type Address } from "../contracts/contractConfig"
import { parseUnits, formatUnits } from "viem"
import { TransactionContext } from "./TransactionHistory"

export const TransferFromForm = () => {
  const { address, isConnected } = useAccount()
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")

  const transactionContext = useContext(TransactionContext)

  const { data: hash, isPending, writeContract, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: from && address && from.length === 42 ? [from as Address, address] : undefined,
    query: {
      enabled: !!(from && address && from.length === 42),
    },
  })

  const { data: fromBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: from && from.length === 42 ? [from as Address] : undefined,
    query: {
      enabled: !!(from && from.length === 42),
    },
  })

  useEffect(() => {
    if (hash && transactionContext && from && to && amount) {
      transactionContext.addTransaction({
        hash: hash,
        type: "TransferFrom",
        status: "pending",
        timestamp: new Date().toISOString(),
        amount: amount,
        to: to,
        from: from,
      })
    }
  }, [hash, transactionContext, from, to, amount])

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

  const handleTransferFrom = () => {
    console.log("TransferFrom button clicked!")

    setError("")

    if (!from || !to || !amount) {
      setError("Please fill in all fields")
      return
    }

    if (!from.startsWith("0x") || from.length !== 42) {
      setError("Please enter a valid FROM address")
      return
    }

    if (!to.startsWith("0x") || to.length !== 42) {
      setError("Please enter a valid TO address")
      return
    }

    const amountNumber = Number.parseFloat(amount)
    if (amountNumber <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    if (allowanceData) {
      const allowanceFormatted = Number.parseFloat(formatUnits(allowanceData as bigint, 18))
      if (amountNumber > allowanceFormatted) {
        setError(`Insufficient allowance. You can spend ${allowanceFormatted.toFixed(4)} INR`)
        return
      }
    }

    if (fromBalance) {
      const balanceFormatted = Number.parseFloat(formatUnits(fromBalance as bigint, 18))
      if (amountNumber > balanceFormatted) {
        setError(`Insufficient balance in FROM address. Balance: ${balanceFormatted.toFixed(4)} INR`)
        return
      }
    }

    try {
      const parsedAmount = parseUnits(amount, 18)

      console.log("Calling transferFrom:", {
        from,
        to,
        amount: parsedAmount.toString(),
      })

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: "transferFrom",
        args: [from as Address, to as Address, parsedAmount],
      })
    } catch (err) {
      console.error("TransferFrom error:", err)
      setError(err instanceof Error ? err.message : "TransferFrom failed")
    }
  }

  if (isSuccess && hash) {
    setTimeout(() => {
      setFrom("")
      setTo("")
      setAmount("")
      refetchAllowance()
    }, 3000)
  }

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          TransferFrom
        </h2>
        <p className="text-gray-600">Connect your wallet to use TransferFrom.</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          TransferFrom
        </h2>
        <span className="flex items-center gap-2 text-xs bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200/50">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Advanced Transfer
        </span>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-purple-700 text-sm leading-relaxed">
              <strong>TransferFrom</strong> allows you to spend tokens on behalf of another address (if they have
              approved you). You must have sufficient allowance.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">From Address (Token Owner)</label>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="0x... (address that owns the tokens)"
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">To Address (Recipient)</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x... (where to send the tokens)"
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
          />
        </div>

        {from.length === 42 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-xs text-blue-600 font-semibold">FROM Balance</p>
              </div>
              <p className="text-lg font-bold text-blue-800">
                {fromBalance ? formatUnits(fromBalance as bigint, 18) : "0"} INR
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 backdrop-blur-sm p-4 rounded-xl border border-emerald-200/50">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs text-emerald-600 font-semibold">Your Allowance</p>
              </div>
              <p className="text-lg font-bold text-emerald-800">
                {allowanceData ? formatUnits(allowanceData as bigint, 18) : "0"} INR
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Amount (INR)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1.0"
            step="0.0001"
            min="0"
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setAmount("1")}
            className="px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg transition-all duration-200 font-medium text-gray-700 border border-gray-300/50"
          >
            1 INR
          </button>
          <button
            onClick={() => setAmount("10")}
            className="px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg transition-all duration-200 font-medium text-gray-700 border border-gray-300/50"
          >
            10 INR
          </button>
          {allowanceData && (
            <button
              onClick={() => setAmount(formatUnits(allowanceData as bigint, 18))}
              className="px-4 py-2 text-sm bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 rounded-lg transition-all duration-200 font-medium text-purple-700 border border-purple-300/50"
            >
              Max Allowance
            </button>
          )}
        </div>

        {hash && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <p className="text-purple-700 text-sm font-semibold mb-1">Transaction Status Tracking</p>
                <p className="text-purple-600 text-xs">
                  This TransferFrom transaction will appear in your Transaction History with real-time updates!
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

       {writeError && (
  <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-xl p-4 backdrop-blur-sm">
    <div className="flex items-start gap-3">
      <svg
        className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-red-600 text-sm font-medium">
        Error: {typeof writeError === "object" && writeError !== null && "message" in writeError
          ? (writeError as { message: string }).message
          : String(writeError)}
      </p>
    </div>
  </div>
)}

        {hash && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-1">Transaction submitted!</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm underline hover:text-blue-800 transition-colors"
                >
                  View on Etherscan: {hash.slice(0, 10)}...{hash.slice(-8)}
                </a>
              </div>
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-emerald-600 text-sm font-semibold mb-1">TransferFrom successful!</p>
                <p className="text-emerald-500 text-xs">Check Transaction History below for details!</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50/50 rounded-lg px-3 py-2">
          <div
            className={`w-2 h-2 rounded-full ${isPending || isConfirming ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`}
          ></div>
          Status: {isPending ? "Waiting for confirmation..." : isConfirming ? "Processing transaction..." : "Ready"}
        </div>

        <button
          onClick={handleTransferFrom}
          disabled={!from || !to || !amount || isPending || isConfirming}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
        >
          {isPending ? "Waiting for Wallet..." : isConfirming ? "Processing..." : "Execute TransferFrom"}
        </button>

        <button
          onClick={() => alert("✅ TransferFrom test successful!")}
          className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.01]"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"
              />
            </svg>
            Test TransferFrom Button
          </span>
        </button>
      </div>
    </div>
  )
}
