"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
} from "lucide-react"
import { useStore, type Purchase } from "@/store"

interface PurchaseItem {
  produit_id: string
  quantite: number
  prix_unitaire: number
  date_exp?: string
  tva_percent?: number
}

export default function PurchasesModule() {
  const {
    purchases,
    suppliers,
    products,
    addPurchase,
    updatePurchase,
    deletePurchase,
    getSupplierById,
    getProductById,
  } = useStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSupplier, setSelectedSupplier] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Master-Detail state
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [isDetailMode, setIsDetailMode] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Form state for new/edit purchase
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    fournisseur_id: "",
    mode_paiement: "Espèces",
    compte: "Maison",
    numero_cheque: "",
    observations: "",
    statut: "En attente" as "En attente" | "Reçu" | "Facturé",
    montant_paye: 0,
    remise_ht: 0,
  })

  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [searchProduct, setSearchProduct] = useState("")

  // Filtrage des achats
  const filteredPurchases = purchases.filter((purchase) => {
    const supplier = getSupplierById(purchase.fournisseur_id)
    const matchesSearch =
      supplier?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || purchase.id.includes(searchTerm)

    const matchesStatus = selectedStatus === "all" || purchase.statut === selectedStatus
    const matchesSupplier = selectedSupplier === "all" || purchase.fournisseur_id === selectedSupplier

    let matchesDate = true
    if (dateFrom && dateTo) {
      const purchaseDate = new Date(purchase.date)
      matchesDate = purchaseDate >= new Date(dateFrom) && purchaseDate <= new Date(dateTo)
    }

    return matchesSearch && matchesStatus && matchesSupplier && matchesDate
  })

  // Navigation functions
  const currentIndex = selectedPurchase ? filteredPurchases.findIndex((p) => p.id === selectedPurchase.id) : -1
  const canGoFirst = currentIndex > 0
  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < filteredPurchases.length - 1
  const canGoLast = currentIndex < filteredPurchases.length - 1

  const goFirst = () => {
    if (canGoFirst) {
      setSelectedPurchase(filteredPurchases[0])
    }
  }

  const goPrevious = () => {
    if (canGoPrevious) {
      setSelectedPurchase(filteredPurchases[currentIndex - 1])
    }
  }

  const goNext = () => {
    if (canGoNext) {
      setSelectedPurchase(filteredPurchases[currentIndex + 1])
    }
  }

  const goLast = () => {
    if (canGoLast) {
      setSelectedPurchase(filteredPurchases[filteredPurchases.length - 1])
    }
  }

  // Calculations
  const calculateItemTotal = (item: PurchaseItem) => {
    return item.quantite * item.prix_unitaire
  }

  const calculateSubtotal = () => {
    return purchaseItems.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const calculateTotalTVA = () => {
    return purchaseItems.reduce((sum, item) => {
      const product = getProductById(item.produit_id)
      if (product) {
        const itemTotal = calculateItemTotal(item)
        return sum + (itemTotal * product.tva) / 100
      }
      return sum
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tva = calculateTotalTVA()
    return subtotal + tva - formData.remise_ht
  }

  // Product search for adding items
  const filteredProducts = products
    .filter(
      (product) =>
        product.designation.toLowerCase().includes(searchProduct.toLowerCase()) ||
        product.reference.toLowerCase().includes(searchProduct.toLowerCase()),
    )
    .slice(0, 10)

  const addPurchaseItem = (productId: string) => {
    const product = getProductById(productId)
    if (product && !purchaseItems.find((item) => item.produit_id === productId)) {
      setPurchaseItems([
        ...purchaseItems,
        {
          produit_id: productId,
          quantite: 1,
          prix_unitaire: product.prix_achat_ht,
          tva_percent: product.tva,
        },
      ])
      setSearchProduct("")
    }
  }

  const updatePurchaseItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...purchaseItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setPurchaseItems(updatedItems)
  }

  const removePurchaseItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index))
  }

  const handleSavePurchase = () => {
    if (purchaseItems.length === 0) return

    const total = calculateTotal()
    const purchaseData = {
      ...formData,
      total,
      reste_a_payer: total - formData.montant_paye,
      items: purchaseItems,
    }

    if (isEditing && selectedPurchase) {
      updatePurchase(selectedPurchase.id, purchaseData)
      setSelectedPurchase({ ...selectedPurchase, ...purchaseData })
    } else {
      addPurchase(purchaseData)
    }

    resetForm()
    setIsDetailMode(false)
    setIsEditing(false)
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      fournisseur_id: "",
      mode_paiement: "Espèces",
      compte: "Maison",
      numero_cheque: "",
      observations: "",
      statut: "En attente",
      montant_paye: 0,
      remise_ht: 0,
    })
    setPurchaseItems([])
    setSearchProduct("")
  }

  const startNewPurchase = () => {
    resetForm()
    setIsDetailMode(true)
    setIsEditing(false)
    setSelectedPurchase(null)
  }

  const startEditPurchase = (purchase: Purchase) => {
    setFormData({
      date: purchase.date,
      fournisseur_id: purchase.fournisseur_id,
      mode_paiement: "Espèces", // Default since not in original structure
      compte: "Maison", // Default
      numero_cheque: "",
      observations: "",
      statut: purchase.statut,
      montant_paye: purchase.montant_paye,
      remise_ht: 0, // Default since not in original structure
    })
    setPurchaseItems(
      purchase.items.map((item) => ({
        produit_id: item.produit_id,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
      })),
    )
    setSelectedPurchase(purchase)
    setIsDetailMode(true)
    setIsEditing(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "En attente":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "Reçu":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "Facturé":
        return <AlertCircle className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "En attente":
        return "secondary"
      case "Reçu":
        return "default"
      case "Facturé":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (isDetailMode) {
    return (
      <div className="space-y-4">
        {/* Header with navigation */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? `Bon de Réception N° BR${selectedPurchase?.id}` : "Nouveau Bon de Réception"}
            </h2>

            {isEditing && (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={goFirst} disabled={!canGoFirst}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goPrevious} disabled={!canGoPrevious}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goNext} disabled={!canGoNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goLast} disabled={!canGoLast}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={startNewPurchase} variant="outline">
              Nouveau
            </Button>
            <Button onClick={handleSavePurchase} disabled={purchaseItems.length === 0}>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Modifier" : "Enregistrer"}
            </Button>
            <Button onClick={() => setIsDetailMode(false)} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Fermer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left side - Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header info */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Observations</Label>
                    <Textarea
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fournisseur">Fournisseur</Label>
                    <Select
                      value={formData.fournisseur_id}
                      onValueChange={(value) => setFormData({ ...formData, fournisseur_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mode">Mode</Label>
                    <Select
                      value={formData.mode_paiement}
                      onValueChange={(value) => setFormData({ ...formData, mode_paiement: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Espèces">Espèces</SelectItem>
                        <SelectItem value="Chèque">Chèque</SelectItem>
                        <SelectItem value="Virement">Virement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="compte">Compte</Label>
                    <Select
                      value={formData.compte}
                      onValueChange={(value) => setFormData({ ...formData, compte: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maison">Maison</SelectItem>
                        <SelectItem value="Banque">Banque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.mode_paiement === "Chèque" && (
                  <div className="mt-4">
                    <Label htmlFor="numero_cheque">N° Chèque</Label>
                    <Input
                      id="numero_cheque"
                      value={formData.numero_cheque}
                      onChange={(e) => setFormData({ ...formData, numero_cheque: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product search and add */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Les Produits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Rechercher un produit par désignation ou référence..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {searchProduct && (
                  <div className="mb-4 max-h-32 overflow-y-auto border rounded">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => addPurchaseItem(product.id)}
                      >
                        <div className="font-medium">{product.designation}</div>
                        <div className="text-sm text-gray-500">
                          Réf: {product.reference} • {product.prix_achat_ht.toFixed(2).toLocaleString()} DZD
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Products table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2 text-sm font-medium">Référence</th>
                        <th className="text-left p-2 text-sm font-medium">Désignation</th>
                        <th className="text-center p-2 text-sm font-medium">Quantité</th>
                        <th className="text-center p-2 text-sm font-medium">Date Exp</th>
                        <th className="text-right p-2 text-sm font-medium">Prix A HT</th>
                        <th className="text-center p-2 text-sm font-medium">TVA %</th>
                        <th className="text-right p-2 text-sm font-medium">Montant HT</th>
                        <th className="text-center p-2 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseItems.map((item, index) => {
                        const product = getProductById(item.produit_id)
                        if (!product) return null

                        return (
                          <tr key={index} className="border-t hover:bg-gray-50">
                            <td className="p-2 text-sm font-mono">{product.reference}</td>
                            <td className="p-2 text-sm">{product.designation}</td>
                            <td className="p-2 text-center">
                              <Input
                                type="number"
                                value={item.quantite}
                                onChange={(e) =>
                                  updatePurchaseItem(index, "quantite", Number.parseInt(e.target.value) || 0)
                                }
                                className="w-20 text-center"
                                min="1"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <Input
                                type="date"
                                value={item.date_exp || ""}
                                onChange={(e) => updatePurchaseItem(index, "date_exp", e.target.value)}
                                className="w-32"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.prix_unitaire}
                                onChange={(e) =>
                                  updatePurchaseItem(index, "prix_unitaire", Number.parseFloat(e.target.value) || 0)
                                }
                                className="w-24 text-right"
                              />
                            </td>
                            <td className="p-2 text-center text-sm">{product.tva.toFixed(2)}%</td>
                            <td className="p-2 text-right font-medium">
                              {calculateItemTotal(item).toFixed(2).toLocaleString()} DZD
                            </td>
                            <td className="p-2 text-center">
                              <Button variant="outline" size="sm" onClick={() => removePurchaseItem(index)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Total HT</div>
                    <div className="text-xl font-bold text-green-600">{calculateSubtotal().toFixed(2).toLocaleString()} DZD</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Total TVA</div>
                    <div className="text-xl font-bold text-blue-600">{calculateTotalTVA().toFixed(2).toLocaleString()} DZD</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Remise HT</div>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.remise_ht}
                      onChange={(e) => setFormData({ ...formData, remise_ht: Number.parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Total TTC</div>
                    <div className="text-2xl font-bold">{Math.round(calculateTotal()).toFixed(2).toLocaleString()} DZD</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Status and actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ancien Solde</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-red-600">0.00 DZD</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Nouveau Solde</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-red-600">
                  {(0.00 + Math.round(calculateTotal())).toFixed(2).toLocaleString()} DZD
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="statut">Statut</Label>
                    <Select
                      value={formData.statut}
                      onValueChange={(value: any) => setFormData({ ...formData, statut: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="En attente">En attente</SelectItem>
                        <SelectItem value="Reçu">Reçu</SelectItem>
                        <SelectItem value="Facturé">Facturé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="montant_paye">Montant Payé (DZD)</Label>
                    <Input
                      id="montant_paye"
                      type="number"
                      step="0.01"
                      value={formData.montant_paye}
                      onChange={(e) =>
                        setFormData({ ...formData, montant_paye: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Le Reste:</span>
                      <span className="font-bold">
                        {(Math.round(calculateTotal()) - formData.montant_paye).toFixed(2).toLocaleString()} DZD
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {formData.statut === "Reçu" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Ce bon est Validé</span>
                </div>
                <div className="text-sm text-green-600 mt-1">Le stock sera automatiquement mis à jour</div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Achats</h2>
          <p className="text-gray-600">Commandes et réceptions fournisseurs</p>
        </div>

        <Button onClick={startNewPurchase}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Fournisseur ou N°..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Du</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div>
              <Label>Au</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div>
              <Label>Fournisseur</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Statut</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Reçu">Reçu</SelectItem>
                  <SelectItem value="Facturé">Facturé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Bons de Réception ({filteredPurchases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium">VA</th>
                  <th className="text-left p-3 font-medium">N° du Bon</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Heure</th>
                  <th className="text-left p-3 font-medium">Fournisseur</th>
                  <th className="text-center p-3 font-medium">MP</th>
                  <th className="text-right p-3 font-medium">Montant HT</th>
                  <th className="text-right p-3 font-medium">Remise HT</th>
                  <th className="text-right p-3 font-medium">Montant TVA</th>
                  <th className="text-right p-3 font-medium">Montant TTC</th>
                  <th className="text-right p-3 font-medium">Montant Versé</th>
                  <th className="text-right p-3 font-medium">Montant Reste</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => {
                  const supplier = getSupplierById(purchase.fournisseur_id)
                  const subtotal = purchase.items.reduce((sum, item) => sum + item.quantite * item.prix_unitaire, 0)
                  const tva = purchase.items.reduce((sum, item) => {
                    const product = getProductById(item.produit_id)
                    return sum + (product ? (item.quantite * item.prix_unitaire * product.tva) / 100 : 0)
                  }, 0)

                  return (
                    <tr key={purchase.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center justify-center">
                          {purchase.statut === "Reçu" && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                        </div>
                      </td>
                      <td className="p-3 font-mono">BR{purchase.id}</td>
                      <td className="p-3">{new Date(purchase.date).toLocaleDateString("fr-FR")}</td>
                      <td className="p-3">
                        {new Date(purchase.date).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="p-3">{supplier?.nom}</td>
                      <td className="p-3 text-center">
                        <Badge variant={getStatusVariant(purchase.statut)} className="text-xs">
                          {getStatusIcon(purchase.statut)}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">{Math.round(subtotal).toFixed(2).toLocaleString()}</td>
                      <td className="p-3 text-right">0,00</td>
                      <td className="p-3 text-right">{Math.round(tva).toFixed(2).toLocaleString()}</td>
                      <td className="p-3 text-right font-medium">{Math.round(purchase.total).toFixed(2).toLocaleString()}</td>
                      <td className="p-3 text-right">{Math.round(purchase.montant_paye).toFixed(2).toLocaleString()}</td>
                      <td className="p-3 text-right">{Math.round(purchase.reste_a_payer).toFixed(2).toLocaleString()}</td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="outline" onClick={() => startEditPurchase(purchase)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deletePurchase(purchase.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredPurchases.length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucune commande trouvée</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
