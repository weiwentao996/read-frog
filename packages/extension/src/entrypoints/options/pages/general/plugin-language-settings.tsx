import type { UiLanguage } from "@/types/config/ui-language"
import { useAtom } from "jotai"
import { i18n } from "#imports"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base-ui/select"
import { UI_LANGUAGE_OPTIONS } from "@/types/config/ui-language"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { ConfigCard } from "../../components/config-card"

const LANGUAGE_LABEL_KEYS: Record<UiLanguage, "auto" | "en" | "es" | "ja" | "ko" | "ru" | "tr" | "vi" | "zhCN" | "zhTW"> = {
  "auto": "auto",
  "en": "en",
  "es": "es",
  "ja": "ja",
  "ko": "ko",
  "ru": "ru",
  "tr": "tr",
  "vi": "vi",
  "zh-CN": "zhCN",
  "zh-TW": "zhTW",
}

export function PluginLanguageSettings() {
  return (
    <ConfigCard
      id="plugin-language"
      title={i18n.t("options.general.pluginLanguage.title")}
      description={i18n.t("options.general.pluginLanguage.description")}
    >
      <PluginLanguageSelector />
    </ConfigCard>
  )
}

function PluginLanguageSelector() {
  const [uiLanguage, setUiLanguage] = useAtom(configFieldsAtomMap.uiLanguage)

  const handleLanguageChange = (language: UiLanguage | null) => {
    if (!language)
      return

    void setUiLanguage(language)
  }

  return (
    <div className="w-full flex justify-start md:justify-end">
      <Select value={uiLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-40">
          <SelectValue render={<span />}>
            {i18n.t(`options.general.pluginLanguage.languages.${LANGUAGE_LABEL_KEYS[uiLanguage]}`)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {UI_LANGUAGE_OPTIONS.map(language => (
              <SelectItem key={language} value={language}>
                {i18n.t(`options.general.pluginLanguage.languages.${LANGUAGE_LABEL_KEYS[language]}`)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
