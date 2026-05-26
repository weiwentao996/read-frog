import path from "node:path"
import process from "node:process"
import { defineConfig } from "wxt"
import { z } from "zod"
import { createExtensionClientEnvSchema, isLocalPackagesEnabled, resolveExtensionEnv } from "./src/env/shared"

const WXT_API_KEY_PATTERN = /^WXT_.*API_KEY/
const useLocalPackages = isLocalPackagesEnabled(process.env)
const shouldSkipEnvValidation = process.env.WXT_SKIP_ENV_VALIDATION === "true"

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  imports: false,
  modules: ["@wxt-dev/module-react", "@wxt-dev/i18n/module"],
  manifestVersion: 3,
  // WXT top level alias - will be automatically synced to tsconfig.json paths and Vite alias
  alias: useLocalPackages
    ? {
        "@read-frog/definitions": path.resolve(__dirname, "../read-frog-monorepo/packages/definitions/src"),
      }
    : {},
  manifest: ({ mode, browser }) => ({
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    // Fixed extension ID for development
    ...(mode === "development" && (browser === "chrome" || browser === "edge") && {
      key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq319gqP+u99TN8qxEClwSUGcBKNpWN0zCKys4a0POMIu2LcNnGK9LkxNzbCm5PuQ9VFnLmvR9PYI7V6hEFEv3lyW8Dy2XYQcjW73h01viamEoKru0t8RdddlffgQVbPSGiURmYUOp18TM2dj7w4aRADeTxYGaz9r2IS8h+uOaqGlp8YugIfXcT2+4IfGpIQfBV7k7x+W2zbf5B1eYbG6vRRomPle/dWpf7sW9DG9iAVdy/Wko3himrxLUNqBf8+x2r8Sg5ooKH1kg15PPf4YNkV3NMkEBkX8SLN2xZ6VPcn88pIGx+BXKZoHhiKpXLw+YkPmk89On4M2pFI1lyP4FQIDAQAB",
    }),
    permissions: [
      "storage",
      "tabs",
      "alarms",
      "cookies",
      "contextMenus",
      "identity",
      "scripting",
      "webNavigation",
      ...(browser !== "firefox" ? ["offscreen", "sidePanel"] : []),
    ],
    host_permissions: [
      "*://*/*", // Required for scripting.executeScript in any frame
    ],
    // Allow images/SVGs referenced by content-script UI <img> tags to be loaded from
    // moz-extension:// URLs on regular pages. Firefox enforces this more strictly.
    web_accessible_resources: [
      {
        resources: ["assets/*.png", "assets/*.svg", "assets/*.webp", "_locales/*/messages.json"],
        matches: ["*://*/*", "file:///*"],
      },
    ],
    // Firefox-specific settings for MV3
    ...(browser === "firefox" && {
      // Override default CSP to exclude `upgrade-insecure-requests` (Firefox MV3 default),
      // which would upgrade custom provider HTTP URLs (e.g. LAN) to HTTPS.
      content_security_policy: {
        extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
      },
      browser_specific_settings: {
        gecko: {
          id: "{bd311a81-4530-4fcc-9178-74006155461b}",
          strict_min_version: "112.0",
          data_collection_permissions: {
            required: ["none"],
            optional: ["technicalAndInteraction"],
          },
        },
      },
    }),
  }),
  zip: {
    includeSources: [".env.production"],
    excludeSources: ["docs/**/*", "assets/**/*", "repos/**/*"],
  },
  dev: {
    server: {
      // Prefer 3333 over WXT's default 3000 while still allowing WXT to pick
      // another open port when 3333 is already taken.
      port: 3333,
      strictPort: false,
    },
  },
  vite: configEnv => ({
    plugins: [
      ...(configEnv.mode === "production"
        ? [
            {
              name: "check-api-key-env",
              buildStart() {
                z.object(createExtensionClientEnvSchema(
                  configEnv.mode === "production",
                  shouldSkipEnvValidation,
                ))
                  .parse(resolveExtensionEnv(process.env))

                const apiKeyVars = Object.keys(process.env)
                  .filter(key => WXT_API_KEY_PATTERN.test(key))

                if (apiKeyVars.length > 0) {
                  throw new Error(
                    `\n\nFound WXT_*_API_KEY environment variables that may be bundled:\n`
                    + `${apiKeyVars.map(k => `   - ${k}`).join("\n")}\n\n`
                    + `Please unset these variables before building for production.\n`,
                  )
                }
              },
            },
          ]
        : []),
    ],
  }),
})
