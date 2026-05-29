import type { TranslatePromptOptions, TranslatePromptResult } from "@read-frog/core/prompts"
import type { SubtitlePromptContext } from "@/types/content"
import { getSubtitlesTranslatePromptFromConfig } from "@read-frog/core/prompts"
import { getLocalConfig } from "@/utils/config/storage"
import { DEFAULT_CONFIG } from "../constants/config"

export async function getSubtitlesTranslatePrompt(
  targetLang: string,
  input: string,
  options?: TranslatePromptOptions<SubtitlePromptContext>,
): Promise<TranslatePromptResult> {
  const config = await getLocalConfig() ?? DEFAULT_CONFIG
  return getSubtitlesTranslatePromptFromConfig(config.videoSubtitles, targetLang, input, options)
}
