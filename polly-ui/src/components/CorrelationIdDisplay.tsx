import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'

interface CorrelationIdDisplayProps {
  correlationId?: string
}

export function CorrelationIdDisplay({ correlationId }: CorrelationIdDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [initiatedTime, setInitiatedTime] = useState<string>('')
  const displayCorrelationId = correlationId || 'Awaiting booking initialization...'

  useEffect(() => {
    if (correlationId) {
      setInitiatedTime(new Date().toLocaleTimeString())
    }
  }, [correlationId])

  const handleCopy = () => {
    if (!correlationId) {
      return
    }

    navigator.clipboard.writeText(correlationId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="glass-card rounded-lg p-6 md:p-8 float-in text-app-text">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-app-muted text-sm font-mono mb-2">CORRELATION ID</p>
          <p className="text-lg md:text-2xl font-mono neon-cyan break-all">{displayCorrelationId}</p>
        </div>
        <button
          onClick={handleCopy}
          disabled={!correlationId}
          className="ml-4 p-2 hover:bg-cyan-500/10 rounded transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Copy Correlation ID"
        >
          {copied ? (
            <Check className="w-5 h-5 text-cyan-400" />
          ) : (
            <Copy className="w-5 h-5 text-app-muted hover:text-cyan-400" />
          )}
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs text-app-muted">
        <div className={`w-2 h-2 rounded-full ${correlationId ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
        <span>Live Transaction - Initiated at {initiatedTime || '—'}</span>
      </div>
    </div>
  )
}
