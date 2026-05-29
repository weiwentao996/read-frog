import type { Config } from "@/types/config/config"
import { createLanguageModelFromProviderConfig } from "@read-frog/core/providers"
import { storage } from "#imports"
import { getLLMProvidersConfig, getProviderConfigById } from "../config/helpers"
import { CONFIG_STORAGE_KEY } from "../constants/config"

async function getLanguageModelById(providerId: string) {
  const config = await storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`)
  if (!config) {
    throw new Error("Config not found")
  }

  const LLMProvidersConfig = getLLMProvidersConfig(config.providersConfig)
  const providerConfig = getProviderConfigById(LLMProvidersConfig, providerId)
  if (!providerConfig) {
    throw new Error(`Provider ${providerId} not found`)
  }

  return createLanguageModelFromProviderConfig(providerConfig)
}

export async function getModelById(providerId: string) {
  return getLanguageModelById(providerId)
}
