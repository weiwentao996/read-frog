export interface CustomActionTemplateDefinition {
  id: "dictionary" | "english-learning-coach" | "improve-writing" | "blank"
  nameKey: string
  descriptionKey: string
  icon: string
}

const T_PREFIX = "options.floatingButtonAndToolbar.selectionToolbar.customActions.templates"

export const CUSTOM_ACTION_TEMPLATE_DEFINITIONS: CustomActionTemplateDefinition[] = [
  {
    id: "dictionary",
    nameKey: `${T_PREFIX}.dictionary.name`,
    descriptionKey: `${T_PREFIX}.dictionary.description`,
    icon: "tabler:book-2",
  },
  {
    id: "english-learning-coach",
    nameKey: `${T_PREFIX}.englishLearningCoach.name`,
    descriptionKey: `${T_PREFIX}.englishLearningCoach.description`,
    icon: "tabler:school",
  },
  {
    id: "improve-writing",
    nameKey: `${T_PREFIX}.improveWriting.name`,
    descriptionKey: `${T_PREFIX}.improveWriting.description`,
    icon: "tabler:pencil-check",
  },
  {
    id: "blank",
    nameKey: `${T_PREFIX}.blank.name`,
    descriptionKey: `${T_PREFIX}.blank.description`,
    icon: "tabler:sparkles",
  },
]
