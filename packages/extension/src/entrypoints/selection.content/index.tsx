import "@/utils/zod-config"
import type { ContentScriptContext } from "#imports"
import type { Config } from "@/types/config/config"
import type { ThemeMode } from "@/types/config/theme"
import { QueryClientProvider } from "@tanstack/react-query"
import { kebabCase } from "case-anything"
import { Provider as JotaiProvider } from "jotai"
import { useHydrateAtoms } from "jotai/utils"
import ReactDOM from "react-dom/client"
import { createShadowRootUi, defineContentScript } from "#imports"
import { RuntimeI18nProvider } from "@/components/providers/runtime-i18n-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { TooltipProvider } from "@/components/ui/base-ui/tooltip"
import { configAtom } from "@/utils/atoms/config"
import { baseThemeModeAtom } from "@/utils/atoms/theme"
import { getLocalConfig } from "@/utils/config/storage"
import { APP_NAME } from "@/utils/constants/app"
import { DEFAULT_CONFIG } from "@/utils/constants/config"
import { initializeRuntimeI18n } from "@/utils/i18n/runtime"
import { ensureIconifyBackgroundFetch } from "@/utils/iconify/setup-background-fetch"
import { protectSelectAllShadowRoot } from "@/utils/select-all"
import { insertShadowRootUIWrapperInto } from "@/utils/shadow-root"
import { clearEffectiveSiteControlUrl, getEffectiveSiteControlUrl, isSiteEnabled } from "@/utils/site-control"
import { addStyleToShadow } from "@/utils/styles"
import { queryClient } from "@/utils/tanstack-query"
import { getLocalThemeMode } from "@/utils/theme"
import App from "./app"
import "@/assets/styles/theme.css"

function HydrateAtoms({
  initialValues,
  children,
}: {
  initialValues: [
    [typeof configAtom, Config],
    [typeof baseThemeModeAtom, ThemeMode],
  ]
  children: React.ReactNode
}) {
  useHydrateAtoms(initialValues)
  return children
}

// eslint-disable-next-line import/no-mutable-exports
export let shadowWrapper: HTMLElement | null = null

declare global {
  interface Window {
    __READ_FROG_SELECTION_INJECTED__?: boolean
  }
}

async function mountSelectionUI(ctx: ContentScriptContext, config: Config) {
  ensureIconifyBackgroundFetch()

  await initializeRuntimeI18n(config.uiLanguage)
  const themeMode = await getLocalThemeMode()

  const ui = await createShadowRootUi(ctx, {
    name: `${kebabCase(APP_NAME)}-selection`,
    position: "overlay",
    anchor: "body",
    onMount: (container, shadow, shadowHost) => {
      const wrapper = insertShadowRootUIWrapperInto(container)
      shadowWrapper = wrapper
      addStyleToShadow(shadow)
      protectSelectAllShadowRoot(shadowHost, wrapper)

      const root = ReactDOM.createRoot(wrapper)
      root.render(
        <QueryClientProvider client={queryClient}>
          <JotaiProvider>
            <HydrateAtoms initialValues={[[configAtom, config], [baseThemeModeAtom, themeMode]]}>
              <RuntimeI18nProvider>
                <ThemeProvider container={wrapper}>
                  <TooltipProvider>
                    <App uiContainer={container} />
                  </TooltipProvider>
                </ThemeProvider>
              </RuntimeI18nProvider>
            </HydrateAtoms>
          </JotaiProvider>
        </QueryClientProvider>,
      )
      return root
    },
    onRemove: (root) => {
      root?.unmount()
      shadowWrapper = null
    },
  })

  ui.mount()
}

export default defineContentScript({
  matches: ["*://*/*", "file:///*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    // Prevent double injection (manifest-based + programmatic injection)
    if (window.__READ_FROG_SELECTION_INJECTED__)
      return
    window.__READ_FROG_SELECTION_INJECTED__ = true

    ctx.onInvalidated(() => {
      window.__READ_FROG_SELECTION_INJECTED__ = false
      clearEffectiveSiteControlUrl()
    })

    // Check global site control
    const config = await getLocalConfig() ?? DEFAULT_CONFIG
    const siteControlUrl = getEffectiveSiteControlUrl(window.location.href)
    if (!isSiteEnabled(siteControlUrl, config)) {
      window.__READ_FROG_SELECTION_INJECTED__ = false
      clearEffectiveSiteControlUrl()
      return
    }

    void mountSelectionUI(ctx, config)
  },
})
