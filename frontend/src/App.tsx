"use client"

import { WagmiProvider } from "wagmi"
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { sepolia } from "wagmi/chains"

import { WalletConnection } from "./components/WalletConnection"
import { TokenDashboard } from "./components/TokenDashboard"
import { TransferForm } from "./components/TransferForm"
import { ApprovalManager } from "./components/ApprovalManager"
import { TransferFromForm } from "./components/TransferFromForm"
import { BalanceChecker } from "./components/BalanceChecker"
import { TransactionHistory, TransactionProvider } from "./components/TransactionHistory"
import { EventListener } from "./components/EventListener"

import '@rainbow-me/rainbowkit/styles.css'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

const config = getDefaultConfig({
  appName: "INR Token DApp - Complete Edition",
  projectId: projectId,
  chains: [sepolia],
  ssr: false,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <TransactionProvider>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
              <header className="backdrop-blur-md bg-white/80 shadow-lg border-b border-white/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto">
                  <div className="flex justify-between items-center py-6 px-6">
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                        Indian Rupee Token DApp
                      </h1>
                      <p className="text-slate-600 font-medium mt-1">
                        Complete ERC-20 Implementation with All Functions & Events
                      </p>
                    </div>
                    <WalletConnection />
                  </div>
                </div>
              </header>

              <main className="max-w-7xl mx-auto py-12 px-6">
                <div className="space-y-12">
                  <TokenDashboard />

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                    <TransferForm />
                    <ApprovalManager />
                    <TransferFromForm />
                    <BalanceChecker />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <EventListener />
                    <TransactionHistory />
                  </div>
                </div>
              </main>

              <footer className="backdrop-blur-md bg-white/80 border-t border-white/20 mt-16">
                <div className="max-w-7xl mx-auto py-12 px-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
                      Complete ERC-20 Token DApp
                    </h3>
                    <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                      Built with React + Wagmi + RainbowKit | All Contract Functions Implemented
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {[
                        { name: "Transfer", icon: "↗️" },
                        { name: "Approve", icon: "✅" },
                        { name: "TransferFrom", icon: "🔄" },
                        { name: "BalanceOf", icon: "💰" },
                        { name: "Live Events", icon: "📡" },
                        { name: "Transaction History", icon: "📋" },
                      ].map((feature) => (
                        <div
                          key={feature.name}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 backdrop-blur-sm border border-indigo-200/30 rounded-full text-sm font-medium text-slate-700 hover:from-indigo-500/20 hover:to-cyan-500/20 transition-all duration-300"
                        >
                          <span className="text-lg">{feature.icon}</span>
                          <span>{feature.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </TransactionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default function Page() {
  return <App />
}
