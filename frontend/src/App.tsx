import { WagmiProvider } from 'wagmi'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { sepolia } from 'wagmi/chains'

import { WalletConnection } from './components/WalletConnection'
import { TokenDashboard } from './components/TokenDashboard'
import { TransferForm } from './components/TransferForm'
import { ApprovalManager } from './components/ApprovalManager'
import { TransferFromForm } from './components/TransferFromForm'
import { BalanceChecker } from './components/BalanceChecker'
import { TransactionHistory, TransactionProvider } from './components/TransactionHistory'
import { EventListener } from './components/EventListener'

import '@rainbow-me/rainbowkit/styles.css'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

const config = getDefaultConfig({
  appName: 'INR Token DApp - Complete Edition',
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
              <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto">
                  <div className="flex justify-between items-center py-4 px-6">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        🪙 Indian Rupee Token DApp
                      </h1>
                      <p className="text-sm text-gray-600">
                        Complete ERC-20 Implementation with All Functions & Events
                      </p>
                    </div>
                    <WalletConnection />
                  </div>
                </div>
              </header>

              <main className="max-w-7xl mx-auto py-8 px-6">
                <div className="space-y-8">
                
                  <TokenDashboard />
                  
                 
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    <TransferForm />
                    <ApprovalManager />
                    <TransferFromForm />
                    <BalanceChecker />
                  </div>

                
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <EventListener />
                    <TransactionHistory />
                  </div>
                </div>
              </main>

              <footer className="bg-white border-t mt-12">
                <div className="max-w-7xl mx-auto py-8 px-6">
                  <div className="text-center text-gray-600">
                    <p className="text-lg font-semibold mb-2">
                      Complete ERC-20 Token DApp
                    </p>
                    <p className="text-sm">
                      Built with React + Wagmi + RainbowKit | All Contract Functions Implemented
                    </p>
                    <div className="flex justify-center gap-4 mt-4 text-xs">
                      <span>✅ Transfer</span>
                      <span>✅ Approve</span>
                      <span>✅ TransferFrom</span>
                      <span>✅ BalanceOf</span>
                      <span>✅ Live Events</span>
                      <span>✅ Transaction History</span>
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

export default App