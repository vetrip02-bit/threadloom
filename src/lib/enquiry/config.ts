/**
 * Enquiry delivery for a fully static build.
 *
 * GitHub Pages serves files only - there is no server to hold a secret API
 * key, so delivery goes through Web3Forms, which is designed for exactly this:
 * the browser POSTs to its endpoint with a public access key.
 *
 * The key being public is by design, not an oversight. It identifies the
 * destination inbox, it cannot read anything, and Web3Forms applies its own
 * spam filtering. The worst a leaked key allows is unsolicited mail to the
 * owner, which the honeypot and Web3Forms' own filtering already mitigate.
 */
export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

export const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY?.trim() ?? ''

/** False when no key is configured, so the UI can refuse instead of pretending. */
export const ENQUIRY_DELIVERY_ENABLED = WEB3FORMS_KEY.length > 0

/**
 * Zoho CRM Web-to-Lead endpoint generated for the
 * "Threadloom Website Enquiry" webform.
 *
 * These values are intentionally public. Zoho Webforms are write-only form
 * endpoints designed to be embedded in public websites; they do not grant
 * read access to CRM records or settings.
 */
export const ZOHO_WEBFORM_ENDPOINT = 'https://crm.zoho.in/crm/WebToLeadForm'
export const ZOHO_WEBFORM_XNQSJSDP =
  '5ea82dff15938db2b2dcc9bffb50318b8553b860fb58d973271dfd418fc30c53'
export const ZOHO_WEBFORM_XMIWTLD =
  'c752ed64046dd174d5422af0e2e3a08e6510b5e35b6c4575b36b77bcb84e82df13c58c3decb7fa80e8275a85be28d8e7'
export const ZOHO_WEBFORM_ACTION_TYPE = 'TGVhZHM='
export const ZOHO_WEBFORM_RETURN_URL =
  'https://vetrip02-bit.github.io/threadloom/quote/'
