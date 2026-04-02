'use client'

import { Check } from 'lucide-react'

const STEPS = [
  { number: 1, label: 'Choose Image' },
  { number: 2, label: 'Crop' },
  { number: 3, label: 'Options & Price' },
  { number: 4, label: 'Review' },
]

interface OrderWizardProgressProps {
  currentStep: 1 | 2 | 3 | 4
}

export default function OrderWizardProgress({ currentStep }: OrderWizardProgressProps) {
  return (
    <div className="mx-auto mb-8 max-w-2xl">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = step.number < currentStep
          const isCurrent = step.number === currentStep

          return (
            <div key={step.number} className="flex flex-1 items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-zinc-900 text-white'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2'
                        : 'bg-zinc-100 text-zinc-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isCompleted
                      ? 'text-zinc-900'
                      : isCurrent
                        ? 'text-primary'
                        : 'text-zinc-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-2 mt-[-1.25rem] h-0.5 flex-1 transition-colors ${
                    step.number < currentStep ? 'bg-zinc-900' : 'bg-zinc-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
