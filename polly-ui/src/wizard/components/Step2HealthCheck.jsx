import { AlertCircle, Calendar } from 'lucide-react'
import { hospitals } from '../wizard-data'
import { HospitalCard } from './HospitalCard'

function formatDateDisplay(dateStr) {
  if (!dateStr) {
    return 'Select a date'
  }

  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function Step2HealthCheck({ selectedHospitalId, onHospitalSelect, appointmentDate }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Health Check Appointment</h2>
        <p className="mt-1 text-slate-600">Choose your hospital for medical clearance.</p>
      </div>

      <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6">
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-5 w-5 text-cyan-700" />
          <div>
            <h3 className="font-semibold text-slate-900">Appointment Date</h3>
            <p className="text-sm text-slate-600">{formatDateDisplay(appointmentDate)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Health clearance should be completed before departure.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold text-slate-900">Select Hospital</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {hospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              isSelected={selectedHospitalId === hospital.id}
              onSelect={() => onHospitalSelect(hospital.id)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
