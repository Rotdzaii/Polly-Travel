import { CheckCircle2, AlertCircle, Clock, Loader, RotateCcw } from 'lucide-react'

type StepState = 'idle' | 'processing' | 'success' | 'failed' | 'compensating' | 'cancelled'

interface ProgressStepperProps {
  stageStates: {
    [key: number]: StepState
  }
  failedStage: number | null
}

export function ProgressStepper({ stageStates, failedStage }: ProgressStepperProps) {
  const stages = [
    {
      title: 'Medical Clearance',
      description: 'Health verification & biometric scanning',
      icon: '🏥',
    },
    {
      title: 'Lunar Hotel Reservation',
      description: 'Secure accommodation on the moon',
      icon: '🏨',
    },
    {
      title: 'Space Transportation',
      description: 'Configure spacecraft & life support',
      icon: '🚀',
    },
    {
      title: 'Final Confirmation',
      description: 'Document generation & blockchain record',
      icon: '✓',
    },
  ]

  const getStateIcon = (state: StepState) => {
    switch (state) {
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-cyan-400" />
      case 'processing':
        return <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
      case 'compensating':
        return <RotateCcw className="w-6 h-6 text-orange-400 animate-[spin_2.2s_linear_infinite]" />
      case 'cancelled':
        return <RotateCcw className="w-6 h-6 text-slate-400" />
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-500" />
      case 'idle':
      default:
        return <Clock className="w-6 h-6 text-app-muted" />
    }
  }

  const getStateColor = (state: StepState) => {
    switch (state) {
      case 'success':
        return 'border-cyan-400 bg-cyan-400/5'
      case 'processing':
        return 'border-cyan-400 bg-cyan-400/5'
      case 'compensating':
        return 'border-orange-400 bg-orange-400/10'
      case 'cancelled':
        return 'border-slate-400/60 bg-slate-400/10'
      case 'failed':
        return 'border-red-500 bg-red-500/5'
      default:
        return 'border-app-border bg-white/40 dark:bg-slate-900/40'
    }
  }

  const isStageRefunded = (index: number) => {
    return stageStates[index] === 'cancelled' || (failedStage !== null && index < failedStage)
  }

  return (
    <div className="glass-card rounded-lg p-8 float-in text-app-text">
      <h2 className="text-xl font-bold mb-8 text-app-text">Transaction Progress</h2>

      <div className="space-y-6">
        {stages.map((stage, index) => {
          const state = stageStates[index]
          const isRefunded = isStageRefunded(index)
          const isCompensating = state === 'compensating'
          const isCancelled = state === 'cancelled'

          return (
            <div key={index} className="flex gap-6">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${getStateColor(state)} ${state === 'processing' ? 'pulse-glow' : ''}`}
                >
                  {getStateIcon(state)}
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={`w-1 h-12 mt-2 transition-colors duration-300 ${
                      state === 'success'
                        ? 'bg-cyan-400'
                        : state === 'compensating'
                          ? 'bg-orange-400/60'
                          : state === 'cancelled'
                            ? 'bg-slate-400/50'
                        : state === 'failed' || (failedStage !== null && index < failedStage)
                          ? 'bg-red-500/30'
                          : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  ></div>
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1 pt-2">
                <div
                  className={`transition-opacity duration-300 ${isRefunded ? 'opacity-50' : 'opacity-100'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{stage.icon}</span>
                    <h3 className={`font-bold ${isCancelled ? 'text-app-muted line-through' : 'text-app-text'}`}>{stage.title}</h3>
                    {isRefunded && (
                      <span className="text-xs px-2 py-1 bg-slate-400/20 text-slate-300 rounded font-mono">
                        REFUNDED
                      </span>
                    )}
                    {isCompensating && (
                      <span className="text-xs px-2 py-1 bg-orange-400/20 text-orange-300 rounded font-mono">
                        ROLLING BACK
                      </span>
                    )}
                    {state === 'failed' && (
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded font-mono">
                        FAILED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-app-muted mb-3">{stage.description}</p>

                  {/* State Badge */}
                  <div className="flex items-center gap-2">
                    {state === 'idle' && (
                      <span className="text-xs font-mono text-app-muted bg-slate-200/80 dark:bg-slate-800/50 px-3 py-1 rounded">
                        WAITING
                      </span>
                    )}
                    {state === 'processing' && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                          <div className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-xs font-mono text-cyan-400">PROCESSING</span>
                      </div>
                    )}
                    {state === 'success' && (
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded">
                        COMPLETED
                      </span>
                    )}
                    {state === 'failed' && (
                      <span className="text-xs font-mono text-red-400 bg-red-500/10 px-3 py-1 rounded">
                        FAILED - COMPENSATING
                      </span>
                    )}
                    {state === 'compensating' && (
                      <span className="text-xs font-mono text-orange-300 bg-orange-400/10 px-3 py-1 rounded">
                        COMPENSATING
                      </span>
                    )}
                    {state === 'cancelled' && (
                      <span className="text-xs font-mono text-slate-300 bg-slate-400/15 px-3 py-1 rounded">
                        CANCELLED / REFUNDED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Section */}
      <div className="mt-8 pt-6 border-t border-app-border">
        <p className="text-xs text-app-muted font-mono">
          STATUS: <span className="text-cyan-400">
            {Object.values(stageStates).includes('compensating')
              ? 'ROLLBACK IN PROGRESS - DATA CONSISTENCY PROTECTED'
              : Object.values(stageStates).includes('cancelled')
                ? 'ROLLBACK COMPLETED - TRANSACTION SAFELY REVERTED'
                : Object.values(stageStates).every((s) => s === 'success')
                  ? 'BOOKING COMPLETED'
                  : 'TRANSACTION IN PROGRESS'}
          </span>
        </p>
      </div>
    </div>
  )
}
