import type { JSONValue, LanguageModel } from "ai"
import { generateText } from "ai"
import { attachRequestErrorMeta, getRequestErrorMeta } from "../request"
import { extractAISDKErrorMessage } from "../utils"

const THINK_TAG_RE = /<\/think>([\s\S]*)/

export interface CoreTranslatePromptResult {
  systemPrompt: string
  prompt: string
}

export type CorePromptResolver<TContext = unknown> = (
  targetLang: string,
  input: string,
  options?: { isBatch?: boolean, context?: TContext },
) => Promise<CoreTranslatePromptResult>

export interface CoreAITranslateProviderConfig {
  temperature?: number
  providerOptions?: Record<string, JSONValue>
}

export async function aiTranslateWithModel<TContext>(
  text: string,
  targetLangName: string,
  model: LanguageModel,
  providerOptions: Record<string, Record<string, JSONValue>> | undefined,
  providerConfig: CoreAITranslateProviderConfig,
  promptResolver: CorePromptResolver<TContext>,
  options?: { isBatch?: boolean, context?: TContext },
) {
  const { systemPrompt, prompt } = await promptResolver(targetLangName, text, options)

  try {
    const { text: translatedText } = await generateText({
      model,
      system: systemPrompt,
      prompt,
      temperature: providerConfig.temperature,
      providerOptions,
      maxRetries: 0,
    })

    const [, finalTranslation = translatedText] = translatedText.match(THINK_TAG_RE) || []

    return finalTranslation
  }
  catch (error) {
    const message = extractAISDKErrorMessage(error)
    const meta = getRequestErrorMeta(error)
    if (error instanceof Error) {
      error.message = message
      throw attachRequestErrorMeta(error, meta)
    }

    throw attachRequestErrorMeta(new Error(message), meta)
  }
}
