import * as React from 'react'

import { Heading, Link, Text } from '@react-email/components'
import { CtaButton, EmailLayout, h1, link, text } from './brand'
import type { TemplateEntry } from './registry'

interface MembershipWelcomeProps {
  firstName?: string
  planLabel?: string
  renewsOn?: string
  manageUrl?: string
}

export const MembershipWelcomeEmail = ({
  firstName = 'there',
  planLabel = '£9.99 a month',
  renewsOn,
  manageUrl = 'https://shekk.app/membership',
}: MembershipWelcomeProps) => (
  <EmailLayout preview="Shekk+ is live on your account">
    <Heading style={h1}>Shalom {firstName}, Shekk+ is live</Heading>
    <Text style={text}>
      Your Shekk+ membership is active on {planLabel}
      {renewsOn ? `, renewing on ${renewsOn}` : ''}. Everything is unlocked from
      right now:
    </Text>
    <Text style={text}>
      • The Shekk Mastercard, ready for Apple Pay and Google Wallet
      <br />• The full benefits marketplace, including member-only rates
      <br />• Member pricing on Shabbatonim, tiyulim and city nights
      <br />• Concierge support, seven days a week
    </Text>
    <CtaButton href={manageUrl} label="Open Shekk+" />
    <Text style={{ ...text, margin: '24px 0 0', fontSize: '13px' }}>
      You can change or cancel your plan any time from Membership in the app —
      cancelling keeps everything running until the end of the period you have
      already paid for.{' '}
      <Link href="https://shekk.app" style={link}>
        shekk.app
      </Link>
    </Text>
  </EmailLayout>
)

export default MembershipWelcomeEmail

export const template = {
  component: MembershipWelcomeEmail,
  subject: 'Welcome to Shekk+',
  displayName: 'Shekk+ welcome',
  previewData: {
    firstName: 'Ariella',
    planLabel: '£9.99 a month',
    renewsOn: '1 September 2026',
    manageUrl: 'https://shekk.app/membership',
  },
} satisfies TemplateEntry
