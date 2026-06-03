declare module 'i18n-polyglot' {
  import type { FC, ReactNode } from 'react'

  interface LocaleObject {
    [key: string]: unknown
  }

  interface Options {
    locale?: string
    timeout?: number
    onMissingKey?: (key: string, locale: string, data: LocaleObject) => string
  }

  interface I18n {
    t: (key: string, options?: { locale?: string; [key: string]: unknown }) => string
    getLocale: () => string
    locale: string | LocaleObject
    locales: string[]
    extend: (locale: LocaleObject) => void
    clearLocales: () => void
    emit: (locale: string) => void
  }

  function polyglotI18nProvider(
    translateFunction: (locale: string) => LocaleObject,
    initialLocale?: string,
    options?: Options
  ): (locale: string) => LocaleObject

  export default polyglotI18nProvider
}
