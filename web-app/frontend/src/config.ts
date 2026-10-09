/**
 * Product-level constants. Change these in one place.
 */
export const COMPANY_NAME = 'Prompt Engine'
export const SUPPORT_EMAIL = 'support@example.com'

/** Shown in <title> and on the home page. */
export const PRODUCT_TAGLINE = 'Turn a rough idea into an expert prompt'

/** Google OAuth client id, overridable via VITE_GOOGLE_CLIENT_ID. */
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '580296596678-cbi3nnkamigugeq8bm0lp07u3bipt1oe.apps.googleusercontent.com'

/** Date the legal pages were last revised. */
export const LEGAL_LAST_UPDATED = 'October 9, 2026'
