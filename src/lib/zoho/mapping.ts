import type { QuoteRequestInput } from '@/lib/validation/schemas'
import type { Profile } from '@/types'

/**
 * ---------------------------------------------------------------------------
 * ZOHO CRM FIELD MAPPING
 * ---------------------------------------------------------------------------
 * The keys on the LEFT of each entry are OUR internal names. The values on the
 * RIGHT are Zoho CRM **Field API Names**, and they are the only thing you
 * should edit.
 *
 * To find a Field API Name:
 *   Setup -> Developer Space -> APIs -> API Names   (or)
 *   Setup -> Customization -> Modules and Fields -> <module> -> edit a field
 *   -> "API Name" shown in the field properties panel.
 *
 * Custom fields you create yourself always end in a numeric suffix, e.g.
 * `Customer_Type__c` or `Organization1`. Copy the value EXACTLY - Zoho is
 * case-sensitive and silently ignores unknown keys, which is why a wrong value
 * here looks like "the sync worked but the field is empty".
 *
 * Set any entry to `null` to leave that field out of the payload entirely.
 */
export const CONTACT_FIELD_MAP = {
  /** Standard fields - present on every stock Contacts layout. */
  firstName: 'First_Name',
  lastName: 'Last_Name',
  email: 'Email',
  phone: 'Phone',
  city: 'Mailing_City',

  /**
   * `Lead_Source` is standard on Contacts, but "Website Registration" is NOT a
   * stock picklist value. Add it under
   *   Setup -> Customization -> Modules and Fields -> Contacts -> Lead Source,
   * or set this to null. Writing an unknown picklist value makes Zoho reject
   * the whole record.
   */
  leadSource: 'Lead_Source',

  /**
   * ------------------------------------------------------------------
   * OPTIONAL CUSTOM FIELDS - create these in Zoho first, then paste the
   * exact API names here. Until you do, leave them as null.
   * ------------------------------------------------------------------
   */
  organization: null as string | null, // e.g. 'Organization_Name'
  customerType: null as string | null, // e.g. 'Customer_Type'
  supabaseUserId: null as string | null, // e.g. 'Supabase_User_ID'
  consentTimestamp: null as string | null, // e.g. 'Consent_Timestamp'
  lastWebsiteSignIn: null as string | null, // e.g. 'Last_Website_Sign_In'
} as const

/** Only written when `CONTACT_FIELD_MAP.leadSource` is set. */
export const LEAD_SOURCE_VALUE = 'Website Registration'

/**
 * Quote enquiries. The defaults target the stock **Leads** module. Point
 * `ZOHO_QUOTE_MODULE` at a custom module and replace these API names to use a
 * dedicated "Quote Enquiry" module instead.
 */
export const QUOTE_FIELD_MAP = {
  firstName: 'First_Name',
  lastName: 'Last_Name',
  company: 'Company', // required on stock Leads
  email: 'Email',
  phone: 'Phone',
  city: 'City',
  description: 'Description',
  leadSource: 'Lead_Source',

  /** Optional custom fields - create them, then paste the API names here. */
  estimatedQuantity: null as string | null, // e.g. 'Estimated_Quantity'
  expectedDate: null as string | null, // e.g. 'Expected_Delivery_Date'
  requirements: null as string | null, // e.g. 'Requirements'
  itemsSummary: null as string | null, // e.g. 'Quote_Items'
  consentTimestamp: null as string | null, // e.g. 'Consent_Timestamp'
} as const

export const QUOTE_LEAD_SOURCE_VALUE = 'Website Quote Request'

export type ZohoRecord = Record<string, string | number | boolean>

/** Drops empty values so Zoho never receives blank overwrites. */
function put(
  record: ZohoRecord,
  apiName: string | null,
  value: string | number | null | undefined,
) {
  if (!apiName) return
  if (value === null || value === undefined) return
  if (typeof value === 'string' && value.trim() === '') return
  record[apiName] = value
}

export interface ContactSyncSource {
  profile: Pick<
    Profile,
    | 'id'
    | 'first_name'
    | 'last_name'
    | 'phone'
    | 'organization'
    | 'customer_type'
    | 'city'
    | 'consent_at'
  >
  /** Always taken from the authenticated session, never from the request body. */
  email: string
  /** ISO timestamp of the sign-in that triggered this sync. */
  signedInAt: string
}

