import * as React from 'react'

import { Heading, Text } from '@react-email/components'
import { EmailLayout, codeStyle, h1, text } from './brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({
  token,
}: ReauthenticationEmailProps) => (
  <EmailLayout preview="Your Shekk verification code">
    <Heading style={h1}>Confirm it&rsquo;s you</Heading>
    <Text style={text}>Enter this code in Shekk to confirm your identity:</Text>
    <Text style={codeStyle}>{token}</Text>
    <Text style={{ ...text, margin: '0', fontSize: '13px' }}>
      The code expires shortly. If you didn&rsquo;t request it, ignore this
      email and consider changing your password.
    </Text>
  </EmailLayout>
)

export default ReauthenticationEmail
