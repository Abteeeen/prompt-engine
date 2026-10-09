/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend (no trailing slash). Empty in dev to use the Vite proxy. */
  readonly VITE_API_URL: string
  /** Google OAuth web client id used for sign-in. */
  readonly VITE_GOOGLE_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
