import { useEffect, useRef } from 'react'
import { AlertTriangle, Terminal } from 'lucide-react'

interface TransactionLogsProps {
  logs: Array<{ timestamp: string; message: string }>
}

export function TransactionLogs({ logs }: TransactionLogsProps) {
  const logsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!logsContainerRef.current) {
      return
    }

    logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
  }, [logs])

  const getMessageColor = (message: string) => {
    if (message.includes('[SAGA ALERT]')) {
      return 'text-orange-300'
    }
    if (message.includes('✓') || message.includes('confirmed') || message.includes('approved')) {
      return 'text-green-400'
    }
    if (message.includes('Compensation') || message.includes('rollback') || message.includes('ROLLBACK')) {
      return 'text-orange-300'
    }
    if (message.includes('Error') || message.includes('failed') || message.includes('FAILED')) {
      return 'text-red-400'
    }
    if (message.includes('Initiating') || message.includes('Starting') || message.includes('🚀')) {
      return 'text-cyan-300'
    }
    return 'text-app-text/80'
  }

  const getRowClass = (message: string) => {
    if (message.includes('[SAGA ALERT]')) {
      return 'py-2 px-2 rounded border border-orange-400/40 bg-orange-500/10 animate-pulse transition-opacity duration-300 float-in'
    }

    return 'py-2 transition-opacity duration-300 float-in'
  }

  return (
    <div className="glass-card rounded-lg p-6 md:p-8 flex flex-col float-in text-app-text">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-app-border">
        <Terminal className="w-5 h-5 text-cyan-400" />
        <h2 className="font-bold text-app-text">Live Transaction Logs</h2>
        <div className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>

      {/* Logs Container */}
      <div ref={logsContainerRef} className="h-[500px] md:h-[600px] overflow-y-auto space-y-2 font-mono text-sm pr-1">
        {logs.length === 0 ? (
          <div className="text-app-muted text-center py-8">
            <p>Awaiting transaction initialization...</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={getRowClass(log.message)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex gap-3">
                <span className="text-app-muted flex-shrink-0 min-w-fit">
                  [{log.timestamp}]
                </span>
                {log.message.includes('[SAGA ALERT]') && (
                  <AlertTriangle className="w-4 h-4 text-orange-300 mt-0.5 flex-shrink-0" />
                )}
                <span className={`flex-1 break-words ${getMessageColor(log.message)}`}>
                  {log.message}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-app-border">
        <p className="text-xs text-app-muted font-mono">
          <span className="text-cyan-400">{logs.length}</span> events logged
        </p>
      </div>
    </div>
  )
}
