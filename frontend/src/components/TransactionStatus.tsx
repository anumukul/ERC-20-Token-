import { formatTxHash } from '../utils/formatters'

interface TransactionStatusProps {
  isLoading: boolean
  isSuccess: boolean
  error?: string
  hash?: string
}

export const TransactionStatus = ({ isLoading, isSuccess, error, hash }: TransactionStatusProps) => {
  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
          <p className="ml-3 text-yellow-800">
            Transaction in progress... Please wait for confirmation.
          </p>
        </div>
        {hash && (
          <p className="mt-2 text-sm text-yellow-600">
            Transaction Hash: {formatTxHash(hash)}
          </p>
        )}
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-green-800">✅ Transaction successful!</p>
        {hash && (
          <p className="mt-2 text-sm text-green-600">
            Transaction Hash: {formatTxHash(hash)}
            <a
              href={`https://etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline hover:text-green-800"
            >
              View on Etherscan
            </a>
          </p>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">❌ Transaction failed</p>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return null
}