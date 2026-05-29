import { z } from "zod"

export const UI_LANGUAGES = ["en", "es", "ja", "ko", "ru", "tr", "vi", "zh-CN", "zh-TW"] as const
export const UI_LANGUAGE_OPTIONS = ["auto", ...UI_LANGUAGES] as const

export const uiLanguageSchema = z.enum(UI_LANGUAGE_OPTIONS)

export type UiLanguage = z.infer<typeof uiLanguageSchema>
