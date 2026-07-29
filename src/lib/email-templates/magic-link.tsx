import * as React from 'react'

import { Heading, Text } from '@react-email/components'
import { CtaButton, EmailLayout, h1, text } from './brand'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <EmailLayout preview="Your Shekk sign-in link">
    <Heading style={h1}>Your sign-in link</Heading>
    <Text style={text}>
      Tap below to sign in to Shekk. The link works once and expires shortly.
    </Text>
    <CtaButton href={confirmationUrl} label="Sign in to Shekk" />
    <Text style={{ ...text, margin: '24px 0 0', fontSize: '13px' }}>
      If you didn&rsquo;t request this link, you can safely ignore this email.
    </Text>
  </EmailLayout>
)

export default MagicLinkEmail
