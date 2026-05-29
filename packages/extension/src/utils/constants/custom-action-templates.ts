import type { GeneratedI18nStructure } from "#i18n"
import type { SelectionToolbarCustomAction } from "@/types/config/selection-toolbar"
import { i18n } from "#imports"
import { getRandomUUID } from "@/utils/crypto-polyfill"
import { createOutputSchemaField } from "./custom-action"

const T_PREFIX = "options.floatingButtonAndToolbar.selectionToolbar.customActions.templates"
type I18nKey = keyof GeneratedI18nStructure

export interface CustomActionTemplate {
  id: string
  nameKey: string
  descriptionKey: string
  icon: string
  createAction: (providerId: string) => SelectionToolbarCustomAction
}

type CustomActionTemplateDefinition = Omit<CustomActionTemplate, "nameKey" | "descriptionKey"> & {
  nameKey: I18nKey
  descriptionKey: I18nKey
}

export const CUSTOM_ACTION_TEMPLATES: CustomActionTemplate[] = [
  {
    id: "dictionary",
    nameKey: `${T_PREFIX}.dictionary.name`,
    descriptionKey: `${T_PREFIX}.dictionary.description`,
    icon: "tabler:book-2",
    createAction: (providerId: string): SelectionToolbarCustomAction => ({
      id: getRandomUUID(),
      name: i18n.t(`${T_PREFIX}.dictionary.name`),
      enabled: true,
      icon: "tabler:book-2",
      providerId,
      systemPrompt: i18n.t(`${T_PREFIX}.dictionary.systemPrompt`),
      prompt: i18n.t(`${T_PREFIX}.dictionary.prompt`),
      outputSchema: [
        createOutputSchemaField(i18n.t(`${T_PREFIX}.dictionary.fieldTerm`), "string", i18n.t(`${T_PREFIX}.dictionary.fieldTermDescription`), "dictionary-term", true),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.dictionary.fieldPhonetic`), "string", i18n.t(`${T_PREFIX}.dictionary.fieldPhoneticDescription`), "dictionary-phonetic"),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.dictionary.fieldPartOfSpeech`), "string", i18n.t(`${T_PREFIX}.dictionary.fieldPartOfSpeechDescription`), "dictionary-part-of-speech"),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.dictionary.fieldForms`), "string", i18n.t(`${T_PREFIX}.dictionary.fieldFormsDescription`), "dictionary-forms"),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.dictionary.fieldDefinition`), "string", i18n.t(`${T_PREFIX}.dictionary.fieldDefinitionDescription`), "dictionary-definition"),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.dictionary.fieldParagraphs`), "string", i18n.t(`${T_PREFIX}.dictionary.fieldParagraphsDescription`), "dictionary-context", true),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.dictionary.fieldParagraphsTranslation`), "string", i18n.t(`${T_PREFIX}.dictionary.fieldParagraphsTranslationDescription`), "dictionary-context-translation"),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.dictionary.fieldCommonPhrases`), "string", i18n.t(`${T_PREFIX}.dictionary.fieldCommonPhrasesDescription`), "dictionary-common-phrases"),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.dictionary.fieldDifficulty`), "string", i18n.t(`${T_PREFIX}.dictionary.fieldDifficultyDescription`), "dictionary-difficulty"),
      ],
    }),
  },
  {
    id: "english-learning-coach",
    nameKey: `${T_PREFIX}.englishLearningCoach.name`,
    descriptionKey: `${T_PREFIX}.englishLearningCoach.description`,
    icon: "tabler:school",
    createAction: (providerId: string): SelectionToolbarCustomAction => ({
      id: getRandomUUID(),
      name: i18n.t(`${T_PREFIX}.englishLearningCoach.name`),
      enabled: true,
      icon: "tabler:school",
      providerId,
      systemPrompt: i18n.t(`${T_PREFIX}.englishLearningCoach.systemPrompt`),
      prompt: i18n.t(`${T_PREFIX}.englishLearningCoach.prompt`),
      outputSchema: [
        createOutputSchemaField(i18n.t(`${T_PREFIX}.englishLearningCoach.fieldExpression`), "string", i18n.t(`${T_PREFIX}.englishLearningCoach.fieldExpressionDescription`), "english-coach-expression", true),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.englishLearningCoach.fieldPronunciation`), "string", i18n.t(`${T_PREFIX}.englishLearningCoach.fieldPronunciationDescription`), "english-coach-pronunciation", true),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.englishLearningCoach.fieldMeaning`), "string", i18n.t(`${T_PREFIX}.englishLearningCoach.fieldMeaningDescription`), "english-coach-meaning"),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.englishLearningCoach.fieldGrammar`), "string", i18n.t(`${T_PREFIX}.englishLearningCoach.fieldGrammarDescription`), "english-coach-grammar"),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.englishLearningCoach.fieldForms`), "string", i18n.t(`${T_PREFIX}.englishLearningCoach.fieldFormsDescription`), "english-coach-forms"),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.englishLearningCoach.fieldPhrases`), "string", i18n.t(`${T_PREFIX}.englishLearningCoach.fieldPhrasesDescription`), "english-coach-phrases"),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.englishLearningCoach.fieldRoots`), "string", i18n.t(`${T_PREFIX}.englishLearningCoach.fieldRootsDescription`), "english-coach-roots"),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.englishLearningCoach.fieldCulture`), "string", i18n.t(`${T_PREFIX}.englishLearningCoach.fieldCultureDescription`), "english-coach-culture"),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.englishLearningCoach.fieldMemory`), "string", i18n.t(`${T_PREFIX}.englishLearningCoach.fieldMemoryDescription`), "english-coach-memory"),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.englishLearningCoach.fieldPractice`), "string", i18n.t(`${T_PREFIX}.englishLearningCoach.fieldPracticeDescription`), "english-coach-practice", true),
      ],
    }),
  },
  {
    id: "improve-writing",
    nameKey: `${T_PREFIX}.improveWriting.name`,
    descriptionKey: `${T_PREFIX}.improveWriting.description`,
    icon: "tabler:pencil-check",
    createAction: (providerId: string): SelectionToolbarCustomAction => ({
      id: getRandomUUID(),
      name: i18n.t(`${T_PREFIX}.improveWriting.name`),
      enabled: true,
      icon: "tabler:pencil-check",
      providerId,
      systemPrompt: i18n.t(`${T_PREFIX}.improveWriting.systemPrompt`),
      prompt: i18n.t(`${T_PREFIX}.improveWriting.prompt`),
      outputSchema: [
        createOutputSchemaField(i18n.t(`${T_PREFIX}.improveWriting.fieldErrorAnalysis`), "string", i18n.t(`${T_PREFIX}.improveWriting.fieldErrorAnalysisDescription`)),
        createOutputSchemaField(i18n.t(`${T_PREFIX}.improveWriting.fieldImprovedVersion`), "string", i18n.t(`${T_PREFIX}.improveWriting.fieldImprovedVersionDescription`)),
      ],
    }),
  },
  {
    id: "blank",
    nameKey: `${T_PREFIX}.blank.name`,
    descriptionKey: `${T_PREFIX}.blank.description`,
    icon: "tabler:sparkles",
    createAction: (providerId: string): SelectionToolbarCustomAction => ({
      id: getRandomUUID(),
      name: i18n.t(`${T_PREFIX}.blank.name`),
      enabled: true,
      icon: "tabler:sparkles",
      providerId,
      systemPrompt: "",
      prompt: "",
      outputSchema: [
        createOutputSchemaField(i18n.t("options.floatingButtonAndToolbar.selectionToolbar.customActions.form.defaultFieldName")),
      ],
    }),
  },
] satisfies CustomActionTemplateDefinition[]
