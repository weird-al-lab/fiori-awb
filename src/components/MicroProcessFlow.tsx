import { Fragment } from 'react'
import { Icon } from '@ui5/webcomponents-react/Icon'
import { Text } from '@ui5/webcomponents-react/Text'
import type {
  WeiterbildungHauptstatus,
  WeiterbildungUnterstatus,
} from '../data/weiterbildungen'
import {
  getLastReachedHauptstatusIndex,
  HAUPTSTATUS_ORDER,
} from '../data/weiterbildungen'
import './MicroProcessFlow.css'

export type MicroProcessStepState =
  | 'completed'
  | 'inProgress'
  | 'planned'
  | 'rejected'

export type MicroProcessStep = {
  label: string
  state: MicroProcessStepState
}

type MicroProcessFlowProps = {
  steps: readonly MicroProcessStep[]
  className?: string
  'aria-label'?: string
}

function connectorVariant(
  targetState: MicroProcessStepState,
): 'solid' | 'dashed' | 'rejected' {
  if (targetState === 'planned') {
    return 'dashed'
  }
  if (targetState === 'rejected') {
    return 'rejected'
  }
  return 'solid'
}

export function MicroProcessFlow({
  steps,
  className,
  'aria-label': ariaLabel = 'Prozess',
}: MicroProcessFlowProps) {
  return (
    <div
      className={['micro-process-flow', className].filter(Boolean).join(' ')}
      role="list"
      aria-label={ariaLabel}
    >
      <div className="micro-process-flow__track">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          const nextStep = isLast ? null : steps[index + 1]
          const connectorClass = nextStep
            ? `micro-process-flow__connector micro-process-flow__connector--${connectorVariant(nextStep.state)}`
            : ''

          return (
            <Fragment key={`${step.label}-${index}`}>
              <div
                className="micro-process-flow__step"
                role="listitem"
                aria-current={step.state === 'inProgress' ? 'step' : undefined}
              >
                <div
                  className={`micro-process-flow__node micro-process-flow__node--${step.state}`}
                  aria-hidden="true"
                >
                  {step.state === 'completed' ? (
                    <Icon name="accept" className="micro-process-flow__node-icon" />
                  ) : step.state === 'rejected' ? (
                    <Icon name="decline" className="micro-process-flow__node-icon" />
                  ) : step.state === 'inProgress' ? (
                    <span className="micro-process-flow__node-dot" />
                  ) : null}
                </div>
                <Text
                  className={`micro-process-flow__label micro-process-flow__label--${step.state}`}
                >
                  {step.label}
                </Text>
              </div>
              {!isLast ? <span className={connectorClass} aria-hidden="true" /> : null}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

export function buildLinearProcessSteps(
  stepLabels: readonly string[],
  activeLabel: string,
): MicroProcessStep[] {
  const activeIndex = stepLabels.indexOf(activeLabel)
  const resolvedIndex = activeIndex >= 0 ? activeIndex : 0

  return stepLabels.map((label, index) => {
    let state: MicroProcessStepState = 'planned'
    if (index < resolvedIndex) {
      state = 'completed'
    } else if (index === resolvedIndex) {
      state = 'inProgress'
    }
    return { label, state }
  })
}

const PROCESS_STEP_LABELS = [
  'Antrag',
  'Vereinbarung',
  'Ausbildung',
  'Abschluss',
] as const

/**
 * Builds process steps from hauptstatus + unterstatus.
 * Early Abschluss marks skipped later phases as rejected (red X).
 */
export function buildProcessSteps(
  hauptstatus: WeiterbildungHauptstatus,
  unterstatus: WeiterbildungUnterstatus,
): MicroProcessStep[] {
  if (hauptstatus !== 'Abschluss') {
    return buildLinearProcessSteps(PROCESS_STEP_LABELS, hauptstatus)
  }

  const lastReached = getLastReachedHauptstatusIndex(hauptstatus, unterstatus)

  return PROCESS_STEP_LABELS.map((label, index) => {
    if (label === 'Abschluss' || index <= lastReached) {
      return { label, state: 'completed' as const }
    }
    return { label, state: 'rejected' as const }
  })
}

/** Preferred ObjectPage section for the current process position. */
export function getPreferredReviewSectionId(
  hauptstatus: WeiterbildungHauptstatus,
  unterstatus: WeiterbildungUnterstatus,
): 'antrag' | 'vereinbarung' | 'ausbildung' {
  const lastReached = getLastReachedHauptstatusIndex(hauptstatus, unterstatus)
  if (lastReached >= HAUPTSTATUS_ORDER.Ausbildung) {
    return 'ausbildung'
  }
  if (lastReached >= HAUPTSTATUS_ORDER.Vereinbarung) {
    return 'vereinbarung'
  }
  return 'antrag'
}
