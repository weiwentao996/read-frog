import type { JSONValue } from "ai"
import type { LLMProviderConfig } from "../providers"
import type { SelectionToolbarCustomActionPromptTokens } from "./prompt"
import type { SelectionToolbarCustomAction } from "./schema"
import { getProviderOptionsWithOverride, resolveModelId } from "../providers"
import {
  buildSelectionToolbarCustomActionSystemPrompt,
  replaceSelectionToolbarCustomActionPromptTokens,
} from "./prompt"

export interface CustomActionExecutionContext {
  action: SelectionToolbarCustomAction
  providerConfig: LLMProviderConfig
  promptTokens: SelectionToolbarCustomActionPromptTokens
}

export interface CustomActionExecutionRequest<TSurface extends string = string> {
  analytics: {
    actionId: string
    actionName: string
    surface: TSurface
  }
  key: string
  payload: {
    outputSchema: Array<{ name: string, type: SelectionToolbarCustomAction["outputSchema"][number]["type"] }>
    prompt: string
    providerId: string
    providerOptions?: Record<string, Record<string, JSONValue>>
    system: string
    temperature?: number
  }
}

function normalizeExecutionKeyValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeExecutionKeyValue)
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, nestedValue]) => nestedValue !== undefined)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, nestedValue]) => [key, normalizeExecutionKeyValue(nestedValue)]),
    )
  }

  return value
}

export function stringifyExecutionRequestKey(value: Record<string, unknown>) {
  return JSON.stringify(normalizeExecutionKeyValue(value))
}

export function buildCustomActionExecutionRequest<TSurface extends string>({
  analyticsSurface,
  executionContext,
  popoverSessionKey,
  rerunNonce,
}: {
  analyticsSurface: TSurface
  executionContext: CustomActionExecutionContext
  popoverSessionKey: number
  rerunNonce: number
}): CustomActionExecutionRequest<TSurface> {
  const { action, providerConfig, promptTokens } = executionContext
  const systemPrompt = buildSelectionToolbarCustomActionSystemPrompt(
    action.systemPrompt,
    promptTokens,
    action.outputSchema,
  )
  const prompt = replaceSelectionToolbarCustomActionPromptTokens(action.prompt, promptTokens)
  const modelName = resolveModelId(providerConfig.model) ?? ""
  const providerOptions = getProviderOptionsWithOverride(
    modelName,
    providerConfig.provider,
    providerConfig.providerOptions,
  )
  const outputSchema = action.outputSchema.map(({ name, type }) => ({ name, type }))

  return {
    analytics: {
      actionId: action.id,
      actionName: action.name,
      surface: analyticsSurface,
    },
    key: stringifyExecutionRequestKey({
      actionId: action.id,
      analyticsSurface,
      model: providerConfig.model,
      outputSchema: action.outputSchema.map(({ description, name, type }) => ({ description, name, type })),
      popoverSessionKey,
      prompt,
      promptTokens,
      provider: providerConfig.provider,
      providerId: providerConfig.id,
      providerOptions,
      rerunNonce,
      system: systemPrompt,
      temperature: providerConfig.temperature,
    }),
    payload: {
      providerId: providerConfig.id,
      system: systemPrompt,
      prompt,
      outputSchema,
      providerOptions,
      temperature: providerConfig.temperature,
    },
  }
}
