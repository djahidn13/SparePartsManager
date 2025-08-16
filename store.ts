// ... other imports
import { get } from "idb-keyval"

async function autoBackup(state: any) {
  try {
    const handle: FileSystemDirectoryHandle | undefined = await get("backupFolderHandle")
    if (!handle) return

    const perm = await handle.queryPermission({ mode: "readwrite" })
    if (perm !== "granted") return

    const fileName = `autoparts-backup-${new Date().toISOString().slice(0,10)}.json`
    const fileHandle = await handle.getFileHandle(fileName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(JSON.stringify(state, null, 2))
    await writable.close()
  } catch (err) {
    console.error("Erreur lors de la sauvegarde automatique :", err)
  }
}

// Example patch inside your store (zustand or similar):
// add a middleware that calls autoBackup whenever state changes

const useStore = create(
  subscribeWithSelector(
    (set, get) => ({
      // ... your existing state & actions

      addSale: (sale) => {
        set((state) => {
          const newState = { ...state, sales: [...state.sales, sale] }
          autoBackup(newState)
          return newState
        })
      },

      addPurchase: (purchase) => {
        set((state) => {
          const newState = { ...state, purchases: [...state.purchases, purchase] }
          autoBackup(newState)
          return newState
        })
      },

      updateInventory: (item) => {
        set((state) => {
          const updated = state.inventory.map((i) =>
            i.id === item.id ? { ...i, ...item } : i
          )
          const newState = { ...state, inventory: updated }
          autoBackup(newState)
          return newState
        })
      },
    })
  )
)

export default useStore
