import { WagmiProvider } from 'wagmi'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import {sepolia } from 'wagmi/chains'

import { WalletConnection } from './components/WalletConnection'
import { TokenDashboard } from './components/TokenDashboard'
import { TransferForm } from './components/TransferForm'
import { ApprovalManager } from './components/ApprovalManager'

import '@rainbow-me/rainbowkit/styles.css'

import './index.css'  


const config = getDefaultConfig({
  appName: 'INR Token DApp',
  projectId:import.meta.env.VITE_WALLETCONNECT_PROJECT_ID, 
  chains: [sepolia],
  ssr: true,
})

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-gray-100">
            
            <header className="bg-white shadow-sm">
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center py-4 px-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Indian Rupee Token DApp
                  </h1>
                  <WalletConnection />
                </div>
              </div>
            </header>

            
            <main className="max-w-6xl mx-auto py-8 px-6">
              <div className="space-y-8">
                
                <TokenDashboard />

                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <TransferForm />
                  <ApprovalManager />
                </div>
              </div>
            </main>

           
            <footer className="bg-white border-t mt-12">
              <div className="max-w-6xl mx-auto py-6 px-6 text-center text-gray-600">
                <p>Built with React, Wagmi, and RainbowKit</p>
              </div>
            </footer>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App