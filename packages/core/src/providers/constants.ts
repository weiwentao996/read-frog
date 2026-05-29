import { LLM_PROVIDER_MODELS, NON_API_TRANSLATE_PROVIDERS, NON_API_TRANSLATE_PROVIDERS_MAP, PURE_TRANSLATE_PROVIDERS } from "./models"

// Re-export for external consumers.
export { LLM_PROVIDER_MODELS, NON_API_TRANSLATE_PROVIDERS, NON_API_TRANSLATE_PROVIDERS_MAP, PURE_TRANSLATE_PROVIDERS }

/* ──────────────────────────────
  Derived provider names
  ────────────────────────────── */

function includesString<const T extends readonly string[]>(values: T, value: string): value is T[number] {
  return (values as readonly string[]).includes(value)
}

// translate provider names
export const TRANSLATE_PROVIDER_TYPES = ["google-translate", "microsoft-translate", "deeplx", "deepl", "openai", "deepseek", "google", "anthropic", "xai", "openai-compatible", "siliconflow", "tensdaq", "ai302", "bedrock", "groq", "deepinfra", "mistral", "togetherai", "cohere", "fireworks", "cerebras", "replicate", "perplexity", "vercel", "openrouter", "ollama", "volcengine", "minimax", "alibaba", "moonshotai", "huggingface"] as const satisfies Readonly<
  (keyof typeof LLM_PROVIDER_MODELS | typeof PURE_TRANSLATE_PROVIDERS[number])[]
>
export type TranslateProviderTypes = typeof TRANSLATE_PROVIDER_TYPES[number]
export function isTranslateProvider(provider: string): provider is TranslateProviderTypes {
  return includesString(TRANSLATE_PROVIDER_TYPES, provider)
}

export const LLM_PROVIDER_TYPES = ["openai", "deepseek", "google", "anthropic", "xai", "openai-compatible", "siliconflow", "tensdaq", "ai302", "bedrock", "groq", "deepinfra", "mistral", "togetherai", "cohere", "fireworks", "cerebras", "replicate", "perplexity", "vercel", "openrouter", "ollama", "volcengine", "minimax", "alibaba", "moonshotai", "huggingface"] as const satisfies Readonly<
  (keyof typeof LLM_PROVIDER_MODELS)[]
>
export type LLMProviderTypes = typeof LLM_PROVIDER_TYPES[number]
export function isLLMProvider(provider: string): provider is LLMProviderTypes {
  return includesString(LLM_PROVIDER_TYPES, provider)
}

export const CUSTOM_LLM_PROVIDER_TYPES = ["openai-compatible", "tensdaq", "siliconflow", "ai302", "volcengine"] as const satisfies Readonly<
  (keyof typeof LLM_PROVIDER_MODELS)[]
>
export type CustomLLMProviderTypes = typeof CUSTOM_LLM_PROVIDER_TYPES[number]
export function isCustomLLMProvider(provider: string): provider is CustomLLMProviderTypes {
  return includesString(CUSTOM_LLM_PROVIDER_TYPES, provider)
}

export const NON_CUSTOM_LLM_PROVIDER_TYPES = ["openai", "deepseek", "google", "anthropic", "xai", "bedrock", "groq", "deepinfra", "mistral", "togetherai", "cohere", "fireworks", "cerebras", "replicate", "perplexity", "vercel", "openrouter", "ollama", "minimax", "alibaba", "moonshotai", "huggingface"] as const satisfies Readonly<
  Exclude<keyof typeof LLM_PROVIDER_MODELS, CustomLLMProviderTypes>[]
>
export type NonCustomLLMProviderTypes = typeof NON_CUSTOM_LLM_PROVIDER_TYPES[number]
export function isNonCustomLLMProvider(provider: string): provider is NonCustomLLMProviderTypes {
  return includesString(NON_CUSTOM_LLM_PROVIDER_TYPES, provider)
}

export const API_PROVIDER_TYPES = ["siliconflow", "tensdaq", "ai302", "openai-compatible", "openai", "deepseek", "google", "anthropic", "xai", "deeplx", "deepl", "bedrock", "groq", "deepinfra", "mistral", "togetherai", "cohere", "fireworks", "cerebras", "replicate", "perplexity", "vercel", "openrouter", "ollama", "volcengine", "minimax", "alibaba", "moonshotai", "huggingface"] as const satisfies Readonly<
  (keyof typeof LLM_PROVIDER_MODELS | "deeplx" | "deepl")[]
>
export type APIProviderTypes = typeof API_PROVIDER_TYPES[number]
export function isAPIProvider(provider: string): provider is APIProviderTypes {
  return includesString(API_PROVIDER_TYPES, provider)
}

export const PURE_API_PROVIDER_TYPES = ["deeplx", "deepl"] as const satisfies Readonly<
  Exclude<APIProviderTypes, LLMProviderTypes>[]
>
export type PureAPIProviderTypes = typeof PURE_API_PROVIDER_TYPES[number]
export function isPureAPIProvider(provider: string): provider is PureAPIProviderTypes {
  return includesString(PURE_API_PROVIDER_TYPES, provider)
}

export type NonAPIProviderTypes = typeof NON_API_TRANSLATE_PROVIDERS[number]
export function isNonAPIProvider(provider: string): provider is NonAPIProviderTypes {
  return includesString(NON_API_TRANSLATE_PROVIDERS, provider)
}

// all provider names
export const ALL_PROVIDER_TYPES = ["google-translate", "microsoft-translate", "deeplx", "deepl", "siliconflow", "tensdaq", "ai302", "openai-compatible", "openai", "deepseek", "google", "anthropic", "xai", "bedrock", "groq", "deepinfra", "mistral", "togetherai", "cohere", "fireworks", "cerebras", "replicate", "perplexity", "vercel", "openrouter", "ollama", "volcengine", "minimax", "alibaba", "moonshotai", "huggingface"] as const satisfies Readonly<
  TranslateProviderTypes[]
>
export type AllProviderTypes = typeof ALL_PROVIDER_TYPES[number]

export function isPureTranslateProvider(provider: TranslateProviderTypes): provider is typeof PURE_TRANSLATE_PROVIDERS[number] {
  return includesString(PURE_TRANSLATE_PROVIDERS, provider)
}
