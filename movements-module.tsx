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
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react"
import { useStore } from "@/store"

export default function MovementsModule() {
  const {
    movements,
    products,
    addMovement,
    getProductById,
    updateProduct,
    purchases,
    sales,
    getSupplierById,
    getClientById,
  } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0])
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0])


  // Filtrage des mouvements
  const filteredMovements = movements.filter((movement) => {
    const movementDate = new Date(movement.date)
    const product = getProductById(movement.produit_id)
    const matchesSearch =
      product?.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.commentaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reference_document?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedType === "all" || movement.type_mouvement === selectedType
    const matchesProduct = selectedProduct === "all" || movement.produit_id === selectedProduct

    const isInRange = movementDate >= new Date(fromDate) && movementDate <= new Date(toDate)

    return matchesSearch && matchesType && matchesProduct && isInRange
  })

  // Statistiques
  const totalEntries = movements.filter((m) => m.type_mouvement === "Entrée").length
  const totalExits = movements.filter((m) => m.type_mouvement === "Sortie").length
  const totalEntriesQty = movements.filter((m) => m.type_mouvement === "Entrée").reduce((sum, m) => sum + m.quantite, 0)
  const totalExitsQty = movements.filter((m) => m.type_mouvement === "Sortie").reduce((sum, m) => sum + m.quantite, 0)

  const handleAddMovement = (formData: FormData) => {
    const movementData = {
      produit_id: formData.get("produit_id") as string,
      type_mouvement: formData.get("type_mouvement") as "Entrée" | "Sortie",
      quantite: Number.parseInt(formData.get("quantite") as string),
      date: formData.get("date") as string,
      commentaire: formData.get("commentaire") as string,
      reference_document: (formData.get("reference_document") as string) || undefined,
    }

    addMovement(movementData)
    setIsAddDialogOpen(false)
  }

  const getMovementIcon = (type: string) => {
    return type === "Entrée" ? (
      <ArrowUpCircle className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownCircle className="w-4 h-4 text-red-600" />
    )
  }

  const getMovementVariant = (type: string) => {
    return type === "Entrée" ? "default" : "destructive"
  }

  // Component for Product Movement History
  function ProductMovementHistory() {
    const { products, purchases, sales, movements, getProductById, getSupplierById, getClientById } = useStore()
    const [selectedProductId, setSelectedProductId] = useState("")
    const [productSearchTerm, setProductSearchTerm] = useState("")

    const filteredProductsForSearch = products
      .filter(
        (product) =>
          product.designation.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
          product.reference.toLowerCase().includes(productSearchTerm.toLowerCase()),
      )
      .slice(0, 10)

    const selectedProduct = selectedProductId ? getProductById(selectedProductId) : null

    // Get movement history for selected product
    const productMovements = selectedProductId
      ? movements
          .filter((movement) => movement.produit_id === selectedProductId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      : []

    // Get purchase and sale details for movements
    const getMovementDetails = (movement: any) => {
      if (movement.type_mouvement === "Entrée") {
        // Find related purchase
        const relatedPurchase = purchases.find(
          (purchase) =>
            movement.reference_document?.includes(purchase.id) || movement.commentaire.includes(purchase.id),
        )

        if (relatedPurchase) {
          const supplier = getSupplierById(relatedPurchase.fournisseur_id)
          const purchaseItem = relatedPurchase.items.find((item) => item.produit_id === movement.produit_id)

          return {
            type: "purchase",
            reference: `BR${relatedPurchase.id}`,
            date: relatedPurchase.date,
            prixAchatTTC: purchaseItem ? purchaseItem.prix_unitaire * (1 + (selectedProduct?.tva || 0) / 100) : 0,
            prixVente: selectedProduct?.prix_vente_ttc_detail || 0,
            entity: supplier?.nom || "Fournisseur inconnu",
          }
        }
      } else {
        // Find related sale
        const relatedSale = sales.find(
          (sale) => movement.reference_document === sale.id || movement.commentaire.includes(sale.id),
        )

        if (relatedSale) {
          const client = relatedSale.client_id ? getClientById(relatedSale.client_id) : null
          const saleItem = relatedSale.items.find((item) => item.produit_id === movement.produit_id)

          return {
            type: "sale",
            reference: `CT2025/${relatedSale.id.padStart(5, "0")}`,
            date: relatedSale.date,
            prixAchatTTC: (selectedProduct?.prix_achat_ht || 0) * (1 + (selectedProduct?.tva || 0) / 100),
            prixVenteTTC: saleItem?.prix_unitaire || 0,
            entity: client?.nom || "Comptoir",
          }
        }
      }

      return {
        type: movement.type_mouvement === "Entrée" ? "purchase" : "sale",
        reference: movement.reference_document || "Manuel",
        date: movement.date,
        prixAchatTTC: (selectedProduct?.prix_achat_ht || 0) * (1 + (selectedProduct?.tva || 0) / 100),
        prixVente: selectedProduct?.prix_vente_ttc_detail || 0,
        prixVenteTTC: selectedProduct?.prix_vente_ttc_detail || 0,
        entity: movement.type_mouvement === "Entrée" ? "Ajustement manuel" : "Vente manuelle",
      }
    }

    return (
      <div className="space-y-4">
        {/* Product Search */}
        <div>
          <Label>Rechercher un produit</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par désignation ou référence..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Product Selection */}
        {productSearchTerm && (
          <div className="border rounded-lg max-h-32 overflow-y-auto">
            {filteredProductsForSearch.map((product) => (
              <div
                key={product.id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => {
                  setSelectedProductId(product.id)
                  setProductSearchTerm("")
                }}
              >
                <div className="font-medium">{product.designation}</div>
                <div className="text-sm text-gray-500">
                  Réf: {product.reference} • Stock: {product.quantite_disponible}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Product Info */}
        {selectedProduct && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg">{selectedProduct.designation}</h3>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div>Référence: {selectedProduct.reference}</div>
              <div>Stock actuel: {selectedProduct.quantite_disponible}</div>
              <div>Prix achat HT: {selectedProduct.prix_achat_ht.toLocaleString()} DZD</div>
              <div>Prix vente TTC: {selectedProduct.prix_vente_ttc_detail.toLocaleString()} DZD</div>
            </div>
          </div>
        )}

        {/* Movement History Table */}
        {selectedProduct && productMovements.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Référence</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-center p-3 font-medium">Quantité</th>
                  <th className="text-right p-3 font-medium">Prix Achat TTC</th>
                  <th className="text-right p-3 font-medium">Prix Vente TTC</th>
                  <th className="text-left p-3 font-medium">Entité</th>
                  <th className="text-left p-3 font-medium">Commentaire</th>
                </tr>
              </thead>
              <tbody>
                {productMovements.map((movement) => {
                  const details = getMovementDetails(movement)

                  return (
                    <tr key={movement.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <Badge variant={movement.type_mouvement === "Entrée" ? "default" : "destructive"}>
                          {movement.type_mouvement === "Entrée" ? "Entrée" : "Sortie"}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-sm">{details.reference}</td>
                      <td className="p-3">{new Date(details.date).toLocaleDateString("fr-FR")}</td>
                      <td className="p-3 text-center font-bold">
                        {movement.type_mouvement === "Entrée" ? "+" : "-"}
                        {movement.quantite}
                      </td>
                      <td className="p-3 text-right">{details.prixAchatTTC.toLocaleString()} DZD</td>
                      <td className="p-3 text-right">
                        {details.type === "sale"
                          ? (details.prixVenteTTC ?? 0).toLocaleString()
                          : (details.prixVente ?? 0).toLocaleString()}{" "}
                        DZD
                      </td>
                      <td className="p-3">{details.entity}</td>
                      <td className="p-3 text-sm text-gray-600">{movement.commentaire}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedProduct && productMovements.length === 0 && (
          <div className="text-center py-8 text-gray-500">Aucun mouvement trouvé pour ce produit</div>
        )}
      </div>
    )
  }

  // Component for Inventory Adjustment
  function InventoryAdjustment() {
    const [selectedProductId, setSelectedProductId] = useState("")
    const [productSearchTerm, setProductSearchTerm] = useState("")
    const [newQuantity, setNewQuantity] = useState("")
    const [reason, setReason] = useState("")

    const filteredProductsForSearch = products
      .filter(
        (product) =>
          product.designation.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
          product.reference.toLowerCase().includes(productSearchTerm.toLowerCase()),
      )
      .slice(0, 10)

    const selectedProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) : null
    const quantityDifference =
      selectedProduct && newQuantity ? Number.parseInt(newQuantity) - selectedProduct.quantite_disponible : 0

    const handleInventoryAdjustment = () => {
      if (!selectedProduct || !newQuantity || !reason) {
        alert("Veuillez remplir tous les champs")
        return
      }

      const newQty = Number.parseInt(newQuantity)
      const currentQty = selectedProduct.quantite_disponible
      const difference = newQty - currentQty

      if (difference === 0) {
        alert("Aucune différence détectée")
        return
      }

      try {
        // Create movement record
        const movementData = {
          produit_id: selectedProduct.id,
          type_mouvement: difference > 0 ? "Entrée" : ("Sortie" as "Entrée" | "Sortie"),
          quantite: Math.abs(difference),
          date: new Date().toISOString().split("T")[0],
          commentaire: `Ajustement inventaire: ${reason}`,
          reference_document: `INV${Date.now()}`,
        }

        // Update product quantity and value
        updateProduct(selectedProduct.id, {
          quantite_disponible: newQty,
          valeur_stock: newQty * selectedProduct.prix_achat_ht,
        })

        // Add movement record
        addMovement(movementData)

        // Reset form
        setSelectedProductId("")
        setProductSearchTerm("")
        setNewQuantity("")
        setReason("")

        alert("Ajustement d'inventaire effectué avec succès!")

        // Close the dialog by triggering a re-render
        window.location.reload()
      } catch (error) {
        console.error("Erreur lors de l'ajustement:", error)
        alert("Erreur lors de l'ajustement d'inventaire")
      }
    }

    return (
      <div className="space-y-4">
        {/* Product Search */}
        <div>
          <Label>Rechercher un produit</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par désignation ou référence..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Product Selection */}
        {productSearchTerm && (
          <div className="border rounded-lg max-h-32 overflow-y-auto">
            {filteredProductsForSearch.map((product) => (
              <div
                key={product.id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => {
                  setSelectedProductId(product.id)
                  setProductSearchTerm("")
                  setNewQuantity(product.quantite_disponible.toString())
                }}
              >
                <div className="font-medium">{product.designation}</div>
                <div className="text-sm text-gray-500">
                  Réf: {product.reference} • Stock actuel: {product.quantite_disponible}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Product and Adjustment */}
        {selectedProduct && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg">{selectedProduct.designation}</h3>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>Référence: {selectedProduct.reference}</div>
                <div>
                  Stock système: <span className="font-bold">{selectedProduct.quantite_disponible}</span>
                </div>
                <div>Localisation: {selectedProduct.localisation}</div>
                <div>Unité: {selectedProduct.unite}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newQuantity">Stock physique réel</Label>
                <Input
                  id="newQuantity"
                  type="number"
                  min="0"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  placeholder="Quantité réelle comptée"
                />
              </div>
              <div>
                <Label>Différence</Label>
                <div
                  className={`p-2 rounded border text-center font-bold ${
                    quantityDifference > 0
                      ? "bg-green-50 text-green-600 border-green-200"
                      : quantityDifference < 0
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {quantityDifference > 0 ? "+" : ""}
                  {quantityDifference}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Motif de l'ajustement *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Inventaire physique, produit endommagé, erreur de saisie..."
                required
              />
            </div>

            {quantityDifference !== 0 && (
              <div
                className={`p-4 rounded-lg border ${
                  quantityDifference > 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="font-medium">{quantityDifference > 0 ? "Entrée en stock" : "Sortie de stock"}</div>
                <div className="text-sm mt-1">
                  {quantityDifference > 0
                    ? `+${quantityDifference} unité(s) seront ajoutées au stock`
                    : `${Math.abs(quantityDifference)} unité(s) seront retirées du stock`}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedProductId("")
                  setProductSearchTerm("")
                  setNewQuantity("")
                  setReason("")
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleInventoryAdjustment}
                disabled={!newQuantity || !reason || quantityDifference === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Effectuer l'ajustement
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] px-2">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mouvements de Stock</h2>
          <p className="text-gray-600">Historique des entrées et sorties</p>
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Mouvement de produit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Historique des mouvements par produit</DialogTitle>
              </DialogHeader>
              <ProductMovementHistory />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Inventaire
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajustement d'inventaire</DialogTitle>
              </DialogHeader>
              <InventoryAdjustment />
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Mouvement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un mouvement de stock</DialogTitle>
              </DialogHeader>
              <form action={handleAddMovement} className="space-y-4">
                <div>
                  <Label htmlFor="produit_id">Produit *</Label>
                  <Select name="produit_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un produit..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.designation} ({product.reference})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type_mouvement">Type de mouvement *</Label>
                    <Select name="type_mouvement" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrée">Entrée</SelectItem>
                        <SelectItem value="Sortie">Sortie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantite">Quantité *</Label>
                    <Input id="quantite" name="quantite" type="number" min="1" required />
                  </div>
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

                <div>
                  <Label htmlFor="reference_document">Référence document</Label>
                  <Input id="reference_document" name="reference_document" placeholder="Bon de livraison, facture..." />
                </div>

                <div>
                  <Label htmlFor="commentaire">Commentaire *</Label>
                  <Textarea id="commentaire" name="commentaire" placeholder="Motif du mouvement..." required />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Enregistrer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entrées</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalEntries}</div>
            <p className="text-xs text-muted-foreground">mouvements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sorties</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExits}</div>
            <p className="text-xs text-muted-foreground">mouvements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qté Entrées</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalEntriesQty}</div>
            <p className="text-xs text-muted-foreground">unités</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qté Sorties</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExitsQty}</div>
            <p className="text-xs text-muted-foreground">unités</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">

            <div className="flex gap-2 items-center">
              <Label htmlFor="fromDate">Du</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <Label htmlFor="toDate">Au</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par produit, commentaire ou référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="Entrée">Entrées</SelectItem>
                <SelectItem value="Sortie">Sorties</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les produits</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.designation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des mouvements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Mouvements ({filteredMovements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMovements
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((movement) => {
                const product = getProductById(movement.produit_id)
                if (!product) return null

                return (
                  <div key={movement.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={getMovementVariant(movement.type_mouvement)}
                            className="flex items-center gap-1"
                          >
                            {getMovementIcon(movement.type_mouvement)}
                            {movement.type_mouvement}
                          </Badge>
                          <span className="font-bold text-lg">
                            {movement.type_mouvement === "Entrée" ? "+" : "-"}
                            {movement.quantite}
                          </span>
                          <span className="text-gray-500">{product.unite}</span>
                        </div>

                        <h3 className="font-semibold text-lg mb-1">{product.designation}</h3>
                        <p className="text-gray-600 text-sm mb-2">Réf: {product.reference}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(movement.date).toLocaleDateString("fr-FR")}
                          </div>
                          {movement.reference_document && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {movement.reference_document}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Stock actuel</div>
                        <div className="font-bold text-lg">{product.quantite_disponible}</div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm font-medium text-gray-700 mb-1">Commentaire:</div>
                        <p className="text-sm">{movement.commentaire}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>

          {filteredMovements.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedType !== "all" || selectedProduct !== "all"
                ? "Aucun mouvement trouvé avec ces filtres"
                : "Aucun mouvement enregistré"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
