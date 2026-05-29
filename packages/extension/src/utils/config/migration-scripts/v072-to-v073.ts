/**
 * Migration script from v072 to v073
 * - Removes Notebase connection data from custom actions.
 *
 * IMPORTANT: All values are hardcoded inline. Migration scripts are frozen
 * snapshots — never import constants or helpers that may change.
 */
export function migrate(oldConfig: any): any {
  const customActions = Array.isArray(oldConfig?.selectionToolbar?.customActions)
    ? oldConfig.selectionToolbar.customActions.map((action: any) => {
        const { notebaseConnection, ...rest } = action ?? {}
        return rest
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
