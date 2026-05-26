import "@/utils/zod-config"
import { defineContentScript } from "#imports"
import { getLocalConfig } from "@/utils/config/storage"
import { DEFAULT_CONFIG } from "@/utils/constants/config"
import { initializeRuntimeI18n } from "@/utils/i18n/runtime"
import { clearEffectiveSiteControlUrl, getEffectiveSiteControlUrl, isSiteEnabled } from "@/utils/site-control"

declare global {
  interface Window {
    __READ_FROG_HOST_INJECTED__?: boolean
  }
}

export default defineContentScript({
  matches: ["*://*/*", "file:///*"],
  cssInjectionMode: "manual",
  async main(ctx) {
    // Prevent double injection (manifest-based + programmatic injection)
    if (window.__READ_FROG_HOST_INJECTED__)
      return
    window.__READ_FROG_HOST_INJECTED__ = true

    const initialConfig = await getLocalConfig() ?? DEFAULT_CONFIG
    const siteControlUrl = getEffectiveSiteControlUrl(window.location.href)

    if (!isSiteEnabled(siteControlUrl, initialConfig)) {
      window.__READ_FROG_HOST_INJECTED__ = false
      clearEffectiveSiteControlUrl()
      return
    }

    await initializeRuntimeI18n(initialConfig.uiLanguage)

    const { bootstrapHostContent } = await import("./runtime")
    await bootstrapHostContent(ctx, initialConfig)
  },
})
