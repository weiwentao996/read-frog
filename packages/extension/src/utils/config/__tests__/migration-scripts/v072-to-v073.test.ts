import { describe, expect, it } from "vitest"
import { migrate } from "../../migration-scripts/v072-to-v073"

describe("v072-to-v073 migration", () => {
  it("removes Notebase connection data from custom actions", () => {
    const migrated = migrate({
      selectionToolbar: {
        customActions: [
          {
            id: "action-1",
            name: "Action 1",
            notebaseConnection: {
              tableId: "table-1",
              mappings: [],
            },
          },
        ],
      },
    })

    expect(migrated.selectionToolbar.customActions).toEqual([
      {
        id: "action-1",
        name: "Action 1",
      },
    ])
  })

  it("preserves malformed custom action config shapes", () => {
    const migrated = migrate({
      selectionToolbar: {
        customActions: null,
      },
    })

    expect(migrated.selectionToolbar.customActions).toBeNull()
  })
})
