/**
 * Migration script from v073 to v074
 * - Adds UI language selection with browser-language auto mode.
 *
 * IMPORTANT: All values are hardcoded inline. Migration scripts are frozen
 * snapshots — never import constants or helpers that may change.
 */
export function migrate(oldConfig: any): any {
  return {
    ...oldConfig,
    uiLanguage: oldConfig?.uiLanguage ?? "auto",
  }
}
