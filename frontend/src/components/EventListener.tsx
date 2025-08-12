import { useState, useEffect } from 'react'
import { useWatchContractEvent, useAccount } from 'wagmi'
import { CONTRACT_ADDRESS, ERC20_ABI } from '../contracts/contractConfig'
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
      console.log('🔥 Transfer events detected:', logs)
      
      logs.forEach((log: any) => {
        const { args, transactionHash } = log
        console.log('Transfer args:', args)
        
        if (args && transactionHash) {
          const newEvent: EventLog = {
            id: `transfer-${transactionHash}-${Date.now()}`,
            event: 'Transfer',
            from: args.from || args[0] || 'Unknown',
            to: args.to || args[1] || 'Unknown',
            amount: args.amount ? formatUnits(args.amount, 18) : (args[2] ? formatUnits(args[2], 18) : '0'),
            timestamp: new Date().toLocaleTimeString(),
            txHash: transactionHash
          }
          
          console.log('Adding Transfer event:', newEvent)
          setEvents(prev => [newEvent, ...prev.slice(0, 19)])
        }
      })
    },
  })

  
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    eventName: 'Approval',
    onLogs: (logs) => {
      console.log('🔥 Approval events detected:', logs)
      
      logs.forEach((log: any) => {
        const { args, transactionHash } = log
        console.log('Approval args:', args)
        
        if (args && transactionHash) {
          const newEvent: EventLog = {
            id: `approval-${transactionHash}-${Date.now()}`,
            event: 'Approval',
            from: args.from || args[0] || 'Unknown',
            to: args.to || args[1] || 'Unknown', 
            amount: args.amount ? formatUnits(args.amount, 18) : (args[2] ? formatUnits(args[2], 18) : '0'),
            timestamp: new Date().toLocaleTimeString(),
            txHash: transactionHash
          }
          
          console.log('Adding Approval event:', newEvent)
          setEvents(prev => [newEvent, ...prev.slice(0, 19)])
        }
      })
    },
  })

  const clearEvents = () => {
    setEvents([])
    console.log('Events cleared')
  }

  const truncateAddress = (addr: string) => {
    if (!addr || addr === 'Unknown') return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const isUserAddress = (addr: string) => {
    return address && addr && addr.toLowerCase() === address.toLowerCase()
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">Live Events</h2>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live ({events.length})
          </span>
        </div>
        <button
          onClick={clearEvents}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 border rounded hover:bg-gray-50"
        >
          Clear
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👂</div>
            <p className="font-medium">Listening for contract events...</p>
            <p className="text-sm">Make a transaction to see events appear here!</p>
            <div className="mt-4 text-xs bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-700">
                ✨ Events will automatically appear when you:
              </p>
              <ul className="mt-2 space-y-1 text-blue-600">
                <li>• Transfer tokens</li>
                <li>• Approve spending</li>
                <li>• Execute TransferFrom</li>
              </ul>
            </div>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-lg border-l-4 transition-all duration-300 ${
                event.event === 'Transfer'
                  ? 'bg-blue-50 border-blue-400 hover:bg-blue-100'
                  : 'bg-green-50 border-green-400 hover:bg-green-100'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    event.event === 'Transfer'
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-green-200 text-green-800'
                  }`}
                >
                  🔥 {event.event}
                </span>
                <span className="text-xs text-gray-500 font-mono">{event.timestamp}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">From:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {truncateAddress(event.from)}
                    </span>
                    {isUserAddress(event.from) && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                        You
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">To:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {truncateAddress(event.to)}
                    </span>
                    {isUserAddress(event.to) && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                        You
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Amount:</span>
                  <span className="font-bold text-lg text-gray-900">
                    {parseFloat(event.amount).toFixed(4)} <span className="text-sm text-gray-500">INR</span>
                  </span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <a
                    href={`https://sepolia.etherscan.io/tx/${event.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    <span>View on Etherscan</span>
                    <span>→</span>
                  </a>
                  <span className="text-xs text-gray-400 font-mono">
                    {event.txHash.slice(0, 8)}...{event.txHash.slice(-6)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {events.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Showing {events.length} most recent events • Events auto-refresh in real-time
          </p>
        </div>
      )}
    </div>
  )
}