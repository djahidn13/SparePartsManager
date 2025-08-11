"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Package } from "lucide-react"
import { useStore, type Supplier } from "@/store"

export default function SuppliersModule() {
  const { suppliers, products, purchases, addSupplier, updateSupplier, deleteSupplier } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Filtrage des fournisseurs
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.telephone.includes(searchTerm) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculer les statistiques des fournisseurs
  const getSupplierStats = (supplierId: string) => {
    const supplierProducts = products.filter((product) => product.fournisseur_id === supplierId)
    const supplierPurchases = purchases.filter((purchase) => purchase.fournisseur_id === supplierId)
    const totalPurchases = supplierPurchases.reduce((sum, purchase) => sum + purchase.total, 0)

    return {
      totalProducts: supplierProducts.length,
      totalPurchases: supplierPurchases.length,
      totalAmount: totalPurchases,
    }
  }

  const handleAddSupplier = (formData: FormData) => {
    const supplierData = {
      nom: formData.get("nom") as string,
      adresse: formData.get("adresse") as string,
      telephone: formData.get("telephone") as string,
      email: formData.get("email") as string,
      date_creation: new Date().toISOString().split("T")[0],
    }

    addSupplier(supplierData)
    setIsAddDialogOpen(false)
  }

  const handleEditSupplier = (formData: FormData) => {
    if (!editingSupplier) return

    const updates = {
      nom: formData.get("nom") as string,
      adresse: formData.get("adresse") as string,
      telephone: formData.get("telephone") as string,
      email: formData.get("email") as string,
    }

    updateSupplier(editingSupplier.id, updates)
    setIsEditDialogOpen(false)
    setEditingSupplier(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Fournisseurs</h2>
          <p className="text-gray-600">Fichier fournisseurs et historique d'achats</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Fournisseur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
            </DialogHeader>
            <form action={handleAddSupplier} className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom de l'entreprise *</Label>
                <Input id="nom" name="nom" required />
              </div>

              <div>
                <Label htmlFor="adresse">Adresse</Label>
                <Input id="adresse" name="adresse" />
              </div>

              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" name="telephone" type="tel" />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
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

      {/* Recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par nom, téléphone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des fournisseurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Fournisseurs ({filteredSuppliers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => {
              const stats = getSupplierStats(supplier.id)

              return (
                <div key={supplier.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{supplier.nom}</h3>
                      <Badge variant="secondary" className="text-xs">
                        Depuis {new Date(supplier.date_creation).toLocaleDateString("fr-FR")}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingSupplier(supplier)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteSupplier(supplier.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {supplier.adresse && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{supplier.adresse}</span>
                      </div>
                    )}

                    {supplier.telephone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{supplier.telephone}</span>
                      </div>
                    )}

                    {supplier.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{supplier.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {stats.totalProducts}
                        </div>
                        <div className="text-gray-500">Produits</div>
                      </div>
                      <div>
                        <div className="font-medium">{stats.totalPurchases}</div>
                        <div className="text-gray-500">Commandes</div>
                      </div>
                    </div>

                    <div className="mt-2 text-sm">
                      <div className="font-medium">{stats.totalAmount.toLocaleString()} DZD</div>
                      <div className="text-gray-500">Total achats</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "Aucun fournisseur trouvé" : "Aucun fournisseur enregistré"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le fournisseur</DialogTitle>
          </DialogHeader>
          {editingSupplier && (
            <form action={handleEditSupplier} className="space-y-4">
              <div>
                <Label htmlFor="edit-nom">Nom de l'entreprise *</Label>
                <Input id="edit-nom" name="nom" defaultValue={editingSupplier.nom} required />
              </div>

              <div>
                <Label htmlFor="edit-adresse">Adresse</Label>
                <Input id="edit-adresse" name="adresse" defaultValue={editingSupplier.adresse} />
              </div>

              <div>
                <Label htmlFor="edit-telephone">Téléphone</Label>
                <Input id="edit-telephone" name="telephone" type="tel" defaultValue={editingSupplier.telephone} />
              </div>

              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" name="email" type="email" defaultValue={editingSupplier.email} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
