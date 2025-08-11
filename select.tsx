"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Search, Plus, Edit, Trash2 } from "lucide-react"
import { useStore } from "@/store"
import { Label } from "@/components/ui/label"

interface SalesModuleProps {
  onNavigateToPOS?: () => void
}

const formatRounded = (value: number): string =>
  Math.round(value).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD"

export default function SalesModule({ onNavigateToPOS }: SalesModuleProps = {}) {
  const { sales, getClientById, getProductById, deleteSale } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("client")

  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return firstOfMonth.toISOString().split("T")[0]
  })

  const [dateTo, setDateTo] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })

  const filteredSales = sales.filter((sale) => {
    let matchesSearch = true

    if (searchTerm) {
      if (searchType === "client") {
        const client = sale.client_id ? getClientById(sale.client_id) : null
        matchesSearch = client
          ? client.nom.toLowerCase().includes(searchTerm.toLowerCase())
          : "comptoir".includes(searchTerm.toLowerCase())
      } else {
        matchesSearch = sale.id.toLowerCase().includes(searchTerm.toLowerCase())
      }
    }

    let matchesDate = true
    if (dateFrom && dateTo) {
      const saleDate = new Date(sale.date)
      const fromDate = new Date(dateFrom)
      const toDate = new Date(dateTo)
      fromDate.setHours(0, 0, 0, 0)
      toDate.setHours(23, 59, 59, 999)
      matchesDate = saleDate >= fromDate && saleDate <= toDate
    }

    return matchesSearch && matchesDate
  })

  const getSaleStats = (sale: any) => {
    const subtotal = sale.items.reduce((sum: number, item: any) => {
      return sum + item.quantite * item.prix_unitaire
    }, 0)

    const tva = sale.items.reduce((sum: number, item: any) => {
      const product = getProductById(item.produit_id)
      if (product) {
        const itemTotal = item.quantite * item.prix_unitaire
        return sum + (itemTotal * product.tva) / 100
      }
      return sum
    }, 0)

    const coutAchat = sale.items.reduce((sum: number, item: any) => {
      const product = getProductById(item.produit_id)
      if (product) {
        return sum + item.quantite * product.prix_achat_ht
      }
      return sum
    }, 0)

    const marge = subtotal - coutAchat

    return {
      subtotal,
      tva,
      total: sale.total,
      coutAchat,
      marge,
      montantVerse: sale.total,
    }
  }

  const startEditSale = (sale: any) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("editingSale", JSON.stringify(sale))
    }
    if (onNavigateToPOS) {
      onNavigateToPOS()
    } else {
      if ((window as any).setActiveTab) {
        ;(window as any).setActiveTab("pos")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Ventes</h2>
          <p className="text-gray-600">Historique et suivi des ventes</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input type="radio" id="client" name="searchType" value="client" checked={searchType === "client"} onChange={(e) => setSearchType(e.target.value)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" title="Rechercher par client" />
                  <Label htmlFor="client">Par Client</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" id="bon" name="searchType" value="bon" checked={searchType === "bon"} onChange={(e) => setSearchType(e.target.value)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" title="Rechercher par numéro de bon" />
                  <Label htmlFor="bon">Par N° de Bon</Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder={searchType === "client" ? "Nom du client..." : "N° de bon..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <Label>Du:</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <Label>Au:</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tickets de Caisse ({filteredSales.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2 font-medium">VA</th>
                  <th className="text-left p-2 font-medium">N° du bon</th>
                  <th className="text-left p-2 font-medium">Date</th>
                  <th className="text-left p-2 font-medium">Heure</th>
                  <th className="text-left p-2 font-medium">Client</th>
                  <th className="text-right p-2 font-medium">Remise HT</th>
                  <th className="text-right p-2 font-medium">Montant TVA</th>
                  <th className="text-right p-2 font-medium">Montant TTC</th>
                  <th className="text-right p-2 font-medium">Montant Versé</th>
                  <th className="text-right p-2 font-medium">Marge</th>
                  <th className="text-left p-2 font-medium">Agent</th>
                  <th className="text-center p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale) => {
                  const client = sale.client_id ? getClientById(sale.client_id) : null
                  const stats = getSaleStats(sale)
                  const saleDate = new Date(sale.date)

                  return (
                    <tr key={sale.id} className="border-t hover:bg-gray-50">
                      <td className="p-2"><div className="flex items-center justify-center"><div className="w-3 h-3 bg-green-500 rounded-full"></div></div></td>
                      <td className="p-2 font-mono text-blue-600">CT2025/{sale.id.padStart(5, "0")}</td>
                      <td className="p-2">{saleDate.toLocaleDateString("fr-FR")}</td>
                      <td className="p-2">{saleDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</td>
                      <td className="p-2">{client ? client.nom : "Comptoir"}</td>
                      <td className="p-2 text-right">0,00</td>
                      <td className="p-2 text-right">{formatRounded(stats.tva)}</td>
                      <td className="p-2 text-right font-medium">{formatRounded(stats.total)}</td>
                      <td className="p-2 text-right">{formatRounded(stats.montantVerse)}</td>
                      <td className="p-2 text-right text-green-600 font-medium">{formatRounded(stats.marge)}</td>
                      <td className="p-2">Admin</td>
                      <td className="p-2">
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="outline" onClick={() => startEditSale(sale)}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => deleteSale(sale.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || dateFrom || dateTo ? "Aucune vente trouvée avec ces filtres" : "Aucune vente enregistrée"}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{filteredSales.length}</div>
            <div className="text-sm text-gray-600">Total Ventes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {formatRounded(filteredSales.reduce((sum, sale) => sum + sale.total, 0))}
            </div>
            <div className="text-sm text-gray-600">Chiffre d'Affaires</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">
              {formatRounded(filteredSales.reduce((sum, sale) => {
                const stats = getSaleStats(sale)
                return sum + stats.tva
              }, 0))}
            </div>
            <div className="text-sm text-gray-600">Total TVA</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">
              {formatRounded(filteredSales.reduce((sum, sale) => {
                const stats = getSaleStats(sale)
                return sum + stats.marge
              }, 0))}
            </div>
            <div className="text-sm text-gray-600">Marge Totale</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
