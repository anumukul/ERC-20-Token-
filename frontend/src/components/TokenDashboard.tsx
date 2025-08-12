import { useAccount } from 'wagmi'
import { useTokenInfo } from '../hooks/useTokenInfo'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { formatTokenAmount } from '../utils/formatters'
import { CONTRACT_ADDRESS } from '../contracts/contractConfig' 

export const TokenDashboard = () => {
  const { address, isConnected } = useAccount()
  const { tokenInfo, isLoading: tokenInfoLoading } = useTokenInfo()
  const { balance, isLoading: balanceLoading } = useTokenBalance(address)

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Token Dashboard
        </h2>
        <p className="text-gray-600">
          Please connect your wallet to view token information.
        </p>
      </div>
    )
  }

  if (tokenInfoLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Token Dashboard
        </h2>
        <p className="text-gray-600">Loading token information...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {tokenInfo?.name} ({tokenInfo?.symbol}) Dashboard
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600 mb-1">Your Balance</h3>
          <p className="text-2xl font-bold text-blue-900">
            {balanceLoading ? (
              'Loading...'
            ) : (
              `${formatTokenAmount(balance, tokenInfo?.decimals)} ${tokenInfo?.symbol}`
            )}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600 mb-1">Total Supply</h3>
          <p className="text-2xl font-bold text-green-900">
            {formatTokenAmount(tokenInfo?.totalSupply, tokenInfo?.decimals)} {tokenInfo?.symbol}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600 mb-1">Contract Address</h3>
          <p className="text-sm font-mono text-purple-900 break-all">
            {CONTRACT_ADDRESS}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Decimals</h3>
          <p className="text-lg font-semibold text-gray-900">{tokenInfo?.decimals}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Connected Account</h3>
          <p className="text-sm font-mono text-gray-900 break-all">{address}</p>
        </div>
      </div>
    </div>
  )
}