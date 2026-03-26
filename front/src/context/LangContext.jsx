import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from '../utils/translations'

const LangContext = createContext(null)

// Deep-get helper: t('auth.errors.emailRequired')
function deepGet(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function LangProvider({ children }) {
  const stored = typeof localStorage !== 'undefined'
    ? localStorage.getItem('dermiq_lang') || 'en'
    : 'en'
  const [lang, setLangRaw] = useState(stored)

  const setLang = useCallback((code) => {
    setLangRaw(code)
    localStorage.setItem('dermiq_lang', code)
  }, [])

  // t('nav.dashboard') → string
  // t('landing.features') → array
  const t = useCallback((path, fallback = '') => {
    const val = deepGet(translations[lang], path)
    if (val !== undefined) return val
    // fallback to English
    const enVal = deepGet(translations.en, path)
    return enVal !== undefined ? enVal : fallback
  }, [lang])

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
