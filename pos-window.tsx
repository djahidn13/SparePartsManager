"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  X,
} from "lucide-react"
import { useStore, type Product } from "@/store"

interface CartItem {
  product: Product
  quantity: number
  priceType: "detail" | "gros"
  unitPrice: number
}

export default function POSWindow() {
  const { products, clients, addSale, getClientById } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"Espèces" | "Carte" | "Chèque" | "Virement">("Espèces")
  const [amountReceived, setAmountReceived] = useState("")

  // Filtrage des produits pour la recherche
  const filteredProducts = products
    .filter(
      (product) =>
        product.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code_barre.includes(searchTerm),
    )
    .slice(0, 8)

  // Calculs du panier
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const totalTVA = cart.reduce((sum, item) => {
    const htPrice = item.unitPrice / (1 + item.product.tva / 100)
    return sum + ((htPrice * item.product.tva) / 100) * item.quantity
  }, 0)
  const total = subtotal

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
  }

  const processPayment = () => {
    if (cart.length === 0) return

    const saleData = {
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

    addSale(saleData)
    printReceipt()
    clearCart()

    // Optionally close window after successful sale
    // window.close()
  }

  const printReceipt = () => {
    const receiptContent = `
AUTOPARTS MANAGER
Pièces de rechange automobile
================================
Date: ${new Date().toLocaleString("fr-FR")}
${selectedClient ? `Client: ${getClientById(selectedClient)?.nom}` : "Client: Comptoir"}

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Point de Vente</h1>
          <Button onClick={() => window.close()} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Fermer
          </Button>
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

            {/* Liste des produits */}
            <Card>
              <CardHeader>
                <CardTitle>Produits disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{product.designation}</h4>
                          <p className="text-xs text-gray-500 mb-1">Réf: {product.reference}</p>
                          <Badge
                            variant={product.quantite_disponible < 10 ? "destructive" : "default"}
                            className="text-xs"
                          >
                            Stock: {product.quantite_disponible}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Détail:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{Math.round(product.prix_vente_ttc_detail).toFixed(2).toLocaleString()} DZD</span>
                            <Button
                              size="sm"
                              onClick={() => addToCart(product, "detail")}
                              disabled={product.quantite_disponible === 0}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Gros:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{Math.round(product.prix_vente_ttc_gros).toFixed(2).toLocaleString()} DZD</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToCart(product, "gros")}
                              disabled={product.quantite_disponible === 0}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                    <SelectValue placeholder="Client comptoir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Client comptoir</SelectItem>
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
                    cart.map((item, index) => (
                      <div key={`${item.product.id}-${item.priceType}`} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{item.product.designation}</h5>
                            <p className="text-xs text-gray-500">
                              {item.product.reference} • {item.priceType === "detail" ? "Détail" : "Gros"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id, item.priceType)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.priceType, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.priceType, item.quantity + 1)}
                              disabled={item.quantity >= item.product.quantite_disponible}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{Math.round((item.unitPrice * item.quantity)).toFixed(2).toLocaleString()} DZD</div>
                            <div className="text-xs text-gray-500">{Math.round(item.unitPrice).toFixed(2).toLocaleString()} DZD/u</div>
                          </div>
                        </div>
                      </div>
                    ))
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

                  {paymentMethod === "Espèces" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Montant reçu (DZD)</label>
                      <Input
                        type="number"
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                        placeholder="0"
                        className="text-lg h-12"
                      />
                      {amountReceived && Number.parseFloat(amountReceived) >= total && (
                        <div className="mt-2 p-2 bg-green-50 rounded">
                          <div className="text-green-800 font-medium">
                            Rendu: {Math.round((Number.parseFloat(amountReceived) - total)).toFixed(2).toLocaleString()} DZD
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    className="w-full h-12 text-lg"
                    onClick={processPayment}
                    disabled={
                      paymentMethod === "Espèces" && (!amountReceived || Number.parseFloat(amountReceived) < total)
                    }
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Valider et Imprimer
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
