'use client'

import { EnquiryForm } from '@/components/quote/EnquiryForm'

export function ContactForm() {
  return (
    <EnquiryForm
      source="contact"
      requirementsLabel="Your requirement"
      requirementsPlaceholder="Tell us the roles to be dressed, garment types, rough quantities, colours and the date you need stock by."
      submitLabel="Send enquiry"
      successTitle="Enquiry received"
      successBody="Thank you for getting in touch. Our sales desk will respond with options and a written quote."
    />
  )
}
