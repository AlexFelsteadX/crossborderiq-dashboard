// Single source of truth for service-provider (vendor) email domains.
//
// The CBIQ benchmark survey is for corporate Global Mobility practitioners.
// Service providers, relocation management companies, immigration firms and
// consultancies are steered to the "Request a copy" route instead of the
// survey. Any code that needs to distinguish a vendor by email domain should
// import from here so the list stays in one place.

export const VENDOR_DOMAINS: readonly string[] = [
  // Relocation management companies
  "sirva.com",
  "cartus.com",
  "graebel.com",
  "aires.com",
  "santaferelo.com",
  "santafe.com",
  "crownworldmobility.com",
  "crownrelo.com",
  "weichertworkforcemobility.com",
  "dwellworks.com",
  "altairglobal.com",
  "nei.com",
  "plusrelocation.com",
  "corporaterelocations.com",
  "k2corporatemobility.com",
  // Immigration
  "fragomen.com",
  "newlandchase.com",
  "envoyglobal.com",
  "berryapplemanleiden.com",
  "balglobal.com",
  "pro-link-global.com",
  // Global consultancies / Big Four
  "deloitte.com",
  "pwc.com",
  "kpmg.com",
  "ey.com",
  "mercer.com",
  "aon.com",
  "wtwco.com",
]

// Fast membership lookup.
const VENDOR_DOMAIN_SET = new Set(VENDOR_DOMAINS.map((d) => d.toLowerCase()))

/**
 * Returns true when the email's domain is a known service-provider domain.
 * Case-insensitive; safely returns false for empty or malformed input.
 */
export function isVendorEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const at = email.lastIndexOf("@")
  if (at === -1) return false
  const domain = email.slice(at + 1).trim().toLowerCase()
  if (!domain) return false
  return VENDOR_DOMAIN_SET.has(domain)
}
