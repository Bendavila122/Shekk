import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { render } from '@react-email/render'
import { Resend } from 'resend'
import { SignupEmail } from '@/lib/email-templates/signup'
import { InviteEmail } from '@/lib/email-templates/invite'
import { MagicLinkEmail } from '@/lib/email-templates/magic-link'
import { RecoveryEmail } from '@/lib/email-templates/recovery'
import { EmailChangeEmail } from '@/lib/email-templates/email-change'
import { ReauthenticationEmail } from '@/lib/email-templates/reauthentication'

// This route is Supabase Auth's "Send Email" webhook target — configure it
// in Supabase Dashboard > Authentication > Hooks, with the secret it
// generates set here as SEND_EMAIL_HOOK_SECRET.

const SITE_NAME = 'Shekk'
const FROM_DOMAIN = 'notify.shekk.app'

type EmailActionType =
  | 'signup'
  | 'invite'
  | 'magiclink'
  | 'recovery'
  | 'email_change'
  | 'reauthentication'

interface SendEmailHookPayload {
  user: {
    email: string
    new_email?: string
  }
  email_data: {
    token: string
    token_hash: string
    token_new?: string
    token_hash_new?: string
    redirect_to: string
    email_action_type: EmailActionType
    site_url: string
  }
}

function confirmationUrl(siteUrl: string, tokenHash: string, type: string, redirectTo: string): string {
  const supabaseUrl = process.env.SUPABASE_URL || siteUrl
  const url = new URL(`${supabaseUrl}/auth/v1/verify`)
  url.searchParams.set('token', tokenHash)
  url.searchParams.set('type', type)
  url.searchParams.set('redirect_to', redirectTo)
  return url.toString()
}

async function sendAuthEmail(payload: SendEmailHookPayload) {
  const { user, email_data: data } = payload
  const url = confirmationUrl(data.site_url, data.token_hash, data.email_action_type, data.redirect_to)

  let subject: string
  let element: React.ReactElement

  switch (data.email_action_type) {
    case 'signup':
      subject = 'Verify your email — Shekk'
      element = React.createElement(SignupEmail, {
        siteName: SITE_NAME,
        siteUrl: data.site_url,
        recipient: user.email,
        confirmationUrl: url,
      })
      break
    case 'invite':
      subject = "You're invited to Shekk"
      element = React.createElement(InviteEmail, {
        siteName: SITE_NAME,
        siteUrl: data.site_url,
        confirmationUrl: url,
      })
      break
    case 'magiclink':
      subject = 'Your Shekk sign-in link'
      element = React.createElement(MagicLinkEmail, { siteName: SITE_NAME, confirmationUrl: url })
      break
    case 'recovery':
      subject = 'Reset your Shekk password'
      element = React.createElement(RecoveryEmail, { siteName: SITE_NAME, confirmationUrl: url })
      break
    case 'email_change':
      // NOTE: Supabase's "secure email change" sends a confirmation to both
      // the old and new address. We only have direct visibility here into
      // one payload shape (user.email = current/old address, user.new_email
      // = pending new address, token_hash confirms from the old side and
      // token_hash_new — when present — confirms from the new side). This
      // has NOT been verified against a live captured payload yet; log the
      // raw payload in staging and confirm the old/new addressing and which
      // token each recipient should receive before relying on this in
      // production.
      subject = 'Confirm your new Shekk email'
      element = React.createElement(EmailChangeEmail, {
        siteName: SITE_NAME,
        oldEmail: user.email,
        email: user.email,
        newEmail: user.new_email ?? '',
        confirmationUrl: url,
      })
      break
    case 'reauthentication':
      subject = 'Your Shekk verification code'
      element = React.createElement(ReauthenticationEmail, { token: data.token })
      break
    default:
      throw new Error(`Unknown email_action_type: ${data.email_action_type}`)
  }

  const html = await render(element)
  const text = await render(element, { plainText: true })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured')

  const { error } = await new Resend(apiKey).emails.send({
    from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
    to: user.email,
    subject,
    html,
    text,
  })
  if (error) throw new Error(`Resend send failed: ${error.message ?? JSON.stringify(error)}`)
}

/**
 * Verifies a Standard Webhooks-signed request from Supabase Auth. Framing
 * differs from src/lib/stripe.server.ts's verifyWebhook: the signed string
 * is `${id}.${timestamp}.${body}` (not `${timestamp}.${body}`), the secret
 * is base64 after stripping its "whsec_" prefix (not literal UTF-8 bytes),
 * and the signature is base64 (not hex).
 */
async function verifySendEmailHook(request: Request): Promise<SendEmailHookPayload> {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET
  if (!secret) throw new Error('SEND_EMAIL_HOOK_SECRET is not configured')

  const body = await request.text()
  const id = request.headers.get('webhook-id')
  const timestamp = request.headers.get('webhook-timestamp')
  const signatureHeader = request.headers.get('webhook-signature')
  if (!id || !timestamp || !signatureHeader) throw new Error('Missing Standard Webhooks headers')

  const age = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (age > 300) throw new Error('Webhook timestamp too old')

  const rawSecret = Uint8Array.from(atob(secret.replace(/^whsec_/, '')), (c) => c.charCodeAt(0))
  const key = await crypto.subtle.importKey('raw', rawSecret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${timestamp}.${body}`))
  const expected = btoa(String.fromCharCode(...new Uint8Array(signed)))

  // The header can carry multiple space-separated "v1,<sig>" candidates (key rotation).
  const candidates = signatureHeader
    .split(' ')
    .map((s) => s.split(',')[1])
    .filter(Boolean)
  if (!candidates.includes(expected)) throw new Error('Invalid webhook signature')

  return JSON.parse(body)
}

export const Route = createFileRoute('/api/auth/email-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env.RESEND_API_KEY || !process.env.SEND_EMAIL_HOOK_SECRET) {
          return new Response('Email sending is not configured', { status: 503 })
        }
        let payload: SendEmailHookPayload
        try {
          payload = await verifySendEmailHook(request)
        } catch (e) {
          console.error('Send Email Hook verification failed:', e)
          return new Response('Invalid webhook signature', { status: 401 })
        }
        try {
          await sendAuthEmail(payload)
        } catch (e) {
          console.error('Auth email send failed:', e)
          return new Response('Email send failed', { status: 500 })
        }
        return new Response(null, { status: 200 })
      },
    },
  },
})
