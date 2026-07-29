import * as React from 'react'

import { Heading, Text } from '@react-email/components'
import { CtaButton, EmailLayout, h1, text } from './brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <EmailLayout preview="Set a new Shekk password">
    <Heading style={h1}>Reset your password</Heading>
    <Text style={text}>
      We got a request to reset the password on your Shekk account. Tap below to
      choose a new one.
    </Text>
    <CtaButton href={confirmationUrl} label="Set a new password" />
    <Text style={{ ...text, margin: '24px 0 0', fontSize: '13px' }}>
      If you didn&rsquo;t ask for this, ignore this email — your password stays
      as it is.
    </Text>
  </EmailLayout>
)

export default RecoveryEmail
