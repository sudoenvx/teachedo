import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TableState {
  // Key: tableId, Value: Array of hidden column IDs
  hiddenColumns: Record<string, string[]>
  toggleColumn: (tableId: string, columnId: string) => void
}

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      hiddenColumns: {},
      toggleColumn: (tableId, columnId) =>
        set((state) => {
          const tableHiddenCols = state.hiddenColumns[tableId] || []
          const isHidden = tableHiddenCols.includes(columnId)

          const newHiddenCols = isHidden
            ? tableHiddenCols.filter((id) => id !== columnId) // إظهار
            : [...tableHiddenCols, columnId] // إخفاء

          return {
            hiddenColumns: {
              ...state.hiddenColumns,
              [tableId]: newHiddenCols,
            },
          }
        }),
    }),
    {
      name: 'portal-tables-settings',
    }
  )
)