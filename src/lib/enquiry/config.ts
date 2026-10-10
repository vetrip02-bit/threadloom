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
