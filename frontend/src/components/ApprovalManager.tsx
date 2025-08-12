"use client"

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { CONTRACT_ADDRESS, ERC20_ABI, type Address } from "../contracts/contractConfig"
import { parseUnits, formatUnits } from "viem"
import { useState, useContext, useEffect } from "react"
import { TransactionContext } from "./TransactionHistory"

export const ApprovalManager = () => {
  const { address, isConnected } = useAccount()
  const [spender, setSpender] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const transactionContext = useContext(TransactionContext)
  const { data: hash, isPending, writeContract, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && spender && spender.length === 42 ? [address, spender as Address] : undefined,
    query: {
      enabled: !!(address && spender && spender.length === 42),
    },
  })

  const handleApprove = () => {
    console.log("Approve button clicked!")
    alert("Approve button clicked!")

    setError("")

    if (!spender || !amount) {
      setError("Please fill in all fields")
      return
    }

    if (!spender.startsWith("0x") || spender.length !== 42) {
      setError("Please enter a valid Ethereum address")
      return
    }

    const amountNumber = Number.parseFloat(amount)
    if (amountNumber <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    try {
      const parsedAmount = parseUnits(amount, 18)

      console.log("Calling writeContract for approve with:", {
        address: CONTRACT_ADDRESS,
        functionName: "approve",
        args: [spender, parsedAmount.toString()],
      })

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender as Address, parsedAmount],
      })
    } catch (err) {
      console.error("Approval error:", err)
      setError(err instanceof Error ? err.message : "Approval failed")
    }
  }

  const handleRevoke = () => {
    console.log("Revoke button clicked!")
    alert("Revoke button clicked!")

    setError("")

    if (!spender) {
      setError("Please enter spender address")
      return
    }

    if (!spender.startsWith("0x") || spender.length !== 42) {
      setError("Please enter a valid Ethereum address")
      return
    }

    try {
      console.log("Calling writeContract for revoke with:", {
        address: CONTRACT_ADDRESS,
        functionName: "approve",
        args: [spender, "0"],
      })

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender as Address, 0n],
      })
    } catch (err) {
      console.error("Revoke error:", err)
      setError(err instanceof Error ? err.message : "Revoke failed")
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
        type: "Approval",
        status: "pending",
        timestamp: new Date().toISOString(),
        amount: amount,
        to: spender,
        from: address || undefined,
      })
    }
  }, [hash, transactionContext, spender, amount, address])

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

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
            Manage Approvals
          </h2>
          <p className="text-slate-600 text-lg">Connect your wallet to manage token approvals</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl shadow-xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Manage Approvals
        </h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Spender Address</label>
          <div className="relative">
            <input
              type="text"
              value={spender}
              onChange={(e) => setSpender(e.target.value)}
              placeholder="0x1234567890123456789012345678901234567890"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Address that will be allowed to spend your tokens
          </p>
        </div>

        {currentAllowance !== undefined && spender.length === 42 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <p className="text-amber-800 font-medium">
                Current Allowance: <span className="font-bold">{formatUnits(currentAllowance as bigint, 18)} INR</span>
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Amount (INR)</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.0"
              step="0.0001"
              min="0"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <span className="text-slate-500 font-medium text-sm">INR</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Amount the spender will be allowed to spend
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Quick Amount</p>
          <div className="flex gap-3">
            <button
              onClick={() => setAmount("10")}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              10 INR
            </button>
            <button
              onClick={() => setAmount("100")}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              100 INR
            </button>
            <button
              onClick={() => setAmount("1000")}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              1000 INR
            </button>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Quick Test Address
          </p>
          <button
            onClick={() => setSpender(address || "")}
            className="w-full text-left px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-mono text-xs transition-all duration-200"
          >
            <span className="text-slate-600">Your address:</span>{" "}
            <span className="text-slate-800 font-medium">{address?.slice(0, 20)}...</span>
          </button>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {writeError && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-red-700 font-medium">Error: {writeError.message}</p>
            </div>
          </div>
        )}

        {hash && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-blue-800 font-medium mb-1">Transaction Submitted!</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
                >
                  <span>
                    View on Etherscan: {hash.slice(0, 10)}...{hash.slice(-8)}
                  </span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-emerald-800 font-medium">Transaction Successful!</p>
            </div>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isPending || isConfirming ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}
            ></div>
            <p className="text-sm text-slate-600 font-medium">
              Status: {isPending ? "Waiting for confirmation..." : isConfirming ? "Processing transaction..." : "Ready"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleApprove}
            disabled={!spender || !amount || isPending || isConfirming}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isPending ? "Waiting..." : isConfirming ? "Processing..." : "Approve"}
          </button>
          <button
            onClick={handleRevoke}
            disabled={!spender || isPending || isConfirming}
            className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isPending ? "Waiting..." : isConfirming ? "Processing..." : "Revoke"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            onClick={() => alert("Approve test button works!")}
            className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            🧪 Test Approve
          </button>
          <button
            onClick={() => alert("Revoke test button works!")}
            className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            🧪 Test Revoke
          </button>
        </div>
      </div>
    </div>
  )
}
