import { z } from "zod"

type RawEnvValue = string | boolean | undefined
export type RawExtensionEnv = Record<string, RawEnvValue>

const rawBooleanSchema = z.union([
  z.stringbool({ truthy: ["true"], falsy: ["false"] }),
  z.boolean(),
]).optional()

const optionalNonEmptyStringSchema = z.string().min(1).optional()

export function isLocalPackagesEnabled(rawEnv: RawExtensionEnv) {
  return rawBooleanSchema.parse(rawEnv.WXT_USE_LOCAL_PACKAGES) ?? false
}

export function resolveExtensionEnv(rawEnv: RawExtensionEnv) {
  return rawEnv
}

export function createExtensionClientEnvSchema(
  isProd: boolean,
  skipRequiredProductionEnv = false,
) {
  const requiresProductionEnv = isProd && !skipRequiredProductionEnv

  return {
    WXT_GOOGLE_CLIENT_ID: requiresProductionEnv ? z.string().min(1) : optionalNonEmptyStringSchema,
  } satisfies Record<string, z.ZodType>
}
