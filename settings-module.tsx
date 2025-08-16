"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { get, set } from "idb-keyval"

export default function SettingsModule() {
  const [backupFolder, setBackupFolder] = useState<FileSystemDirectoryHandle | null>(null)

  // Restore folder handle from IndexedDB at startup
  useEffect(() => {
    const loadHandle = async () => {
      try {
        const handle: FileSystemDirectoryHandle | undefined = await get("backupFolderHandle")
        if (handle) {
          // Check if we still have permission
          const perm = await handle.queryPermission({ mode: "readwrite" })
          if (perm === "granted") {
            setBackupFolder(handle)
          }
        }
      } catch (err) {
        console.error("Impossible de charger le dossier de sauvegarde :", err)
      }
    }
    loadHandle()
  }, [])

  // Let user select backup folder
  async function handleSelectBackupFolder() {
    try {
      const handle: FileSystemDirectoryHandle = await (window as any).showDirectoryPicker()
      const perm = await handle.requestPermission({ mode: "readwrite" })
      if (perm === "granted") {
        await set("backupFolderHandle", handle) // save handle in IndexedDB
        setBackupFolder(handle)
      } else {
        alert("Permission refusée pour ce dossier.")
      }
    } catch (err) {
      console.error("Sélection annulée ou erreur :", err)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Paramètres</h2>
        <p className="text-gray-600">Configuration et gestion du système</p>
      </div>

      <div className="p-4 border rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Sauvegarde automatique</h3>
        <p className="mb-2">
          Dossier actuel :{" "}
          <span className="font-mono">
            {backupFolder ? backupFolder.name : "Non défini"}
          </span>
        </p>
        <Button onClick={handleSelectBackupFolder}>
          Sélectionner le dossier de sauvegarde
        </Button>
      </div>
    </div>
  )
}
