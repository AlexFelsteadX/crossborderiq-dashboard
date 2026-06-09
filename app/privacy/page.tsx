import type { Metadata } from "next"
import { LegalPageLayout } from "@/components/legal-page-layout"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CBIQ collects, uses and protects your personal data.",
}

const content = `# CBIQ — Privacy Policy

**Last updated: 8 June 2026**

## 1. Who we are

CBIQ ("CBIQ", "we", "us", "our") is a cross-border workforce intelligence platform operated by **GEM Events & Consultancy – FZCO**, DSO-IFZA, IFZA Properties, Dubai Silicon Oasis, Dubai, United Arab Emirates (trade licence no. 39377, issued by the Dubai Integrated Economic Zones Authority / IFZA). CBIQ is powered by, and affiliated with, Global Mobility Executive (GME).

For any questions about this policy or your personal data, contact us at **crossborderiq@gemevents.co**.

## 2. Scope

This policy explains what personal data we collect through our website (cbiq.ai) and platform, how we use and share it, and the rights you have. It applies to visitors, registered users, survey contributors, and customers.

## 3. Information we collect

- **Account information** — your name, work email address, job title, organisation, country, and login credentials when you create an account.
- **Survey and contributed data** — responses you provide to the Global Workforce Deployment Survey and other research, including information about your organisation's workforce, mobility and HR practices. This is the data used to build our benchmarks.
- **Payment information** — when you purchase a paid membership, payment is processed by our payment provider, Stripe. We do not store your full card details; we receive limited information such as your billing country, subscription status, and the last four digits of your card.
- **Usage and technical data** — IP address, device and browser type, pages viewed, and similar analytics data collected automatically when you use the platform.
- **Communications** — records of correspondence when you contact us.

## 4. How we use your information

We use personal data to:

- provide, operate and secure the platform and your account;
- create **aggregated and anonymised** benchmarks and intelligence from contributed survey data (see Section 6);
- process payments, manage subscriptions and send service-related communications;
- respond to your enquiries and provide support;
- improve our services and develop new features;
- send you updates or marketing where you have agreed to receive them (you can opt out at any time); and
- comply with our legal obligations.

## 5. Legal bases (for UK/EU users)

Where UK or EU data protection law applies, we rely on: **performance of a contract** (to provide your account and membership); **legitimate interests** (to operate, secure and improve the platform, and to produce aggregated benchmarks); **consent** (for optional marketing and certain cookies); and **legal obligation** (for example, tax and accounting records).

## 6. Aggregation and anonymisation

A core principle of CBIQ is that contributed data is turned into **aggregated, anonymised** intelligence. We do not publish or disclose individual responses, named participants, or organisation-level responses in a way that identifies a specific person or company. Benchmarks and vendor intelligence are presented only in aggregate. Where sample sizes are too small to protect confidentiality, we suppress the data rather than display it.

## 7. How we share your information

We do not sell your personal data. We share it only as follows:

- **Service providers (sub-processors)** who help us run the platform, each under appropriate data-protection terms:
  - **Supabase** — database and authentication;
  - **Vercel** — website and application hosting (and privacy-friendly usage analytics);
  - **Stripe** — payment processing;
  - **Resend** — transactional and service emails;
  - **Typeform** — survey and form data collection;
  - **HubSpot** — customer relationship management and marketing email.
- **Affiliates** — our affiliated brand Global Mobility Executive (GME), where necessary to operate the service and community.
- **Legal and safety** — where required by law, regulation, legal process, or to protect our rights, users, or the public.
- **Business transfers** — in connection with a merger, acquisition or sale of assets, subject to this policy.

## 8. International data transfers

We are based in the United Arab Emirates and our service providers may process data in other countries, including the United States, the United Kingdom and the European Union. Where personal data is transferred internationally, we take steps to ensure it is protected by appropriate safeguards — such as contractual data-protection terms with our providers — consistent with applicable law.

## 9. Data retention

We keep personal data only as long as necessary for the purposes described in this policy: for the life of your account and as required afterwards for legal, tax, and legitimate business purposes. Aggregated and anonymised data, which no longer identifies you, may be retained indefinitely.

## 10. Your rights

Depending on your location, you may have the right to access, correct, delete, or restrict the processing of your personal data; to object to processing; to data portability; and to withdraw consent. UK/EU users may also lodge a complaint with their local supervisory authority, and UAE users may have rights under the UAE Personal Data Protection Law. To exercise any right, email **crossborderiq@gemevents.co**. Note that deleting your personal data does not affect previously created aggregated/anonymised benchmarks, which no longer identify you.

## 11. Security

We use technical and organisational measures appropriate to the risk to protect your data, including encryption in transit, access controls, and reputable infrastructure providers. No system is completely secure, and we cannot guarantee absolute security.

## 12. Cookies

We use essential cookies to operate the site and keep you signed in. We also use Vercel's privacy-friendly analytics to understand aggregate usage of the site; we do not run third-party advertising or cross-site tracking. You can control cookies through your browser settings; disabling essential cookies may affect how the site works.

## 13. Children

CBIQ is a business service intended for professionals aged 18 and over. We do not knowingly collect data from children.

## 14. Changes to this policy

We may update this policy from time to time. We will post the updated version here and revise the "Last updated" date above. Material changes will be communicated where appropriate.

## 15. Contact

GEM Events & Consultancy – FZCO
DSO-IFZA, IFZA Properties, Dubai Silicon Oasis, Dubai, United Arab Emirates
Email: **crossborderiq@gemevents.co**`

export default function PrivacyPolicyPage() {
  return <LegalPageLayout content={content} />
}
