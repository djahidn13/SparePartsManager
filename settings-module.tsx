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
import {
  Settings,
  Database,
  Users,
  Shield,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  Key,
  Clock,
  UserCheck,
} from "lucide-react"
import { useStore } from "@/store"
import { supabase } from '@/lib/supabaseClient'

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

  // Security settings state (admin only)
  const [securitySettings, setSecuritySettings] = useState({
    sessionDuration: 480, // minutes
    maxLoginAttempts: 3,
    requirePasswordChange: false,
    enableTwoFactor: false,
  })

  // Auto-upload every hour if admin
  useEffect(() => {
    if (isAdmin) {
      const interval = setInterval(() => {
        handleExportData()
      }, 60 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isAdmin])

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
      {/* ... UI unchanged from your uploaded file ... */}
    </div>
  )
}
