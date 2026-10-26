// Shared by the /vendor-intelligence snapshot form and its API route so the
// picklist and server-side validation can never drift apart.
export const VENDOR_CATEGORIES = [
  "Relocation Management (RMC)",
  "Mobility Technology",
  "Immigration",
  "Tax",
  "Moving & Household Goods",
  "Assignment & Managed Services",
  "Consulting & Advisory",
  "Other",
] as const

export type VendorCategory = (typeof VENDOR_CATEGORIES)[number]

export function isVendorCategory(value: unknown): value is VendorCategory {
  return typeof value === "string" && (VENDOR_CATEGORIES as readonly string[]).includes(value)
}
