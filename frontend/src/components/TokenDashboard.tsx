import { useAccount } from "wagmi"
import { useTokenInfo } from "../hooks/useTokenInfo"
import { useTokenBalance } from "../hooks/useTokenBalance"
import { formatTokenAmount } from "../utils/formatters"
import { CONTRACT_ADDRESS } from "../contracts/contractConfig"

export const TokenDashboard = () => {
  const { address, isConnected } = useAccount()
  const { tokenInfo, isLoading: tokenInfoLoading } = useTokenInfo()
  const { balance, isLoading: balanceLoading } = useTokenBalance(address)

  if (!isConnected) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Token Dashboard
            </h2>
          </div>
          <div className="flex items-center gap-3 p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <p className="text-amber-800 font-medium">Please connect your wallet to view token information.</p>
          </div>
        </div>
      </div>
    )
  }

  if (tokenInfoLoading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Token Dashboard
            </h2>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-800 font-medium">Loading token information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            {tokenInfo?.name} ({tokenInfo?.symbol}) Dashboard
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Your Balance</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {balanceLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </span>
                ) : (
                  `${formatTokenAmount(balance, tokenInfo?.decimals)} ${tokenInfo?.symbol}`
                )}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-200 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-semibold text-emerald-100 uppercase tracking-wide">Total Supply</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatTokenAmount(tokenInfo?.totalSupply, tokenInfo?.decimals)} {tokenInfo?.symbol}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-purple-200 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-semibold text-purple-100 uppercase tracking-wide">Contract Address</h3>
              </div>
              <p className="text-sm font-mono text-white break-all bg-black/20 rounded-lg p-2 border border-white/20">
                {CONTRACT_ADDRESS}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group relative overflow-hidden bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Decimals</h3>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
                {tokenInfo?.decimals}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Connected Account</h3>
              </div>
              <p className="text-sm font-mono bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent break-all bg-black/10 rounded-lg p-3 border border-slate-200/50">
                {address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
