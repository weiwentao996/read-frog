import type { LLMProviderConfig } from "./schemas"

export function resolveModelId(providerModel: LLMProviderConfig["model"]) {
  return providerModel.isCustomModel
    ? providerModel.customModel?.trim()
    : providerModel.model?.trim()
}
