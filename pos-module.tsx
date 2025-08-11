"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Printer,
  User,
  Calculator,
} from "lucide-react"
import { useStore, type Product } from "@/store"

interface CartItem {
  product: Product
  quantity: number
  priceType: "detail" | "gros"
  unitPrice: number
}

export default function POSModule() {
  const { products, clients, addSale, getClientById, getProductById, deleteSale, updateSale } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"Espèces" | "Carte" | "Chèque" | "Virement">("Espèces")
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [amountReceived, setAmountReceived] = useState("")
  const [discount, setDiscount] = useState(0)

  // Check for editing sale from sessionStorage
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null)

  // Load sale for editing on component mount
  useEffect(() => {
    const editingSaleData = sessionStorage.getItem("editingSale")
    if (editingSaleData) {
      try {
        const sale = JSON.parse(editingSaleData)
        setIsEditingMode(true)
        setEditingSaleId(sale.id)

        // Set client
        if (sale.client_id) {
          setSelectedClient(sale.client_id)
        }

        // Set payment method
        setPaymentMethod(sale.mode_paiement)

        // Reconstruct cart from sale items
        const reconstructedCart: CartItem[] = sale.items
          .map((item: any) => {
            const product = getProductById(item.produit_id)
            if (product) {
              return {
                product,
                quantity: item.quantite,
                priceType: item.type_prix,
                unitPrice: item.prix_unitaire,
              }
            }
            return null
          })
          .filter(Boolean)

        setCart(reconstructedCart)

        // Clear the session storage
        sessionStorage.removeItem("editingSale")
      } catch (error) {
        console.error("Error loading sale for editing:", error)
      }
    }
  }, [getProductById])

  // Filtrage des produits pour la recherche
  const filteredProducts = products
    .filter(
      (product) =>
        product.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code_barre.includes(searchTerm),
    )
    .slice(0, 10) // Limiter à 10 résultats

  // Calculs du panier
  
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const totalTVA = cart.reduce((sum, item) => {
    const htPrice = item.unitPrice / (1 + item.product.tva / 100)
    return sum + ((htPrice * item.product.tva) / 100) * item.quantity
  }, 0)
  const total = subtotal - discount

  const totalMargin = cart.reduce((sum, item) => {
    const prixAchat = item.product.prix_achat || 0
    return sum + ((item.unitPrice - prixAchat) * item.quantity)
  }, 0) - discount


  const addToCart = (product: Product, priceType: "detail" | "gros") => {
    const existingItem = cart.find((item) => item.product.id === product.id && item.priceType === priceType)
    const unitPrice = priceType === "detail" ? product.prix_vente_ttc_detail : product.prix_vente_ttc_gros

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id && item.priceType === priceType
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      )
    } else {
      setCart([...cart, { product, quantity: 1, priceType, unitPrice }])
    }
  }

  const updateQuantity = (productId: string, priceType: "detail" | "gros", newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, priceType)
    } else {
      setCart(
        cart.map((item) =>
          item.product.id === productId && item.priceType === priceType ? { ...item, quantity: newQuantity } : item,
        ),
      )
    }
  }

  const removeFromCart = (productId: string, priceType: "detail" | "gros") => {
    setCart(cart.filter((item) => !(item.product.id === productId && item.priceType === priceType)))
  }

  const clearCart = () => {
    setCart([])
    setSelectedClient("")
    setAmountReceived("")
    setIsEditingMode(false)
    setEditingSaleId(null)
  }

  const processPayment = (withPrint = false) => {
    if (cart.length === 0) return

    const saleData = {
      remise: discount, // ✅ Save discount
      date: new Date().toISOString(),
      client_id: selectedClient || undefined,
      total,
      mode_paiement: paymentMethod,
      items: cart.map((item) => ({
        produit_id: item.product.id,
        quantite: item.quantity,
        prix_unitaire: item.unitPrice,
        type_prix: item.priceType,
      })),
    }

    try {
      if (isEditingMode && editingSaleId) {
        // Update existing sale
        updateSale(editingSaleId, saleData)
        console.log("Sale updated successfully:", editingSaleId)
      } else {
        // Create new sale
        addSale(saleData)
        console.log("New sale created successfully")
      }

      if (withPrint) {
        printReceipt()
      }

      // Clear cart and reset state
      clearCart()
      setShowPaymentDialog(false)

      // Show success message
      alert(isEditingMode ? "Vente modifiée avec succès!" : "Vente enregistrée avec succès!")
    } catch (error) {
      console.error("Error saving sale:", error)
      alert("Erreur lors de l'enregistrement de la vente")
    }
  }

  const printReceipt = () => {
    const receiptContent = `
AUTOPARTS MANAGER
Pièces de rechange automobile
================================
Date: ${new Date().toLocaleString("fr-FR")}
${selectedClient ? `Client: ${getClientById(selectedClient)?.nom}` : "Client: Particulier"}

ARTICLES:
${cart
  .map(
    (item) => `
${item.product.designation}
Réf: ${item.product.reference}
${item.quantity} x ${Math.round(item.unitPrice).toFixed(2).toLocaleString()} DZD = ${Math.round((item.quantity * item.unitPrice)).toFixed(2).toLocaleString()} DZD
`,
  )
  .join("")}

================================
Sous-total HT: ${Math.round((subtotal - totalTVA)).toFixed(2).toLocaleString()} DZD
TVA: ${Math.round(totalTVA).toFixed(2).toLocaleString()} DZD
Remise: ${Math.round(discount).toFixed(2).toLocaleString()} DZD
TOTAL TTC: ${Math.round(total).toFixed(2).toLocaleString()} DZD

Mode de paiement: ${paymentMethod}
${
  paymentMethod === "Espèces" && amountReceived
    ? `
Reçu: ${Math.round(Number.parseFloat(amountReceived)).toFixed(2).toLocaleString()} DZD
Rendu: ${Math.round((Number.parseFloat(amountReceived) - total)).toFixed(2).toLocaleString()} DZD
`
    : ""
}

Merci de votre visite !
================================
    `

    // Ouvrir une nouvelle fenêtre pour l'impression
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket de caisse</title>
            <style>
              body { font-family: monospace; font-size: 12px; margin: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${receiptContent}</pre>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `)
    }
  }

  const calculateChange = () => {
    if (paymentMethod === "Espèces" && amountReceived) {
      return Number.parseFloat(amountReceived) - total
    }
    return 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Point de Vente (POS)
          {isEditingMode && <span className="text-orange-600 ml-2">(Modification)</span>}
        </h2>
        <p className="text-gray-600">
          {isEditingMode ? `Modification du ticket #${editingSaleId}` : "Interface tactile pour les ventes"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone de recherche et produits */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recherche */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher par référence, désignation ou code barre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 text-lg h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Table des produits */}
          {searchTerm && (
            <Card>
              <CardHeader>
                <CardTitle>Produits disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium">Référence</th>
                        <th className="text-left p-3 font-medium">Désignation</th>
                        <th className="text-center p-3 font-medium">Stock</th>
                        <th className="text-right p-3 font-medium">Prix Détail</th>
                        <th className="text-right p-3 font-medium">Prix Gros</th>
                        <th className="text-center p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-t hover:bg-gray-50">
                          <td className="p-3 font-mono text-sm">{product.reference}</td>
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{product.designation}</div>
                              <div className="text-sm text-gray-500">{product.code_barre}</div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant={product.quantite_disponible < 10 ? "destructive" : "default"}
                              className="text-xs"
                            >
                              {product.quantite_disponible}
                            </Badge>
                          </td>
                          <td className="p-3 text-right font-medium">
                            {Math.round(product.prix_vente_ttc_detail).toFixed(2).toLocaleString()} DZD
                          </td>
                          <td className="p-3 text-right font-medium">
                            {Math.round(product.prix_vente_ttc_gros).toFixed(2).toLocaleString()} DZD
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1 justify-center">
                              <Button
                                size="sm"
                                onClick={() => addToCart(product, "detail")}
                                disabled={product.quantite_disponible === 0}
                                className="text-xs"
                              >
                                + Détail
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToCart(product, "gros")}
                                disabled={product.quantite_disponible === 0}
                                className="text-xs"
                              >
                                + Gros
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredProducts.length === 0 && searchTerm && (
                  <div className="text-center py-4 text-gray-500">Aucun produit trouvé</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panier et paiement */}
        <div className="space-y-4">
          {/* Sélection client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Client particulier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Client particulier</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Panier */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Panier ({cart.length})
                </div>
                {cart.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearCart}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Panier vide</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2 font-medium">Produit</th>
                          <th className="text-center p-2 font-medium">Qté</th>
                          <th className="text-right p-2 font-medium">Prix</th>
                          <th className="text-right p-2 font-medium">Total</th>
                          <th className="text-center p-2 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item, index) => (
                          <tr key={`${item.product.id}-${item.priceType}`} className="border-t">
                            <td className="p-2">
                              <div>
                                <div className="font-medium text-xs">{item.product.designation}</div>
                                <div className="text-xs text-gray-500">
                                  {item.product.reference} • {item.priceType === "detail" ? "Détail" : "Gros"}
                                </div>
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.product.id, item.priceType, item.quantity - 1)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.product.id, item.priceType, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.quantite_disponible}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                            <td className="p-2 text-right text-xs">{Math.round(item.unitPrice).toFixed(2).toLocaleString()}</td>
                            <td className="p-2 text-right font-medium text-xs">
                              {Math.round((item.unitPrice * item.quantity)).toFixed(2).toLocaleString()}
                            </td>
                            <td className="p-2 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.product.id, item.priceType)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Totaux */}
          {cart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Totaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total HT:</span>
                    <span>{Math.round((subtotal - totalTVA)).toFixed(2).toLocaleString()} DZD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA:</span>
                    <span>{Math.round(totalTVA).toFixed(2).toLocaleString()} DZD</span>
                  </div>

                  {/* Remise */}
                  <div className="flex justify-between items-center">
                    <span>Remise:</span>
                    <Input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-24 text-right"
                    />
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>TOTAL TTC:</span>
                      <span>{Math.round(total).toFixed(2).toLocaleString()} DZD</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paiement */}
          {cart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mode de paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Espèces">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        Espèces
                      </div>
                    </SelectItem>
                    <SelectItem value="Carte">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Carte bancaire
                      </div>
                    </SelectItem>
                    <SelectItem value="Chèque">Chèque</SelectItem>
                    <SelectItem value="Virement">Virement</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="w-full h-12 text-lg" onClick={() => setShowPaymentDialog(true)}>
                  {isEditingMode ? "Modifier la vente" : "Valider la vente"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog de confirmation de paiement */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {isEditingMode ? "Modification de paiement" : "Confirmation de paiement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Prix total */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Prix Total</div>
                <div className="text-2xl font-bold text-blue-600">{Math.round(total).toFixed(2).toLocaleString()} DZD</div>
              </div>
            </div>

            {/* Mode de paiement */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Mode de paiement</div>
              <Badge variant="outline" className="text-sm">
                {paymentMethod}
              </Badge>
            </div>

            {/* Montant perçu (seulement pour espèces) */}
            {paymentMethod === "Espèces" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-center">Montant perçu (DZD)</label>
                <Input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="0"
                  className="text-lg h-12 text-center"
                />
              </div>
            )}

            {/* Montant rendu */}
            {paymentMethod === "Espèces" && amountReceived && Number.parseFloat(amountReceived) >= total && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Montant rendu</div>
                  <div className="text-xl font-bold text-green-600">{Math.round(calculateChange()).toFixed(2).toLocaleString()} DZD</div>
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => processPayment(false)}
                className="w-full h-12"
                disabled={paymentMethod === "Espèces" && (!amountReceived || Number.parseFloat(amountReceived) < total)}
              >
                {isEditingMode ? "Confirmer Modification" : "Confirmer"}
              </Button>
              <Button
                onClick={() => processPayment(true)}
                variant="outline"
                className="w-full h-12"
                disabled={paymentMethod === "Espèces" && (!amountReceived || Number.parseFloat(amountReceived) < total)}
              >
                <Printer className="w-4 h-4 mr-2" />
                {isEditingMode ? "Modifier et Imprimer" : "Confirmer et Imprimer"}
              </Button>
            </div>

            <Button variant="ghost" onClick={() => setShowPaymentDialog(false)} className="w-full">
              Annuler
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
