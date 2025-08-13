"use client"

import { useState } from "react"
import { useWatchContractEvent, useAccount } from "wagmi"
import { CONTRACT_ADDRESS, ERC20_ABI } from "../contracts/contractConfig"
import { formatUnits } from "viem"

interface EventLog {
  id: string
  event: string
  from: string
  to: string
  amount: string
  timestamp: string
  txHash: string
}

export const EventListener = () => {
  const { address } = useAccount()
  const [events, setEvents] = useState<EventLog[]>([])

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    eventName: "Transfer",
    onLogs: (logs) => {
      console.log("🔥 Transfer events detected:", logs)

      logs.forEach((log: any) => {
        const { args, transactionHash } = log
        console.log("Transfer args:", args)

        if (args && transactionHash) {
          const newEvent: EventLog = {
            id: `transfer-${transactionHash}-${Date.now()}`,
            event: "Transfer",
            from: args.from || args[0] || "Unknown",
            to: args.to || args[1] || "Unknown",
            amount: args.amount ? formatUnits(args.amount, 18) : args[2] ? formatUnits(args[2], 18) : "0",
            timestamp: new Date().toLocaleTimeString(),
            txHash: transactionHash,
          }

          console.log("Adding Transfer event:", newEvent)
          setEvents((prev) => [newEvent, ...prev.slice(0, 19)])
        }
      })
    },
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    eventName: "Approval",
    onLogs: (logs) => {
      console.log("🔥 Approval events detected:", logs)

      logs.forEach((log: any) => {
        const { args, transactionHash } = log
        console.log("Approval args:", args)

        if (args && transactionHash) {
          const newEvent: EventLog = {
            id: `approval-${transactionHash}-${Date.now()}`,
            event: "Approval",
            from: args.from || args[0] || "Unknown",
            to: args.to || args[1] || "Unknown",
            amount: args.amount ? formatUnits(args.amount, 18) : args[2] ? formatUnits(args[2], 18) : "0",
            timestamp: new Date().toLocaleTimeString(),
            txHash: transactionHash,
          }

          console.log("Adding Approval event:", newEvent)
          setEvents((prev) => [newEvent, ...prev.slice(0, 19)])
        }
      })
    },
  })

  const clearEvents = () => {
    setEvents([])
    console.log("Events cleared")
  }

  const truncateAddress = (addr: string) => {
    if (!addr || addr === "Unknown") return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const isUserAddress = (addr: string) => {
    return address && addr && addr.toLowerCase() === address.toLowerCase()
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50 shadow-2xl border border-white/20 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-emerald-500/5"></div>

      <div className="relative p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <div className="text-white text-xl">📡</div>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Live Events Monitor
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                  <span className="text-sm font-semibold text-emerald-700">Live • {events.length} events</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={clearEvents}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:text-gray-800 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-lg">
                  <div className="text-4xl">👂</div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Listening for Events</h3>
              <p className="text-gray-600 mb-6">Make a transaction to see real-time events appear!</p>

              <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-sm">✨</span>
                  </div>
                  <h4 className="font-semibold text-blue-800">Auto-detected Events</h4>
                </div>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Token Transfers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>Approval Grants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>TransferFrom Executions</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            events.map((event, index) => (
              <div
                key={event.id}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-xl ${
                  event.event === "Transfer"
                    ? "bg-gradient-to-br from-blue-50 via-white to-blue-50 border-l-4 border-blue-400 shadow-lg hover:shadow-blue-200/50"
                    : "bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-l-4 border-emerald-400 shadow-lg hover:shadow-emerald-200/50"
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: index < 3 ? "slideInFromTop 0.6s ease-out" : "none",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>

                <div className="relative p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                          event.event === "Transfer"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600"
                            : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                        }`}
                      >
                        <span className="text-white text-sm">{event.event === "Transfer" ? "💸" : "✅"}</span>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                            event.event === "Transfer"
                              ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300"
                              : "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              event.event === "Transfer" ? "bg-blue-500" : "bg-emerald-500"
                            } animate-pulse`}
                          ></div>
                          {event.event}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-lg">
                        {event.timestamp}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">From</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg border">
                          {truncateAddress(event.from)}
                        </span>
                        {isUserAddress(event.from) && (
                          <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full font-bold shadow-sm">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">To</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg border">
                          {truncateAddress(event.to)}
                        </span>
                        {isUserAddress(event.to) && (
                          <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full font-bold shadow-sm">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <span className="text-sm font-semibold text-gray-700">Amount</span>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {Number.parseFloat(event.amount).toFixed(4)}
                        </div>
                        <div className="text-xs text-gray-500 font-semibold">INR</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200/50">
                    <div className="flex justify-between items-center">
                      <a
                        href={`https://sepolia.etherscan.io/tx/${event.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
                      >
                        <span>View on Etherscan</span>
                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
                      </a>
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                        {event.txHash.slice(0, 8)}...{event.txHash.slice(-6)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {events.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 text-center font-medium">
              Displaying {events.length} most recent events • Real-time updates active
            </p>
          </div>
        )}
      </div>

      <style>{`
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
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  )
}
