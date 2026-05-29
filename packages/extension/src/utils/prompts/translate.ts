import type { TranslatePromptOptions, TranslatePromptResult } from "@read-frog/core/prompts"
import type { WebPagePromptContext } from "@/types/content"
import { getTranslatePromptFromConfig, resolvePromptReplacementValue } from "@read-frog/core/prompts"
import { getLocalConfig } from "@/utils/config/storage"
import { DEFAULT_CONFIG } from "../constants/config"

export type { TranslatePromptOptions, TranslatePromptResult }
export { getTranslatePromptFromConfig, resolvePromptReplacementValue }

export async function getTranslatePrompt(
  targetLang: string,
  input: string,
  options?: TranslatePromptOptions<WebPagePromptContext>,
): Promise<TranslatePromptResult> {
  const config = await getLocalConfig() ?? DEFAULT_CONFIG
  return getTranslatePromptFromConfig(config.translate, targetLang, input, options)
}
