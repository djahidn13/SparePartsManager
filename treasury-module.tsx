"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Wallet,
  ArrowUpDown,
  Building2,
  PiggyBank,
} from "lucide-react"
import { useStore } from "@/store"

export default function TreasuryModule() {
  const {
    accounts,
    transfers,
    sales,
    purchases,
    addAccount,
    updateAccount,
    deleteAccount,
    transferBetweenAccounts,
    getAccountById,
  } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAccountType, setSelectedAccountType] = useState("all")
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)

  // Filtrage des comptes
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedAccountType === "all" || account.type === selectedAccountType
    return matchesSearch && matchesType
  })

  // Calculs financiers
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalExpenses = purchases.reduce((sum, purchase) => sum + purchase.total, 0)
  const totalProfit = totalRevenue - totalExpenses
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  // Répartition par mode de paiement
  const paymentMethods = sales.reduce(
    (acc, sale) => {
      acc[sale.mode_paiement] = (acc[sale.mode_paiement] || 0) + sale.total
      return acc
    },
    {} as Record<string, number>,
  )

  // Dettes fournisseurs
  const outstandingDebt = purchases.reduce((sum, purchase) => sum + purchase.reste_a_payer, 0)

  const handleAddAccount = (formData: FormData) => {
    const accountData = {
      name: formData.get("name") as string,
      type: formData.get("type") as "Caisse" | "Banque" | "Autre",
      balance: Number.parseFloat(formData.get("balance") as string) || 0,
      description: (formData.get("description") as string) || undefined,
    }

    addAccount(accountData)
    setIsAddAccountDialogOpen(false)
  }

  const handleTransfer = (formData: FormData) => {
    const transferData = {
      fromAccountId: formData.get("fromAccountId") as string,
      toAccountId: formData.get("toAccountId") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      date: formData.get("date") as string,
      description: formData.get("description") as string,
    }

    transferBetweenAccounts(transferData)
    setIsTransferDialogOpen(false)
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "Caisse":
        return <Wallet className="w-4 h-4" />
      case "Banque":
        return <Building2 className="w-4 h-4" />
      default:
        return <PiggyBank className="w-4 h-4" />
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "Caisse":
        return "bg-green-100 text-green-800"
      case "Banque":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-purple-100 text-purple-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Trésorerie</h2>
          <p className="text-gray-600">Gestion des comptes et flux financiers</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Virement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Effectuer un virement</DialogTitle>
              </DialogHeader>
              <form action={handleTransfer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromAccountId">Compte source *</Label>
                    <Select name="fromAccountId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} ({account.balance.toLocaleString()} DZD)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="toAccountId">Compte destination *</Label>
                    <Select name="toAccountId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} ({account.balance.toLocaleString()} DZD)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Montant *</Label>
                    <Input id="amount" name="amount" type="number" min="0" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" name="description" placeholder="Motif du virement..." required />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Effectuer le virement</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddAccountDialogOpen} onOpenChange={setIsAddAccountDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Compte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un compte</DialogTitle>
              </DialogHeader>
              <form action={handleAddAccount} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du compte *</Label>
                  <Input id="name" name="name" placeholder="Ex: Caisse principale" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type de compte *</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Caisse">Caisse</SelectItem>
                        <SelectItem value="Banque">Banque</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="balance">Solde initial</Label>
                    <Input id="balance" name="balance" type="number" min="0" step="0.01" defaultValue="0" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Description du compte..." />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddAccountDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Créer le compte</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vue d'ensemble financière */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()} DZD</div>
            <p className="text-xs text-muted-foreground">Total des ventes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()} DZD</div>
            <p className="text-xs text-muted-foreground">Total des achats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice</CardTitle>
            <DollarSign className={`h-4 w-4 ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalProfit.toLocaleString()} DZD
            </div>
            <p className="text-xs text-muted-foreground">CA - Dépenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trésorerie totale</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalBalance.toLocaleString()} DZD</div>
            <p className="text-xs text-muted-foreground">Tous comptes confondus</p>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par mode de paiement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Répartition des encaissements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(paymentMethods).map(([method, amount]) => (
              <div key={method} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold text-lg">{amount.toLocaleString()} DZD</div>
                <div className="text-sm text-gray-600">{method}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dettes fournisseurs */}
      {outstandingDebt > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <TrendingDown className="w-5 h-5" />
              Dettes fournisseurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{outstandingDebt.toLocaleString()} DZD</div>
            <p className="text-sm text-orange-700">Montant total à régler</p>
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un compte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedAccountType} onValueChange={setSelectedAccountType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="Caisse">Caisse</SelectItem>
                <SelectItem value="Banque">Banque</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des comptes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Comptes ({filteredAccounts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAccounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`flex items-center gap-1 ${getAccountTypeColor(account.type)}`}>
                        {getAccountIcon(account.type)}
                        {account.type}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-lg mb-1">{account.name}</h3>
                    {account.description && <p className="text-gray-600 text-sm mb-2">{account.description}</p>}
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Solde</div>
                    <div className={`font-bold text-xl ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {account.balance.toLocaleString()} DZD
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedAccountType !== "all"
                ? "Aucun compte trouvé avec ces filtres"
                : "Aucun compte enregistré"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique des virements */}
      {transfers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5" />
              Historique des virements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transfers
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((transfer) => {
                  const fromAccount = getAccountById(transfer.fromAccountId)
                  const toAccount = getAccountById(transfer.toAccountId)

                  return (
                    <div key={transfer.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium">
                            {fromAccount?.name} → {toAccount?.name}
                          </div>
                          <div className="text-sm text-gray-600">{transfer.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{transfer.amount.toLocaleString()} DZD</div>
                          <div className="text-sm text-gray-500">
                            {new Date(transfer.date).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
