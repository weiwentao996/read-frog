import type { UiLanguage } from "@/types/config/ui-language"
import { browser, i18n } from "#imports"
import { UI_LANGUAGES } from "@/types/config/ui-language"

type Messages = Record<string, { message?: string }>
type I18nArgs = string | string[] | undefined

const LOCALE_DIRECTORY_MAP: Record<(typeof UI_LANGUAGES)[number], string> = {
  "en": "en",
  "es": "es",
  "ja": "ja",
  "ko": "ko",
  "ru": "ru",
  "tr": "tr",
  "vi": "vi",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
}

const localeSet = new Set<string>(UI_LANGUAGES)
const messagesCache = new Map<string, Messages>()
const originalTranslate = i18n.t.bind(i18n)

let currentMessages: Messages | null = null
let englishMessages: Messages | null = null
let currentLanguage: UiLanguage = "auto"
let patched = false

function normalizeBrowserLanguage(language: string): UiLanguage {
  if (localeSet.has(language))
    return language as UiLanguage

  const normalized = language.replace("_", "-")
  if (localeSet.has(normalized))
    return normalized as UiLanguage

  const baseLanguage = normalized.split("-")[0]
  if (localeSet.has(baseLanguage))
    return baseLanguage as UiLanguage

  if (baseLanguage === "zh")
    return normalized.toLowerCase().includes("tw") || normalized.toLowerCase().includes("hk") ? "zh-TW" : "zh-CN"

  return "en"
}

function resolveLanguage(language: UiLanguage): (typeof UI_LANGUAGES)[number] {
  if (language !== "auto")
    return language

  return normalizeBrowserLanguage(browser.i18n.getUILanguage()) as (typeof UI_LANGUAGES)[number]
}

async function loadMessages(language: (typeof UI_LANGUAGES)[number]): Promise<Messages | null> {
  const cachedMessages = messagesCache.get(language)
  if (cachedMessages)
    return cachedMessages

  try {
    const directory = LOCALE_DIRECTORY_MAP[language]
    const getRuntimeUrl = browser.runtime.getURL as (path: string) => string
    const response = await fetch(getRuntimeUrl(`/_locales/${directory}/messages.json`))
    if (!response.ok)
      return null

    const messages = await response.json() as Messages
    messagesCache.set(language, messages)
    return messages
  }
  catch {
    return null
  }
}

function normalizeArgs(args: I18nArgs): string[] {
  if (args === undefined)
    return []
  return Array.isArray(args) ? args : [args]
}

function interpolate(message: string, args: I18nArgs): string {
  return normalizeArgs(args).reduce(
    (result, arg, index) => result.replaceAll(`$${index + 1}`, arg),
    message,
  )
}

function translateFromMessages(messages: Messages | null, key: string, args: I18nArgs): string | null {
  const message = messages?.[key.replaceAll(".", "_")]?.message
  return message ? interpolate(message, args) : null
}

function patchI18n() {
  if (patched)
    return

  i18n.t = ((key: string, args?: I18nArgs) => {
    return translateFromMessages(currentMessages, key, args)
      ?? translateFromMessages(englishMessages, key, args)
      ?? originalTranslate(key as never, args as never)
  }) as typeof i18n.t

  patched = true
}

export async function initializeRuntimeI18n(language: UiLanguage): Promise<void> {
  patchI18n()
  await setRuntimeI18nLanguage(language)
}

export async function setRuntimeI18nLanguage(language: UiLanguage): Promise<void> {
  patchI18n()
  currentLanguage = language
  const resolvedLanguage = resolveLanguage(language)
  const [resolvedMessages, fallbackMessages] = await Promise.all([
    loadMessages(resolvedLanguage),
    loadMessages("en"),
  ])

  currentMessages = resolvedMessages
  englishMessages = fallbackMessages
}

export function getRuntimeI18nLanguage(): UiLanguage {
  return currentLanguage
}
