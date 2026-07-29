import * as React from 'react'

import { Heading, Link, Text } from '@react-email/components'
import { CtaButton, EmailLayout, h1, link, text } from './brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <EmailLayout preview="Verify your email and open your Shekk wallet">
    <Heading style={h1}>Verify your email</Heading>
    <Text style={text}>
      Welcome to Shekk — one wallet for your year in Israel. Tap the button
      below to confirm{' '}
      <Link href={`mailto:${recipient}`} style={link}>
        {recipient}
      </Link>{' '}
      and finish setting up your account.
    </Text>
    <CtaButton href={confirmationUrl} label="Verify now" />
    <Text style={{ ...text, margin: '24px 0 0', fontSize: '13px' }}>
      This link expires shortly. If you didn&rsquo;t create a Shekk account, you
      can safely ignore this email.{' '}
      <Link href={siteUrl} style={link}>
        shekk.app
      </Link>
    </Text>
  </EmailLayout>
)

export default SignupEmail