/**
 * Builds the Contacts upsert payload. Pure and side-effect free so it can be
 * unit-tested without touching the network.
 */
export function buildContactRecord(source: ContactSyncSource): ZohoRecord {
  const { profile, email, signedInAt } = source
  const record: ZohoRecord = {}

  put(record, CONTACT_FIELD_MAP.firstName, profile.first_name)
  // Last_Name is mandatory in Zoho; fall back to the local-part of the email.
  put(
    record,
    CONTACT_FIELD_MAP.lastName,
    profile.last_name?.trim() || email.split('@')[0] || 'Customer',
  )
  put(record, CONTACT_FIELD_MAP.email, email)
  put(record, CONTACT_FIELD_MAP.phone, profile.phone)
  put(record, CONTACT_FIELD_MAP.city, profile.city)
  put(record, CONTACT_FIELD_MAP.leadSource, LEAD_SOURCE_VALUE)
  put(record, CONTACT_FIELD_MAP.organization, profile.organization)
  put(record, CONTACT_FIELD_MAP.customerType, profile.customer_type)
  put(record, CONTACT_FIELD_MAP.supabaseUserId, profile.id)
  put(record, CONTACT_FIELD_MAP.consentTimestamp, profile.consent_at)
  put(record, CONTACT_FIELD_MAP.lastWebsiteSignIn, signedInAt)

  return record
}

/**
 * Renders the quote bag as a compact plain-text block.
 * Replace with a Zoho subform payload once you configure one.
 */
export function formatQuoteItems(items: QuoteRequestInput['items']): string {
  if (items.length === 0) return 'No catalogue items selected.'
  return items
    .map((item, index) => {
      const parts = [
        item.productName,
        'Qty ' + item.quantity,
        item.color ? 'Colour: ' + item.color : null,
        item.sizes ? 'Sizes: ' + item.sizes : null,
        'Branding: ' + item.brandingMethod,
        item.notes ? 'Notes: ' + item.notes : null,
      ].filter(Boolean)
      return index + 1 + '. ' + parts.join(' | ')
    })
    .join('\n')
}

/** Human-readable summary written to `Description` on the stock Leads layout. */
export function buildQuoteDescription(input: QuoteRequestInput): string {
  const lines = [
    'Source: ' + input.source,
    'Estimated quantity: ' + input.estimatedQuantity,
    input.expectedDate ? 'Expected by: ' + input.expectedDate : null,
    '',
    'Requirements:',
    input.requirements,
    '',
    'Items:',
    formatQuoteItems(input.items),
    '',
    'Consent given on website: yes',
  ].filter((line) => line !== null)
  return lines.join('\n')
}

/** Builds the quote-enquiry payload. Pure and side-effect free. */
export function buildQuoteRecord(
  input: QuoteRequestInput,
  consentTimestamp: string,
): ZohoRecord {
  const record: ZohoRecord = {}

  put(record, QUOTE_FIELD_MAP.firstName, input.firstName)
  put(record, QUOTE_FIELD_MAP.lastName, input.lastName)
  put(record, QUOTE_FIELD_MAP.company, input.organization)
  put(record, QUOTE_FIELD_MAP.email, input.email)
  put(record, QUOTE_FIELD_MAP.phone, input.phone)
  put(record, QUOTE_FIELD_MAP.city, input.city)
  put(record, QUOTE_FIELD_MAP.description, buildQuoteDescription(input))
  put(record, QUOTE_FIELD_MAP.leadSource, QUOTE_LEAD_SOURCE_VALUE)

  put(record, QUOTE_FIELD_MAP.estimatedQuantity, input.estimatedQuantity)
  put(record, QUOTE_FIELD_MAP.expectedDate, input.expectedDate)
  put(record, QUOTE_FIELD_MAP.requirements, input.requirements)
  put(record, QUOTE_FIELD_MAP.itemsSummary, formatQuoteItems(input.items))
  put(record, QUOTE_FIELD_MAP.consentTimestamp, consentTimestamp)

  return record
}
