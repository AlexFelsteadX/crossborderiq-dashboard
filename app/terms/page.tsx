import type { Metadata } from "next"
import { LegalPageLayout } from "@/components/legal-page-layout"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of CBIQ.",
}

const content = `# CBIQ — Terms of Service

**Last updated: 8 June 2026**

## 1. About these terms

These Terms of Service ("Terms") govern your access to and use of the CBIQ platform and website at cbiq.ai (the "Service"), operated by **GEM Events & Consultancy – FZCO** (trade licence no. 39377), DSO-IFZA, IFZA Properties, Dubai Silicon Oasis, Dubai, United Arab Emirates ("CBIQ", "we", "us"). By creating an account or using the Service, you agree to these Terms. If you do not agree, do not use the Service.

## 2. Eligibility

The Service is intended for business and professional use by individuals aged 18 or over acting in a professional capacity. By using the Service you confirm you are authorised to do so on behalf of your organisation where applicable.

## 3. The Service

CBIQ provides workforce intelligence, benchmarking and research tools for HR, talent and global mobility professionals. The data, benchmarks and insights are provided for **informational purposes only**. They are not legal, immigration, tax, financial or other professional advice, and should not be relied upon as a substitute for advice from a qualified professional. We do not guarantee any particular result, ranking, or business outcome.

## 4. Accounts

You are responsible for the accuracy of your registration information, for keeping your login credentials confidential, and for all activity under your account. Accounts are for a single named user and may not be shared. Notify us promptly of any unauthorised use.

## 5. Memberships, pricing and billing

- The Service offers free and paid membership tiers, described on our pricing page. Paid memberships (including Global Workforce Intelligence and Vendor Intelligence) are **annual subscriptions billed in advance**.
- Payments are processed by **Stripe**. By subscribing, you authorise us (through Stripe) to charge your payment method the applicable fee.
- Unless cancelled in accordance with our Refund & Cancellation Policy, subscriptions **renew automatically** at the end of each term at the then-current price.
- We may change our prices; changes apply to renewals and new purchases, not to the current paid term. Prices shown are exclusive of any applicable taxes (including VAT), which will be added where required by law. GEM Events & Consultancy – FZCO is registered for UAE VAT under TRN 104433774700003; where VAT applies (for example, to customers in the UAE), it will be shown on your invoice.
- "Founding Member" or promotional pricing applies on the terms stated at the time of purchase.

## 6. Contributor Access

Where we offer complimentary access in exchange for contributing to the Global Workforce Deployment Survey or other research ("Contributor Access"), you agree that the information you submit may be used to create aggregated, anonymised benchmarks and intelligence as described in our Privacy Policy. Contributor Access is provided for the period stated at the time and may be renewed by further contribution.

## 7. Acceptable use

You agree not to:

- share, resell, sublicense or redistribute the Service, its data, or your login;
- scrape, harvest, or use automated means to extract data except as expressly permitted;
- reverse engineer, copy, or create derivative works from the platform;
- use the Service unlawfully, or to infringe the rights of others;
- attempt to gain unauthorised access to the Service or its systems; or
- misrepresent information you submit to our research.

## 8. Intellectual property

The Service, including all software, content, reports, benchmarks, branding, and the indices and trademarks used by CBIQ (including the Strategic Mobility Index™, AI Adoption Index™ and Future of Mobility Index™), is owned by us or our licensors and is protected by intellectual property laws. We grant you a limited, non-exclusive, non-transferable right to access and use the Service for your internal business purposes during your membership. You may not use our trademarks without permission.

## 9. Your data and our use of aggregated insights

You retain ownership of the information you submit. By submitting data, you grant us a worldwide, royalty-free licence to use, process and combine it to operate the Service and to create **aggregated and anonymised** benchmarks, research and vendor intelligence. We will not publish your individual or organisation-identifying responses. Aggregated and anonymised insights derived from contributed data belong to us and may be used without restriction.

## 10. Reports and downloads

Reports and materials made available through the Service are licensed for your internal business use only and may not be redistributed or sold. Some reports are restricted to members of particular tiers.

## 11. Disclaimers

The Service is provided "as is" and "as available". To the fullest extent permitted by law, we disclaim all warranties, express or implied, including fitness for a particular purpose and accuracy or completeness of data. Benchmarks are based on self-reported data and are indicative, not definitive.

## 12. Limitation of liability

To the fullest extent permitted by law, CBIQ and GEM Events & Consultancy – FZCO will not be liable for any indirect, incidental, special, consequential or punitive damages, or for loss of profits, revenue, data or goodwill. Our total aggregate liability arising out of or relating to the Service will not exceed the amount you paid us in the twelve (12) months before the event giving rise to the claim.

## 13. Indemnity

You agree to indemnify and hold harmless CBIQ and its affiliates from claims arising out of your misuse of the Service or breach of these Terms.

## 14. Suspension and termination

We may suspend or terminate your access if you breach these Terms or use the Service in a way that risks harm to us or others. You may stop using the Service and cancel your subscription at any time as set out in the Refund & Cancellation Policy. Provisions that by their nature should survive termination (including IP, disclaimers and limitation of liability) will survive.

## 15. Changes to these terms

We may update these Terms from time to time. We will post the updated version and revise the "Last updated" date. Continued use after changes take effect constitutes acceptance.

## 16. Governing law and disputes

These Terms are governed by the laws of the United Arab Emirates as applicable in the Emirate of Dubai, and the courts of Dubai will have jurisdiction, without regard to conflict-of-laws principles.

## 17. Contact

GEM Events & Consultancy – FZCO
DSO-IFZA, IFZA Properties, Dubai Silicon Oasis, Dubai, United Arab Emirates
Email: **crossborderiq@gemevents.co**`

export default function TermsOfServicePage() {
  return <LegalPageLayout content={content} />
}
