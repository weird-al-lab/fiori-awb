import { Dialog } from '@ui5/webcomponents-react/Dialog'
import { useEffect, useState, type ComponentProps } from 'react'

type AwbDialogProps = ComponentProps<typeof Dialog>

/** Fiori Size S breakpoint (≤599px) */
const PHONE_MAX_WIDTH = 599

function useIsPhoneSize(): boolean {
  const [isPhone, setIsPhone] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(`(max-width: ${PHONE_MAX_WIDTH}px)`).matches
      : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${PHONE_MAX_WIDTH}px)`)
    const onChange = () => setIsPhone(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isPhone
}

/**
 * App dialog with Fiori-aligned responsive width:
 * - Size S: full screen (stretch)
 * - Size M/L/XL: centered, max 30rem (text modal guideline)
 */
export function AwbDialog({ className, stretch, ...props }: AwbDialogProps) {
  const isPhone = useIsPhoneSize()
  const classes = ['awb-dialog', className].filter(Boolean).join(' ')

  return <Dialog {...props} className={classes} stretch={stretch ?? isPhone} />
}
