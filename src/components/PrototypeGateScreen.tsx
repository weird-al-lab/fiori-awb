import { useState } from 'react'
import { Button } from '@ui5/webcomponents-react/Button'
import { Input } from '@ui5/webcomponents-react/Input'
import { Label } from '@ui5/webcomponents-react/Label'
import { Text } from '@ui5/webcomponents-react/Text'
import { Title } from '@ui5/webcomponents-react/Title'
import { PostLogo } from './PostLogo'
import './PrototypeGateScreen.css'

type PrototypeGateScreenProps = {
  onUnlock: (password: string) => boolean
}

export function PrototypeGateScreen({ onUnlock }: PrototypeGateScreenProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const submit = () => {
    const ok = onUnlock(password)
    if (!ok) {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="prototype-gate">
      <div className="prototype-gate__card">
        <PostLogo className="prototype-gate__logo" height={48} />
        <Title level="H3">Aus- und Weiterbildung Prototype</Title>
        <Text className="prototype-gate__hint">
          Dieser Klickprototyp ist passwortgeschützt. Bitte Zugangsdaten vom
          Projektteam anfordern.
        </Text>
        <div className="prototype-gate__field">
          <Label showColon for="prototype-gate-password">
            Passwort
          </Label>
          <Input
            id="prototype-gate-password"
            type="Password"
            value={password}
            valueState={error ? 'Negative' : 'None'}
            placeholder="Passwort eingeben"
            style={{ width: '100%' }}
            onInput={(event) => {
              setPassword(event.target.value)
              if (error) setError(false)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit()
            }}
          />
          {error ? (
            <Text className="prototype-gate__error">
              Passwort ungültig. Bitte erneut versuchen.
            </Text>
          ) : null}
        </div>
        <Button design="Emphasized" onClick={submit}>
          Zugang
        </Button>
      </div>
    </div>
  )
}
