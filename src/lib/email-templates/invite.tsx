import * as React from 'react'

import { Heading, Link, Text } from '@react-email/components'
import { CtaButton, EmailLayout, h1, link, text } from './brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteUrl, confirmationUrl }: InviteEmailProps) => (
  <EmailLayout preview="You've been invited to Shekk">
    <Heading style={h1}>You&rsquo;re invited to Shekk</Heading>
    <Text style={text}>
      Someone invited you to{' '}
      <Link href={siteUrl} style={link}>
        Shekk
      </Link>{' '}
      — shekels, a Shekk card, split bills and your programme, all in one app.
    </Text>
    <CtaButton href={confirmationUrl} label="Accept invite" />
    <Text style={{ ...text, margin: '24px 0 0', fontSize: '13px' }}>
      If you weren&rsquo;t expecting this, you can safely ignore this email.
    </Text>
  </EmailLayout>
)

export default InviteEmail
