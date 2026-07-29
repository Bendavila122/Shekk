import * as React from 'react'

import { Heading, Link, Text } from '@react-email/components'
import { CtaButton, EmailLayout, h1, link, text } from './brand'
import type { TemplateEntry } from './registry'

interface MembershipPaymentFailedProps {
  firstName?: string
  planLabel?: string
  endsOn?: string
  manageUrl?: string
}

export const MembershipPaymentFailedEmail = ({
  firstName = 'there',
  planLabel = 'Shekk+',
  endsOn,
  manageUrl = 'https://shekk.app/membership',
}: MembershipPaymentFailedProps) => (
  <EmailLayout preview="We couldn't take your Shekk+ payment">
    <Heading style={h1}>Your {planLabel} payment didn&rsquo;t go through</Heading>
    <Text style={text}>
      Hi {firstName}, the card on your membership was declined. Nothing has been
      switched off — we&rsquo;ll keep trying over the next few days and your
      benefits stay live in the meantime
      {endsOn ? `, until ${endsOn}` : ''}.
    </Text>
    <Text style={text}>
      The quickest fix is to update your card. It takes under a minute and
      retries straight away.
    </Text>
    <CtaButton href={manageUrl} label="Update payment method" />
    <Text style={{ ...text, margin: '24px 0 0', fontSize: '13px' }}>
      This affects your Shekk+ membership only. Your Shekk shekel account, your
      balance and your money are unaffected.{' '}
      <Link href="https://shekk.app" style={link}>
        shekk.app
      </Link>
    </Text>
  </EmailLayout>
)

export default MembershipPaymentFailedEmail

export const template = {
  component: MembershipPaymentFailedEmail,
  subject: 'Action needed: your Shekk+ payment failed',
  displayName: 'Shekk+ payment failed',
  previewData: {
    firstName: 'Ariella',
    planLabel: 'Shekk+',
    endsOn: '1 September 2026',
    manageUrl: 'https://shekk.app/membership',
  },
} satisfies TemplateEntry
