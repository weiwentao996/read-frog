import { describe, expect, it } from "vitest"
import { z } from "zod"
import {
  createExtensionClientEnvSchema,
  isLocalPackagesEnabled,
  resolveExtensionEnv,
} from "../shared"

function parseResolvedExtensionEnv(
  rawEnv: Record<string, string | boolean | undefined>,
  isProd = false,
  skipRequiredProductionEnv = false,
) {
  return z.object(createExtensionClientEnvSchema(isProd, skipRequiredProductionEnv)).parse(resolveExtensionEnv(rawEnv))
}

describe("extension env resolution", () => {
  it("passes env vars through without official backend defaults", () => {
    const rawEnv = {
      WXT_GOOGLE_CLIENT_ID: "test-google-client-id",
      WXT_USE_LOCAL_PACKAGES: "true",
    }

    expect(resolveExtensionEnv(rawEnv)).toBe(rawEnv)
  })
})

describe("extension env parsing", () => {
  it("accepts Google client id", () => {
    expect(parseResolvedExtensionEnv({
      WXT_GOOGLE_CLIENT_ID: "test-google-client-id",
    })).toEqual({
      WXT_GOOGLE_CLIENT_ID: "test-google-client-id",
    })
  })

  it("requires Google client id when PROD is true", () => {
    expect(() => parseResolvedExtensionEnv({}, true)).toThrowError("expected string, received undefined")
  })

  it("lets production parsing skip the required Google client id", () => {
    expect(parseResolvedExtensionEnv({}, true, true)).toEqual({
      WXT_GOOGLE_CLIENT_ID: undefined,
    })
  })

  it("parses WXT_USE_LOCAL_PACKAGES strictly with zod stringbool", () => {
    expect(isLocalPackagesEnabled({
      WXT_USE_LOCAL_PACKAGES: true,
    })).toBe(true)

    expect(() => isLocalPackagesEnabled({
      WXT_USE_LOCAL_PACKAGES: "yes",
    })).toThrowError()
  })
})
