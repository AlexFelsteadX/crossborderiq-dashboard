// Free signup flow: create an account, then land on the in-app score starter.
export const FREE_SIGNUP_PATH = "/login?mode=signup&next=/premium-dashboard"

export function freeScoreHref(signedIn: boolean): string {
  return signedIn ? "/premium-dashboard" : FREE_SIGNUP_PATH
}
