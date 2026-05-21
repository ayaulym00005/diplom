import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import '../i18n'

export function LangProvider({ children }) {
  return children
}

export function useLang() {
  const { t: i18nT, i18n } = useTranslation()

  const setLang = useCallback((code) => {
    i18n.changeLanguage(code)
  }, [i18n])

  const t = useCallback((key, fallback) => {
    const val = i18nT(key, { returnObjects: true })
    if (typeof val === 'string' && val === key) return fallback ?? ''
    return val
  }, [i18nT])

  return { lang: i18n.language, setLang, t, translating: false }
}
