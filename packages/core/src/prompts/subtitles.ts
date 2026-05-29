import type { CustomPromptsConfig, TranslatePromptOptions, TranslatePromptResult } from "./translate"
import {
  DEFAULT_BATCH_TRANSLATE_PROMPT,
  DEFAULT_SUBTITLE_TRANSLATE_SYSTEM_PROMPT,
  DEFAULT_TRANSLATE_PROMPT,
  getTokenCellText,
  INPUT,
  TARGET_LANGUAGE,
  VIDEO_SUMMARY,
  VIDEO_TITLE,
} from "./constants"
import { resolvePromptReplacementValue } from "./translate"

export interface SubtitlePromptContext {
  videoTitle?: string | null
  videoSummary?: string | null
}

export function getSubtitlesTranslatePromptFromConfig(
  videoSubtitlesConfig: { customPromptsConfig: CustomPromptsConfig },
  targetLang: string,
  input: string,
  options?: TranslatePromptOptions<SubtitlePromptContext>,
): TranslatePromptResult {
  const customPromptsConfig = videoSubtitlesConfig.customPromptsConfig
  const { patterns = [], promptId } = customPromptsConfig

  let systemPrompt: string
  let prompt: string

  if (!promptId) {
    systemPrompt = DEFAULT_SUBTITLE_TRANSLATE_SYSTEM_PROMPT
    prompt = DEFAULT_TRANSLATE_PROMPT
  }
  else {
    const customPrompt = patterns.find(pattern => pattern.id === promptId)
    systemPrompt = customPrompt?.systemPrompt ?? DEFAULT_SUBTITLE_TRANSLATE_SYSTEM_PROMPT
    prompt = customPrompt?.prompt ?? DEFAULT_TRANSLATE_PROMPT
  }

  if (options?.isBatch) {
    systemPrompt = `${systemPrompt}

${DEFAULT_BATCH_TRANSLATE_PROMPT}`
  }

  const title = resolvePromptReplacementValue(options?.context?.videoTitle, "No title available")
  const summary = resolvePromptReplacementValue(options?.context?.videoSummary, "No summary available")

  const replaceTokens = (text: string) =>
    text
      .replaceAll(getTokenCellText(TARGET_LANGUAGE), targetLang)
      .replaceAll(getTokenCellText(INPUT), input)
      .replaceAll(getTokenCellText(VIDEO_TITLE), title)
      .replaceAll(getTokenCellText(VIDEO_SUMMARY), summary)

  return {
    systemPrompt: replaceTokens(systemPrompt),
    prompt: replaceTokens(prompt),
  }
}
