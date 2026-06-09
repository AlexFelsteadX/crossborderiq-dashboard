import type { Metadata } from "next"
import { LegalPageLayout } from "@/components/legal-page-layout"

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "How CBIQ subscriptions are billed, cancelled and refunded.",
}

const content = `# CBIQ — Refund & Cancellation Policy

**Last updated: 8 June 2026**

This policy explains how CBIQ paid memberships are billed, renewed, cancelled and refunded. It forms part of our Terms of Service.

## 1. Subscriptions and billing

Paid CBIQ memberships (including Global Workforce Intelligence and Vendor Intelligence) are **annual subscriptions billed in advance** through our payment provider, Stripe. Your subscription gives you access to the relevant tier for the paid term.

## 2. Automatic renewal

To avoid interruption to your access, subscriptions **renew automatically** at the end of each annual term, charged to your payment method at the then-current price for that tier. We will make renewal terms clear at the point of purchase.

## 3. How to cancel

You can cancel at any time:

- from your account area, via **Manage subscription**, which opens the secure Stripe customer portal; or
- by emailing **crossborderiq@gemevents.co**.

Cancelling stops the next automatic renewal. **Your access continues until the end of the term you have already paid for** — cancelling does not cut off access immediately.

## 4. Refunds

Because CBIQ provides immediate access to digital intelligence, benchmarks and downloadable materials, **subscription fees are non-refundable**, including for any unused portion of a term after you cancel.

The only exceptions are a genuine billing error (such as a duplicate or incorrect charge) or where a refund is required by applicable law. In those cases we will put things right promptly.

To raise a billing error or refund request, contact **crossborderiq@gemevents.co** with your account email and details of the issue.

## 5. Failed or disputed payments

If a renewal payment fails, we may retry the charge and may suspend access until payment is resolved. If you believe a charge is incorrect, please contact us before raising a dispute with your bank so we can resolve it quickly.

## 6. Changes to pricing

Any change to subscription pricing applies to future renewals and new purchases, not to a term you have already paid for. We will give reasonable notice of price changes that affect your renewal.

## 7. Contact

For any billing, cancellation or refund question:
GEM Events & Consultancy – FZCO
Email: **crossborderiq@gemevents.co**`

export default function RefundPolicyPage() {
  return <LegalPageLayout content={content} />
}
