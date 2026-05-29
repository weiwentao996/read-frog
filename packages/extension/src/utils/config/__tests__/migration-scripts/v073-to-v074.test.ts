import { describe, expect, it } from "vitest"
import { migrate } from "../../migration-scripts/v073-to-v074"

describe("v073-to-v074 migration", () => {
  it("adds the default UI language setting", () => {
    expect(migrate({ language: { targetCode: "cmn" } })).toEqual({
      uiLanguage: "auto",
      language: { targetCode: "cmn" },
    })
  })

  it("preserves an existing UI language setting", () => {
    expect(migrate({ uiLanguage: "zh-CN" }).uiLanguage).toBe("zh-CN")
  })
})
