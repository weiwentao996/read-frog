import type { LLMProviderConfig } from "@/types/config/provider"
import type { TranslatePromptOptions, TranslatePromptResult } from "@/utils/prompts/translate"
import { aiTranslateWithModel } from "@read-frog/core/ai"
import { getModelById } from "@/utils/providers/model"
import { resolveModelId } from "@/utils/providers/model-id"
import { getProviderOptionsWithOverride } from "@/utils/providers/options"

export type PromptResolver<TContext = unknown> = (
  targetLang: string,
  input: string,
  options?: TranslatePromptOptions<TContext>,
) => Promise<TranslatePromptResult>

export async function aiTranslate<TContext>(
  text: string,
  targetLangName: string,
  providerConfig: LLMProviderConfig,
  promptResolver: PromptResolver<TContext>,
  options?: { isBatch?: boolean, context?: TContext },
) {
  const { id: providerId, model: providerModel, provider, providerOptions: userProviderOptions } = providerConfig
  const modelName = resolveModelId(providerModel)
  const model = await getModelById(providerId)
  const providerOptions = getProviderOptionsWithOverride(modelName ?? "", provider, userProviderOptions)

  return aiTranslateWithModel(
    text,
    targetLangName,
    model,
    providerOptions,
    providerConfig,
    promptResolver,
    options,
  )
}
