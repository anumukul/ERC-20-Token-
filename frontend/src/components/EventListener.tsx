import { useState, useEffect } from 'react'
import { useWatchContractEvent, useAccount } from 'wagmi'
import { CONTRACT_ADDRESS, ERC20_ABI, CONTRACT_EVENTS } from '../contracts/contractConfig'
import { formatUnits } from 'viem'

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
    eventName: 'Transfer',
    onLogs: (logs) => {
      console.log('Transfer events detected:', logs)
      
      logs.forEach((log) => {
        const { args, transactionHash } = log
        if (args && transactionHash) {
          const newEvent: EventLog = {
            id: `${transactionHash}-${Date.now()}`,
            event: 'Transfer',
            from: args.from as string,
            to: args.to as string,
            amount: formatUnits(args.amount as bigint, 18),
            timestamp: new Date().toLocaleTimeString(),
            txHash: transactionHash
          }
          
          setEvents(prev => [newEvent, ...prev.slice(0, 9)]) 
        }
      })
    },
  })

  
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    eventName: 'Approval',
    onLogs: (logs) => {
      console.log('Approval events detected:', logs)
      
      logs.forEach((log) => {
        const { args, transactionHash } = log
        if (args && transactionHash) {
          const newEvent: EventLog = {
            id: `${transactionHash}-${Date.now()}`,
            event: 'Approval',
            from: args.from as string,
            to: args.to as string,
            amount: formatUnits(args.amount as bigint, 18),
            timestamp: new Date().toLocaleTimeString(),
            txHash: transactionHash
          }
          
          setEvents(prev => [newEvent, ...prev.slice(0, 9)]) 
        }
      })
    },
  })

  const clearEvents = () => {
    setEvents([])
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">Live Events</h2>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live
          </span>
        </div>
        <button
          onClick={clearEvents}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 border rounded"
        >
          Clear
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👂</div>
            <p>Listening for contract events...</p>
            <p className="text-sm">Make a transaction to see events appear here!</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded-lg border-l-4 ${
                event.event === 'Transfer'
                  ? 'bg-blue-50 border-blue-400'
                  : 'bg-green-50 border-green-400'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    event.event === 'Transfer'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {event.event}
                </span>
                <span className="text-xs text-gray-500">{event.timestamp}</span>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-mono text-xs">
                    {event.from.slice(0, 6)}...{event.from.slice(-4)}
                    {address && event.from.toLowerCase() === address.toLowerCase() && (
                      <span className="ml-1 text-blue-600">(You)</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-mono text-xs">
                    {event.to.slice(0, 6)}...{event.to.slice(-4)}
                    {address && event.to.toLowerCase() === address.toLowerCase() && (
                      <span className="ml-1 text-blue-600">(You)</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">{event.amount} INR</span>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                <a
                  href={`https://sepolia.etherscan.io/tx/${event.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View on Etherscan →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}