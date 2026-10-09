import { useEffect } from 'react'
import { COMPANY_NAME, PRODUCT_TAGLINE } from '../config'

/**
 * Sets document.title for the current route.
 * Pass `null` for the home page to use the full product title.
 */
export function usePageTitle(title: string | null) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} — ${COMPANY_NAME}` : `${COMPANY_NAME} — ${PRODUCT_TAGLINE}`
    return () => {
      document.title = previous
    }
  }, [title])
}
