import * as React from 'react'

import { Heading, Link, Text } from '@react-email/components'
import { CtaButton, EmailLayout, h1, link, text } from './brand'

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail.
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <EmailLayout preview="Confirm your new Shekk email address">
    <Heading style={h1}>Confirm your new email</Heading>
    <Text style={text}>
      You asked to move your Shekk account from{' '}
      <Link href={`mailto:${oldEmail}`} style={link}>
        {oldEmail}
      </Link>{' '}
      to{' '}
      <Link href={`mailto:${newEmail}`} style={link}>
        {newEmail}
      </Link>
      .
    </Text>
    <CtaButton href={confirmationUrl} label="Confirm change" />
    <Text style={{ ...text, margin: '24px 0 0', fontSize: '13px' }}>
      If this wasn&rsquo;t you, secure your account straight away — your money
      and card are tied to this address.
    </Text>
  </EmailLayout>
)

export default EmailChangeEmail
