import { describe, expect, it } from "vitest"
import { migrate } from "../../migration-scripts/v074-to-v075"

const oldPrompt = "You are a dictionary assistant for language learners. Given a term and its surrounding paragraphs, provide a comprehensive and concise dictionary entry. When a term has multiple meanings, focus on the contextual meaning. Return the term in its base/canonical form. Respond in {{targetLanguage}}."

describe("v074-to-v075 migration", () => {
  it("extends the default dictionary prompt", () => {
    const migratedConfig = migrate({
      selectionToolbar: {
        customActions: [
          {
            id: "default-dictionary",
            systemPrompt: oldPrompt,
          },
        ],
      },
    })

    expect(migratedConfig.selectionToolbar.customActions[0].systemPrompt).toContain("misspellings")
    expect(migratedConfig.selectionToolbar.customActions[0].systemPrompt).toContain("nonstandard abbreviations")
    expect(migratedConfig.selectionToolbar.customActions[0].systemPrompt).toContain("local slang")
  })

  it("does not change custom actions", () => {
    const migratedConfig = migrate({
      selectionToolbar: {
        customActions: [
          {
            id: "custom-dictionary",
            systemPrompt: oldPrompt,
          },
        ],
      },
    })

    expect(migratedConfig.selectionToolbar.customActions[0].systemPrompt).toBe(oldPrompt)
  })
})
