import * as React from 'react'
import { render } from '@react-email/render'
import { Resend } from 'resend'
import { TEMPLATES } from './registry'

// Server-only: reads RESEND_API_KEY. Never import from client components.

const SITE_NAME = "Shekk"
// FROM_DOMAIN must be verified as a sending domain in the Resend dashboard.
const FROM_DOMAIN = "notify.shekk.app"

export type SendTemplateEmailResult =
  | { sent: true }
  | { sent: false; reason: 'recipient_suppressed' }

export interface SendTemplateEmailOptions {
  templateData?: Record<string, any>
  /** Dedupes retries of the same logical send; defaults to a random UUID (no dedupe). */
  idempotencyKey?: string
  replyTo?: string
}

let _resend: Resend | undefined
function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured')
  return (_resend ??= new Resend(apiKey))
}

/**
 * Renders a registered template and sends it through Resend. Resend has no
 * typed "recipient suppressed" outcome the way Lovable's gateway did, so any
 * send failure throws — { sent: false } is currently unreachable but kept in
 * the return type since callers may already branch on it.
 */
export async function sendTemplateEmail(
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {}
): Promise<SendTemplateEmailResult> {
  const template = TEMPLATES[templateName]
  if (!template) {
    throw new Error(
      `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`
    )
  }

  // Template-level `to` takes precedence — notification templates always
  // send to their fixed address.
  const recipient = template.to || to
  if (!recipient) {
    throw new Error('Recipient is required (the template defines no fixed recipient)')
  }

  const templateData = options.templateData ?? {}
  const element = React.createElement(template.component, templateData)
  const html = await render(element)
  const text = await render(element, { plainText: true })
  const subject =
    typeof template.subject === 'function'
      ? template.subject(templateData)
      : template.subject

  const { error } = await getResend().emails.send({
    from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
    to: recipient,
    subject,
    html,
    text,
    ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    headers: {
      'Idempotency-Key': options.idempotencyKey || crypto.randomUUID(),
    },
  })

  if (error) {
    throw new Error(`Resend send failed: ${error.message ?? JSON.stringify(error)}`)
  }

  return { sent: true }
}
