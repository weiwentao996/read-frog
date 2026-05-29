import type { ReactNode } from "react"
import { useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { setRuntimeI18nLanguage } from "@/utils/i18n/runtime"

export function RuntimeI18nProvider({ children }: { children: ReactNode }) {
  const uiLanguage = useAtomValue(configFieldsAtomMap.uiLanguage)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let isMounted = true

    void setRuntimeI18nLanguage(uiLanguage).then(() => {
      if (isMounted)
        setVersion(version => version + 1)
    })

    return () => {
      isMounted = false
    }
  }, [uiLanguage])

  return <div key={version} className="contents">{children}</div>
}
