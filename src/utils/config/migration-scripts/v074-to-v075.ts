/**
 * Migration script from v074 to v075
 * - Extends the built-in dictionary action prompt with spelling correction,
 *   abbreviation expansion, and cultural/slang explanations.
 *
 * IMPORTANT: All values are hardcoded inline. Migration scripts are frozen
 * snapshots — never import constants or helpers that may change.
 */

const UPDATED_PROMPT_MARKERS = [
  "misspellings",
  "拼写错误",
  "拼寫錯誤",
]

const DICTIONARY_PROMPT_MARKERS = [
  "dictionary assistant",
  "词典助手",
  "詞典助手",
  "asistente de diccionario",
]

const EN_ADDITIONAL_RULES = [
  "              10. If Selection contains misspellings, identify the likely intended form when context supports it; use the corrected form as Term and mention the correction in Definition.",
  "              11. If Selection uses nonstandard abbreviations, homophones, or spaced-out letters, expand them to the standard expression when context supports it (e.g., \"A U ok\" means \"are you ok\") and explain it in Definition.",
  "              12. Explain culturally specific usage, local slang, idioms, or regional connotations when they are relevant to the term.",
].join("\n")

const ZH_CN_ADDITIONAL_RULES = [
  "              10. 如果 Selection 含有拼写错误，在语境支持时识别其可能的正确形式，并将“词条”写为纠正后的形式；在“释义”中说明该纠正。",
  "              11. 如果 Selection 是不规范缩写、谐音或逐字母拆开的表达，在语境支持时补全其标准写法（如 “A U ok” 表示 “are you ok”），并在“释义”中说明。",
  "              12. 如果该词/表达有文化特色、当地俚语、习语或地域含义，请在“释义”中一并解释。",
].join("\n")

const ZH_TW_ADDITIONAL_RULES = [
  "              10. 如果 Selection 含有拼寫錯誤，在語境支持時識別其可能的正確形式，並將「詞條」寫為修正後的形式；在「釋義」中說明該修正。",
  "              11. 如果 Selection 是不規範縮寫、諧音或逐字母拆開的表達，在語境支持時補全其標準寫法（如 “A U ok” 表示 “are you ok”），並在「釋義」中說明。",
  "              12. 如果該詞/表達有文化特色、當地俚語、習語或地域含義，請在「釋義」中一併解釋。",
].join("\n")

function isKnownDictionaryPrompt(systemPrompt: unknown): systemPrompt is string {
  return typeof systemPrompt === "string"
    && DICTIONARY_PROMPT_MARKERS.some(marker => systemPrompt.includes(marker))
}

function isUpdatedDictionaryPrompt(systemPrompt: string): boolean {
  return UPDATED_PROMPT_MARKERS.some(marker => systemPrompt.includes(marker))
}

function getAdditionalRules(systemPrompt: string): string {
  if (systemPrompt.includes("## 規則"))
    return ZH_TW_ADDITIONAL_RULES

  if (systemPrompt.includes("## 规则"))
    return ZH_CN_ADDITIONAL_RULES

  return EN_ADDITIONAL_RULES
}

function updateDictionaryPrompt(systemPrompt: unknown): unknown {
  if (!isKnownDictionaryPrompt(systemPrompt) || isUpdatedDictionaryPrompt(systemPrompt))
    return systemPrompt

  const additionalRules = getAdditionalRules(systemPrompt)
  const updatedPrompt = systemPrompt.replace(
    /(\n\s*9\. [^\n]+)(\n\n\s*## )/,
    `$1\n${additionalRules}$2`,
  )

  return updatedPrompt === systemPrompt
    ? `${systemPrompt}\n${additionalRules}`
    : updatedPrompt
}

export function migrate(oldConfig: any): any {
  const customActions = Array.isArray(oldConfig?.selectionToolbar?.customActions)
    ? oldConfig.selectionToolbar.customActions.map((action: any) => {
        if (action?.id !== "default-dictionary")
          return action

        return {
          ...action,
          systemPrompt: updateDictionaryPrompt(action.systemPrompt),
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
