"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Calendar } from "lucide-react"
import { useStore, type Client } from "@/store"

export default function ClientsModule() {
  const { clients, sales, addClient, updateClient, deleteClient } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Filtrage des clients
  const filteredClients = clients.filter(
    (client) =>
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telephone.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculer les statistiques des clients
  const getClientStats = (clientId: string) => {
    const clientSales = sales.filter((sale) => sale.client_id === clientId)
    const totalSpent = clientSales.reduce((sum, sale) => sum + sale.total, 0)
    const lastPurchase =
      clientSales.length > 0 ? new Date(Math.max(...clientSales.map((sale) => new Date(sale.date).getTime()))) : null

    return {
      totalPurchases: clientSales.length,
      totalSpent,
      lastPurchase,
    }
  }

  const handleAddClient = (formData: FormData) => {
    const clientData = {
      nom: formData.get("nom") as string,
      adresse: formData.get("adresse") as string,
      telephone: formData.get("telephone") as string,
      email: formData.get("email") as string,
      date_creation: new Date().toISOString().split("T")[0],
    }

    addClient(clientData)
    setIsAddDialogOpen(false)
  }

  const handleEditClient = (formData: FormData) => {
    if (!editingClient) return

    const updates = {
      nom: formData.get("nom") as string,
      adresse: formData.get("adresse") as string,
      telephone: formData.get("telephone") as string,
      email: formData.get("email") as string,
    }

    updateClient(editingClient.id, updates)
    setIsEditDialogOpen(false)
    setEditingClient(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Clients</h2>
          <p className="text-gray-600">Fichier client et historique d'achats</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
            </DialogHeader>
            <form action={handleAddClient} className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom complet *</Label>
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

      {/* Liste des clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Clients ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              const stats = getClientStats(client.id)

              return (
                <div key={client.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{client.nom}</h3>
                      <Badge variant="secondary" className="text-xs">
                        Client depuis {new Date(client.date_creation).toLocaleDateString("fr-FR")}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingClient(client)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteClient(client.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {client.adresse && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{client.adresse}</span>
                      </div>
                    )}

                    {client.telephone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{client.telephone}</span>
                      </div>
                    )}

                    {client.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{client.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">{stats.totalPurchases}</div>
                        <div className="text-gray-500">Achats</div>
                      </div>
                      <div>
                        <div className="font-medium">{stats.totalSpent.toLocaleString()} DZD</div>
                        <div className="text-gray-500">Total dépensé</div>
                      </div>
                    </div>

                    {stats.lastPurchase && (
                      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Dernier achat: {stats.lastPurchase.toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "Aucun client trouvé" : "Aucun client enregistré"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <form action={handleEditClient} className="space-y-4">
              <div>
                <Label htmlFor="edit-nom">Nom complet *</Label>
                <Input id="edit-nom" name="nom" defaultValue={editingClient.nom} required />
              </div>

              <div>
                <Label htmlFor="edit-adresse">Adresse</Label>
                <Input id="edit-adresse" name="adresse" defaultValue={editingClient.adresse} />
              </div>

              <div>
                <Label htmlFor="edit-telephone">Téléphone</Label>
                <Input id="edit-telephone" name="telephone" type="tel" defaultValue={editingClient.telephone} />
              </div>

              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" name="email" type="email" defaultValue={editingClient.email} />
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
