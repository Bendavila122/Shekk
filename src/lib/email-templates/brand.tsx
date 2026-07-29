import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

/**
 * Shekk email brand kit. Email clients strip external CSS, so every value is
 * an inline style constant here and shared across the six auth templates.
 */
export const INK = '#1A2B48'
export const CREAM = '#FDFCF8'
export const MUTED = '#5B6B85'
export const BORDER = '#E7E3D8'

export const LOGO_URL = 'https://shekel-connect.lovable.app/logo.png'

export const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  margin: '0',
  padding: '0',
}

export const container = {
  maxWidth: '520px',
  margin: '0 auto',
  padding: '32px 24px 40px',
}

export const card = {
  backgroundColor: CREAM,
  border: `1px solid ${BORDER}`,
  borderRadius: '20px',
  padding: '32px 28px',
}

export const h1 = {
  fontSize: '24px',
  lineHeight: '1.25',
  fontWeight: 700 as const,
  color: INK,
  margin: '0 0 14px',
  letterSpacing: '-0.01em',
}

export const text = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: MUTED,
  margin: '0 0 20px',
}

export const button = {
  backgroundColor: INK,
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 700 as const,
  borderRadius: '14px',
  padding: '15px 28px',
  textDecoration: 'none',
  display: 'inline-block',
  textAlign: 'center' as const,
}

export const link = { color: INK, textDecoration: 'underline' }

export const footer = {
  fontSize: '12px',
  lineHeight: '1.6',
  color: '#96A0B2',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}

export const codeStyle = {
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: '30px',
  fontWeight: 700 as const,
  letterSpacing: '0.24em',
  color: INK,
  backgroundColor: '#ffffff',
  border: `1px solid ${BORDER}`,
  borderRadius: '14px',
  padding: '16px 12px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const logoRow = { textAlign: 'center' as const, margin: '0 0 24px' }
const wordmark = {
  fontSize: '18px',
  fontWeight: 700 as const,
  color: INK,
  letterSpacing: '0.04em',
  margin: '10px 0 0',
}

/** Shared shell: logo lockup, cream card, small print. */
export function EmailLayout({
  preview,
  children,
  note,
}: {
  preview: string
  children: React.ReactNode
  note?: React.ReactNode
}) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoRow}>
            <Img
              src={LOGO_URL}
              width="56"
              height="56"
              alt="Shekk"
              style={{ borderRadius: '14px', display: 'inline-block' }}
            />
            <Text style={wordmark}>SHEKK</Text>
          </Section>
          <Section style={card}>{children}</Section>
          <Text style={footer}>
            {note ?? 'Shekk — one wallet for your year in Israel.'}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

/** Primary CTA. Kept as its own component so every email button matches. */
export function CtaButton({ href, label }: { href: string; label: string }) {
  return (
    <Button style={button} href={href}>
      {label}
    </Button>
  )
}
