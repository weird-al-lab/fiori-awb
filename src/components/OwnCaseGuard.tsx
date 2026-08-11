import type { ReactNode } from 'react'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { AppShellBar } from './AppShellBar'

type OwnCaseGuardProps = {
  ownCase: boolean
  onBack: () => void
  /** Optional extra guidance when access is denied */
  message?: string
  className?: string
  mainClassName?: string
  children: ReactNode
}

const DEFAULT_MESSAGE =
  'Dieser Fall gehört nicht zu dir. Wechsle zurück zu deinem eigenen Profil.'

/**
 * Shared shell for pages that are only valid for the active persona’s case.
 * When `ownCase` is false, shows a Critical MessageStrip instead of page content.
 */
export function OwnCaseGuard({
  ownCase,
  onBack,
  message = DEFAULT_MESSAGE,
  className = 'app-page',
  mainClassName = 'page-content-column page-content-column--main',
  children,
}: OwnCaseGuardProps) {
  if (!ownCase) {
    return (
      <div className={className}>
        <AppShellBar appTitle="Entwicklung" onBack={onBack} />
        <main className={mainClassName}>
          <MessageStrip design="Critical" hideCloseButton>
            {message}
          </MessageStrip>
        </main>
      </div>
    )
  }

  return <>{children}</>
}
