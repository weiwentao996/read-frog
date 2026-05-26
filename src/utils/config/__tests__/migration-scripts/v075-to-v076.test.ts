import { describe, expect, it } from "vitest"
import { migrate } from "../../migration-scripts/v075-to-v076"

const oldPrompt = [
  "You are a dictionary assistant for language learners.",
  "",
  "## Rules",
  "1. Focus on the meaning that best matches the provided paragraphs.",
  "12. Explain culturally specific usage, local slang, idioms, or regional connotations when they are relevant to the term.",
  "",
  "## Examples",
].join("\n")

function createDefaultAction(id = "default-dictionary") {
  return {
    id,
    systemPrompt: oldPrompt,
    outputSchema: [
      {
        id: "default-dictionary-part-of-speech",
        name: "Part of Speech",
        type: "string",
        description: "",
        speaking: false,
      },
      {
        id: "default-dictionary-context-translation",
        name: "Paragraphs Translation",
        type: "string",
        description: "",
        speaking: false,
      },
    ],
  }
}

describe("v075-to-v076 migration", () => {
  it("extends the default dictionary prompt and output schema", () => {
    const migratedConfig = migrate({
      selectionToolbar: {
        customActions: [createDefaultAction()],
      },
    })

    const action = migratedConfig.selectionToolbar.customActions[0]
    expect(action.systemPrompt).toContain("English beginners")
    expect(action.outputSchema.map((field: { id: string }) => field.id)).toEqual([
      "default-dictionary-part-of-speech",
      "default-dictionary-forms",
      "default-dictionary-context-translation",
      "default-dictionary-common-phrases",
    ])
  })

  it("does not change custom actions", () => {
    const migratedConfig = migrate({
      selectionToolbar: {
        customActions: [createDefaultAction("custom-dictionary")],
      },
    })

    expect(migratedConfig.selectionToolbar.customActions[0]).toEqual(createDefaultAction("custom-dictionary"))
  })
})
