"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, CheckCircle, Clock, Database, Download, Edit, Eye, EyeOff, Folder, Info, Key, Plus, Settings, Shield, Trash2, Upload, UserCheck, Users } from "lucide-react"
import { useStore } from "@/store"
import { supabase } from '@/lib/supabaseClient'

// --- Backup Helpers ---
import { createClient } from '@supabase/supabase-js'
import { useStore } from './store'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const generateBackupJSON = (state: any) => {
  const data = {
    products: state.products,
    clients: state.clients,
    suppliers: state.suppliers,
    sales: state.sales,
    purchases: state.purchases,
    movements: state.movements,
    accounts: state.accounts,
    transfers: state.transfers,
    users: state.users,
    exportDate: new Date().toISOString(),
  }
  return JSON.stringify(data, null, 2)
}

const saveBackupLocal = (json: string) => {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `autoparts-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const uploadBackupSupabase = async (json: string) => {
  const fileName = `autoparts-backup-${new Date().toISOString().split('T')[0]}.json`
  const { error } = await supabase.from('app_backups').insert({
    filename: fileName,
    data: json,
    created_at: new Date().toISOString(),
  })
  if (error) console.error('Supabase backup error:', error)
}

// Trigger manual backup (local + supabase)
export const triggerManualBackup = async () => {
  const state = useStore.getState()
  const json = generateBackupJSON(state)
  saveBackupLocal(json)
  await uploadBackupSupabase(json)
  alert('✅ Backup exported locally & to Supabase.')
}


export default function SettingsModule() {
  const {
    products,
    clients,
    suppliers,
    sales,
    purchases,
    movements,
    accounts,
    transfers,
    users,
    auth,
    addUser,
    updateUser,
    deleteUser,
    clearAllData,
    importAllData,
  } = useStore()

  const currentUser = auth.currentUser
  const isAdmin = currentUser?.role === "admin"

  // User management state
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user" as "admin" | "user",
    permissions: [] as string[],
    active: true,
  })

  // Security state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Data management state
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showClearDialog, setShowClearDialog] = useState(false)
  // === Sauvegarde automatique (dossier local via File System Access API) ===
  const [backupDirHandle, setBackupDirHandle] = useState<FileSystemDirectoryHandle | null>(null)
  const [backupDirName, setBackupDirName] = useState<string>("")

  // L'utilisateur choisit "D:\\autoparts-backup" (ou autre). Le handle n'est pas sérialisable,
  // donc il faudra re-sélectionner après un rechargement.
  const selectBackupFolder = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker()
      setBackupDirHandle(handle)
      setBackupDirName(handle.name || "Dossier sélectionné")
      alert("Dossier de sauvegarde sélectionné: " + (handle.name || ""))
    } catch (e) {
      console.error("Sélection du dossier annulée/échouée:", e)
    }
  }

  const writeAutoBackup = async () => {
    if (!backupDirHandle) return
    try {
      const state = useStore.getState()
      const payload = {
        products: state.products,
        clients: state.clients,
        suppliers: state.suppliers,
        sales: state.sales,
        purchases: state.purchases,
        movements: state.movements,
        accounts: state.accounts,
        transfers: state.transfers,
        exportDate: new Date().toISOString(),
      }
      const fileName = `autoparts-backup-${new Date().toISOString().split("T")[0]}.json`
      const fileHandle = await backupDirHandle.getFileHandle(fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(JSON.stringify(payload, null, 2))
      await writable.close()
      console.log("Sauvegarde auto écrite:", fileName)
    } catch (e) {
      console.error("Erreur d'écriture de la sauvegarde auto:", e)
    }
  }

  // Déclenche une sauvegarde après tout changement de données, si un dossier a été choisi.
  useEffect(() => {
    if (!backupDirHandle) return
    writeAutoBackup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, clients, suppliers, sales, purchases, movements, accounts, transfers, backupDirHandle])


  // Security settings state (admin only)
  const [securitySettings, setSecuritySettings] = useState({
    sessionDuration: 480, // minutes
    maxLoginAttempts: 3,
    requirePasswordChange: false,
    enableTwoFactor: false,
  })

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) return

    const permissions = newUser.role === "admin" ? ["all"] : ["products:read", "pos", "clients"]

    addUser({
      ...newUser,
      permissions,
    })

    setNewUser({
      username: "",
      password: "",
      role: "user",
      permissions: [],
      active: true,
    })
    setShowAddUserDialog(false)
  }

  const handleEditUser = () => {
    if (!selectedUser) return

    updateUser(selectedUser.id, selectedUser)
    setShowEditUserDialog(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = (userId: string) => {
    if (userId === "admin") {
      alert("Impossible de supprimer l'utilisateur administrateur principal")
      return
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      deleteUser(userId)
    }
  }

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas")
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    // In a real app, you would verify the current password
    updateUser(currentUser!.id, { password: passwordData.newPassword })
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    alert("Mot de passe modifié avec succès")
  }

  const handleExportData = () => {
    const data = {
      products,
      clients,
      suppliers,
      sales,
      purchases,
      movements,
      accounts,
      transfers,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `autoparts-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        importAllData(data)
        alert("Données importées avec succès")
      } catch (error) {
        alert("Erreur lors de l'importation des données")
      }
    }
    reader.readAsText(file)
  }

  const handleClearAllData = () => {
    if (confirmPassword !== currentUser?.password) {
      alert("Mot de passe incorrect")
      return
    }

    clearAllData()
    setConfirmPassword("")
    setShowClearDialog(false)
    alert("Toutes les données ont été supprimées")
  }

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
  }

  const getPermissionsList = (permissions: string[]) => {
    if (permissions.includes("all")) return "Tous les droits"
    return permissions.join(", ") || "Aucun droit spécifique"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Paramètres</h2>
        <p className="text-gray-600">Configuration et gestion du système</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2" disabled={!isAdmin}>
            <Users className="w-4 h-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2" disabled={!isAdmin}>
            <Database className="w-4 h-4" />
            Données
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Statistiques de la base de données
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                  <div className="text-sm text-gray-600">Produits</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{clients.length}</div>
                  <div className="text-sm text-gray-600">Clients</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{suppliers.length}</div>
                  <div className="text-sm text-gray-600">Fournisseurs</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{sales.length}</div>
                  <div className="text-sm text-gray-600">Ventes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Informations utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Utilisateur connecté:</span>
                  <Badge variant="outline">{currentUser?.username}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rôle:</span>
                  <Badge className={getRoleColor(currentUser?.role || "user")}>
                    {currentUser?.role === "admin" ? "Administrateur" : "Utilisateur"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Permissions:</span>
                  <span className="text-sm text-gray-600">{getPermissionsList(currentUser?.permissions || [])}</span>
                </div>
                {currentUser?.last_login && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Dernière connexion:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(currentUser.last_login).toLocaleString("fr-FR")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {!isAdmin && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Vous êtes connecté avec un compte utilisateur standard. Certaines fonctionnalités sont limitées.
                Contactez l'administrateur pour plus de permissions.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Gestion des utilisateurs
                  </CardTitle>
                  <CardDescription>Gérez les comptes utilisateurs et leurs permissions</CardDescription>
                </div>
                <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvel utilisateur
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                      <DialogDescription>Ajoutez un nouveau compte utilisateur au système</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="username">Nom d'utilisateur</Label>
                        <Input
                          id="username"
                          value={newUser.username}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          placeholder="Entrez le nom d'utilisateur"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="Entrez le mot de passe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Rôle</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value: "admin" | "user") => setNewUser({ ...newUser, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Utilisateur</SelectItem>
                            <SelectItem value="admin">Administrateur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={newUser.active}
                          onCheckedChange={(checked) => setNewUser({ ...newUser, active: checked })}
                        />
                        <Label htmlFor="active">Compte actif</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddUser}>Créer l'utilisateur</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role === "admin" ? "Admin" : "Utilisateur"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "default" : "secondary"}>
                          {user.active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_date).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>
                        {user.last_login ? new Date(user.last_login).toLocaleDateString("fr-FR") : "Jamais connecté"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowEditUserDialog(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user.id !== "admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit User Dialog */}
          <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier l'utilisateur</DialogTitle>
                <DialogDescription>Modifiez les informations de l'utilisateur</DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-username">Nom d'utilisateur</Label>
                    <Input
                      id="edit-username"
                      value={selectedUser.username}
                      onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-password">Nouveau mot de passe (optionnel)</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      placeholder="Laissez vide pour conserver l'actuel"
                      onChange={(e) => e.target.value && setSelectedUser({ ...selectedUser, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-role">Rôle</Label>
                    <Select
                      value={selectedUser.role}
                      onValueChange={(value: "admin" | "user") => setSelectedUser({ ...selectedUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Utilisateur</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-active"
                      checked={selectedUser.active}
                      onCheckedChange={(checked) => setSelectedUser({ ...selectedUser, active: checked })}
                    />
                    <Label htmlFor="edit-active">Compte actif</Label>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleEditUser}>Sauvegarder</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Changer le mot de passe
              </CardTitle>
              <CardDescription>Modifiez votre mot de passe de connexion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button onClick={handlePasswordChange} className="w-full">
                Changer le mot de passe
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Paramètres de sécurité système
                </CardTitle>
                <CardDescription>Configuration de la sécurité pour tous les utilisateurs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="session-duration">Durée de session (minutes)</Label>
                    <Input
                      id="session-duration"
                      type="number"
                      value={securitySettings.sessionDuration}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          sessionDuration: Number.parseInt(e.target.value) || 480,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-attempts">Tentatives de connexion max</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          maxLoginAttempts: Number.parseInt(e.target.value) || 3,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require-password-change">Forcer le changement de mot de passe</Label>
                      <p className="text-sm text-gray-500">
                        Obliger les utilisateurs à changer leur mot de passe périodiquement
                      </p>
                    </div>
                    <Switch
                      id="require-password-change"
                      checked={securitySettings.requirePasswordChange}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, requirePasswordChange: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
                      <p className="text-sm text-gray-500">Activer l'authentification à deux facteurs (bientôt)</p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={securitySettings.enableTwoFactor}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, enableTwoFactor: checked })
                      }
                      disabled
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Sécurisé</span>
                      
              <Button onClick={selectBackupFolder} variant="secondary" className="h-24 flex flex-col items-center justify-center">
                <Folder className="w-6 h-6 mb-1" />
                <span>Choisir le dossier auto‑backup</span>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{backupDirName || "Aucun"}</span>
              </Button>
</div>
                      <p className="text-sm text-green-600 mt-1">Système protégé</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">Session active</span>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">{securitySettings.sessionDuration} min</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-700">
                        <Users className="w-5 h-5" />
                        <span className="font-medium">Utilisateurs actifs</span>
                      </div>
                      <p className="text-sm text-orange-600 mt-1">{users.filter((u) => u.active).length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Sauvegarde et restauration
              </CardTitle>
              <CardDescription>Exportez et importez vos données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={handleExportData} className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  Exporter les données
                  <span className="text-xs opacity-75">Télécharger une sauvegarde JSON</span>
                </Button>
                <div>
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" id="import-file" />
                  <Button asChild className="h-20 flex-col w-full">
                    <label htmlFor="import-file" className="cursor-pointer">
                      <Upload className="w-6 h-6 mb-2" />
                      Importer les données
                      <span className="text-xs opacity-75">Restaurer depuis un fichier JSON</span>
                    </label>
                  </Button>
                </div>

        {/* ✅ New button to select & show backup folder */}
        <Button
          onClick={selectBackupFolder}
          variant="secondary"
          className="h-20 flex-col w-full"
        >
          <Folder className="w-6 h-6 mb-2" />
          Dossier de sauvegarde
          <span className="text-xs opacity-75 truncate max-w-[200px]">
            {backupDirName || "Aucun dossier sélectionné"}
          </span>
        </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Zone dangereuse
              </CardTitle>
              <CardDescription>Actions irréversibles - Utilisez avec précaution</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Cette action supprimera définitivement toutes les données du système. Cette action est irréversible.
                </AlertDescription>
              </Alert>

              <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Effacer toutes les données
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Confirmer la suppression</DialogTitle>
                    <DialogDescription>
                      Cette action supprimera définitivement toutes les données du système. Pour confirmer, entrez votre
                      mot de passe.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="confirm-password-clear">Mot de passe de confirmation</Label>
                      <Input
                        id="confirm-password-clear"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Entrez votre mot de passe"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                      Annuler
                    </Button>
                    <Button variant="destructive" onClick={handleClearAllData}>
                      Confirmer la suppression
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  // Auto-upload every hour if admin
  useEffect(() => {
    if (isAdmin) {
      const interval = setInterval(() => {
        handleExportData()
      }, 60 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isAdmin])
}
