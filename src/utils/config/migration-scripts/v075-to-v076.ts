/**
 * Migration script from v075 to v076
 * - Extends the built-in dictionary action for English beginners with
 *   word forms/tenses and common phrases.
 *
 * IMPORTANT: All values are hardcoded inline. Migration scripts are frozen
 * snapshots — never import constants or helpers that may change.
 */

const EN_BEGINNER_RULE = "              13. For English beginners, prioritize part-of-speech usage, common word forms (plural, third-person singular, present participle, past tense, past participle), and useful collocations/phrases."
const ZH_CN_BEGINNER_RULE = "              13. 面向英语初学者时，优先解释词性用法、常见词形变化（如复数、第三人称单数、现在分词、过去式、过去分词）以及常用搭配/短语。"
const ZH_TW_BEGINNER_RULE = "              13. 面向英語初學者時，優先解釋詞性用法、常見詞形變化（如複數、第三人稱單數、現在分詞、過去式、過去分詞）以及常用搭配/短語。"

function isChinesePrompt(systemPrompt: unknown): boolean {
  return typeof systemPrompt === "string" && (systemPrompt.includes("## 规则") || systemPrompt.includes("## 規則"))
}

function isTraditionalChinesePrompt(systemPrompt: unknown): boolean {
  return typeof systemPrompt === "string" && systemPrompt.includes("## 規則")
}

function updateDictionaryPrompt(systemPrompt: unknown): unknown {
  if (typeof systemPrompt !== "string" || systemPrompt.includes("English beginners") || systemPrompt.includes("英语初学者") || systemPrompt.includes("英語初學者"))
    return systemPrompt

  const rule = isTraditionalChinesePrompt(systemPrompt)
    ? ZH_TW_BEGINNER_RULE
    : isChinesePrompt(systemPrompt)
      ? ZH_CN_BEGINNER_RULE
      : EN_BEGINNER_RULE

  const updatedPrompt = systemPrompt.replace(
    /(\n\s*12\. [^\n]+)(\n\n\s*## )/,
    `$1\n\n${rule}$2`,
  )

  return updatedPrompt === systemPrompt
    ? `${systemPrompt}\n${rule}`
    : updatedPrompt
}

function createFormsField(useChineseLabels: boolean) {
  return useChineseLabels
    ? {
        id: "default-dictionary-forms",
        name: "词形/时态",
        type: "string",
        description: "常见词形变化，尤其是英语的复数、第三人称单数、现在分词、过去式、过去分词；不适用时返回空字符串。",
        speaking: false,
      }
    : {
        id: "default-dictionary-forms",
        name: "Forms/Tenses",
        type: "string",
        description: "Common word forms, especially English plural, third-person singular, present participle, past tense, and past participle; return an empty string when not applicable.",
        speaking: false,
      }
}

function createCommonPhrasesField(useChineseLabels: boolean) {
  return useChineseLabels
    ? {
        id: "default-dictionary-common-phrases",
        name: "常用短语",
        type: "string",
        description: "2 到 5 个常用搭配、短语、习语或当地常见说法，附简短解释。",
        speaking: false,
      }
    : {
        id: "default-dictionary-common-phrases",
        name: "Common Phrases",
        type: "string",
        description: "2 to 5 common collocations, phrases, idioms, or local expressions with short explanations.",
        speaking: false,
      }
}

function insertFieldAfter(fields: any[], insertAfterId: string, field: any): any[] {
  if (fields.some(existing => existing?.id === field.id))
    return fields

  const index = fields.findIndex(existing => existing?.id === insertAfterId)
  if (index === -1)
    return [...fields, field]

  return [
    ...fields.slice(0, index + 1),
    field,
    ...fields.slice(index + 1),
  ]
}

function updateOutputSchema(outputSchema: unknown, systemPrompt: unknown): unknown {
  if (!Array.isArray(outputSchema))
    return outputSchema

  const useChineseLabels = isChinesePrompt(systemPrompt)
  return insertFieldAfter(
    insertFieldAfter(outputSchema, "default-dictionary-part-of-speech", createFormsField(useChineseLabels)),
    "default-dictionary-context-translation",
    createCommonPhrasesField(useChineseLabels),
  )
}

export function migrate(oldConfig: any): any {
  const customActions = Array.isArray(oldConfig?.selectionToolbar?.customActions)
    ? oldConfig.selectionToolbar.customActions.map((action: any) => {
        if (action?.id !== "default-dictionary")
          return action

        const systemPrompt = updateDictionaryPrompt(action.systemPrompt)
        return {
          ...action,
          systemPrompt,
          outputSchema: updateOutputSchema(action.outputSchema, systemPrompt),
        }
      })
    : oldConfig?.selectionToolbar?.customActions

  return {
    ...oldConfig,
    selectionToolbar: {
      ...oldConfig?.selectionToolbar,
      customActions,
    },
  }
}
