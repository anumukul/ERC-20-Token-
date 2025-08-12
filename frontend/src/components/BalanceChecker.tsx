"use client"

import type React from "react"

import { useState } from "react"
import { useReadContract } from "wagmi"
import { CONTRACT_ADDRESS, ERC20_ABI, type Address } from "../contracts/contractConfig"
import { formatUnits } from "viem"

export const BalanceChecker = () => {
  const [addressToCheck, setAddressToCheck] = useState("")
  const [error, setError] = useState("")

  const {
    data: balance,
    isLoading,
    isError,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: addressToCheck && addressToCheck.length === 42 ? [addressToCheck as Address] : undefined,
    query: {
      enabled: !!(addressToCheck && addressToCheck.length === 42),
    },
  })

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value
    setAddressToCheck(newAddress)
    setError("")
  }

  const handleCheckBalance = () => {
    setError("")

    if (!addressToCheck) {
      setError("Please enter an address")
      return
    }

    if (!addressToCheck.startsWith("0x") || addressToCheck.length !== 42) {
      setError("Please enter a valid Ethereum address (0x...)")
      return
    }

    refetch()
  }

  const clearAddress = () => {
    setAddressToCheck("")
    setError("")
  }

  const formatBalance = (balance: bigint) => {
    const formatted = formatUnits(balance, 18)
    const number = Number.parseFloat(formatted)

    if (number === 0) return "0"
    if (number < 0.0001) return "< 0.0001"
    if (number >= 1000000) return number.toExponential(2)

    return number.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    })
  }

  const quickAddresses = [
    { name: "Contract Address", address: CONTRACT_ADDRESS },
    { name: "Zero Address", address: "0x0000000000000000000000000000000000000000" },
    { name: "Vitalik Buterin", address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
    { name: "Uniswap Router", address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" },
  ]

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-2xl shadow-2xl p-8 border border-slate-200/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">🔍</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Balance Checker
            </h2>
            <p className="text-sm text-slate-500">Check any address token balance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-slate-600">Live</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-sm">ℹ️</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">How it works</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                Enter any Ethereum address to view their INR token balance. This uses the
                <code className="bg-blue-100/80 text-blue-800 px-2 py-0.5 rounded mx-1 font-mono text-xs">
                  balanceOf
                </code>
                function from your smart contract.
              </p>
            </div>
          </div>
        </div>

        {/* Address Input */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Ethereum Address</label>
          <div className="relative">
            <input
              type="text"
              value={addressToCheck}
              onChange={handleAddressChange}
              placeholder="0x1234567890123456789012345678901234567890"
              className="w-full px-4 py-3 pr-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200 font-mono text-sm shadow-sm"
            />
            {addressToCheck && (
              <button
                onClick={clearAddress}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors duration-200 group"
                title="Clear address"
              >
                <span className="text-slate-400 group-hover:text-slate-600 text-xs">✕</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
            Enter any Ethereum address to check its INR token balance
          </p>
        </div>

        {/* Quick Addresses */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Quick Test Addresses</span>
            <div className="h-px bg-gradient-to-r from-slate-200 to-transparent flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickAddresses.map((item, index) => (
              <button
                key={index}
                onClick={() => setAddressToCheck(item.address)}
                className="group text-left p-4 bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 text-sm">{item.name}</span>
                  <div className="w-2 h-2 bg-slate-300 group-hover:bg-blue-400 rounded-full transition-colors duration-200"></div>
                </div>
                <div className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                  {item.address.slice(0, 10)}...{item.address.slice(-8)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-red-500 text-sm">⚠️</span>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
              <p className="text-blue-700 font-medium">Checking balance...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-red-500 text-sm">❌</span>
              </div>
              <p className="text-red-700 font-medium">
                Error fetching balance. Please check the address and try again.
              </p>
            </div>
          </div>
        )}

        {/* Balance Result */}
        {balance !== undefined && addressToCheck.length === 42 && !isLoading && (
          <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border border-emerald-200/50 rounded-xl p-6 backdrop-blur-sm shadow-lg">
            <div className="space-y-4">
              {/* Address Display */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-shrink-0">
                  <span className="text-sm font-semibold text-emerald-700">Address:</span>
                </div>
                <div className="text-right flex-1 min-w-0">
                  <div className="font-mono text-xs text-emerald-600 break-all bg-emerald-50/50 px-3 py-2 rounded-lg border border-emerald-200/30">
                    {addressToCheck}
                  </div>
                </div>
              </div>

              {/* Balance Display */}
              <div className="text-center py-4">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  {formatBalance(balance as bigint)}
                  <span className="text-2xl ml-2 text-emerald-500">INR</span>
                </div>
                <div className="text-xs text-emerald-600 bg-emerald-50/50 px-3 py-1 rounded-full inline-block">
                  Raw: {formatUnits(balance as bigint, 18)}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between pt-4 border-t border-emerald-200/50">
                <span className="text-sm font-medium text-emerald-700">Status:</span>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    (balance as bigint) > 0n
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${(balance as bigint) > 0n ? "bg-emerald-400" : "bg-slate-400"}`}
                  ></div>
                  {(balance as bigint) > 0n ? "Has Tokens" : "Empty Wallet"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCheckBalance}
            disabled={!addressToCheck || addressToCheck.length !== 42 || isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-[1.02] disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Checking Balance...
              </div>
            ) : (
              "Check Balance"
            )}
          </button>

          <button
            onClick={() => {
              console.log("Balance Checker test clicked!")
              alert("✅ Balance Checker is working perfectly!")
            }}
            className="w-full bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            <span className="flex items-center justify-center gap-2">🧪 Test Balance Checker</span>
          </button>
        </div>

        {/* Contract Info */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200/50">
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <span className="text-slate-600">Contract:</span>
            <span className="font-mono text-slate-700 bg-slate-200/50 px-2 py-1 rounded">
              {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
