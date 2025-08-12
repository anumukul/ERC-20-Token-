import { formatTxHash } from "../utils/formatters"

interface TransactionStatusProps {
  isLoading: boolean
  isSuccess: boolean
  error?: string
  hash?: string
}

export const TransactionStatus = ({ isLoading, isSuccess, error, hash }: TransactionStatusProps) => {
  if (isLoading) {
    return (
      <div className="mt-6 p-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 backdrop-blur-sm border border-amber-200/50 rounded-xl shadow-lg">
        <div className="flex items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-300 border-t-amber-600"></div>
            <div className="absolute inset-0 rounded-full bg-amber-100/20 animate-pulse"></div>
          </div>
          <div className="ml-4">
            <p className="text-amber-900 font-medium">Transaction in progress...</p>
            <p className="text-amber-700 text-sm mt-1">Please wait for confirmation.</p>
          </div>
        </div>
        {hash && (
          <div className="mt-4 pt-4 border-t border-amber-200/50">
            <p className="text-sm text-amber-700">
              <span className="font-medium">Transaction Hash:</span>
              <span className="ml-2 font-mono bg-amber-100/50 px-2 py-1 rounded text-amber-800">
                {formatTxHash(hash)}
              </span>
            </p>
          </div>
        )}
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="mt-6 p-6 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 backdrop-blur-sm border border-emerald-200/50 rounded-xl shadow-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="ml-3 text-emerald-900 font-medium">Transaction successful!</p>
        </div>
        {hash && (
          <div className="mt-4 pt-4 border-t border-emerald-200/50">
            <p className="text-sm text-emerald-700">
              <span className="font-medium">Transaction Hash:</span>
              <span className="ml-2 font-mono bg-emerald-100/50 px-2 py-1 rounded text-emerald-800">
                {formatTxHash(hash)}
              </span>
              <a
                href={`https://etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 inline-flex items-center text-emerald-600 hover:text-emerald-800 transition-colors duration-200 underline decoration-emerald-300 hover:decoration-emerald-500"
              >
                <span>View on Etherscan</span>
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </p>
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-6 p-6 bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 backdrop-blur-sm border border-red-200/50 rounded-xl shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-red-900 font-medium">Transaction failed</p>
            <div className="mt-3 p-3 bg-red-100/50 rounded-lg border border-red-200/50">
              <p className="text-sm text-red-700 font-mono leading-relaxed">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
