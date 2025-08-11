"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from '@/lib/supabaseClient'
// Fetch latest backup from Supabase on startup
async function fetchLatestBackup(importAllData: (data: any) => void) {
  try {
    const { data, error } = await supabase
      .from('app_backups')
      .select('data')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('❌ Error fetching backup from Supabase:', error)
      return
    }

    if (data?.data) {
      importAllData(data.data)
      console.log('✅ Data loaded from latest Supabase backup')
    }
  } catch (err) {
    console.error('❌ Unexpected error fetching backup:', err)
  }
}

export interface Product {
  id: string
  reference: string
  designation: string
  famille: string
  sous_famille: string
  tva: number
  prix_achat_ht: number
  prix_achat_ttc: number
  prix_vente_ht_detail: number
  prix_vente_ttc_detail: number
  prix_vente_ht_gros: number
  prix_vente_ttc_gros: number
  quantite_disponible: number
  min_stock: number
  marge_beneficiaire_pourcentage: number
  unite: "Pièce" | "Kit" | "Jeu" | "Lot"
  localisation: string
  perissable: boolean
  date_peremption?: string
  valeur_stock: number
  fournisseur: string
  code_barre: string
}

export interface Client {
  id: string
  nom: string
  adresse: string
  telephone: string
  email: string
  date_creation: string
}

export interface Supplier {
  id: string
  nom: string
  adresse: string
  telephone: string
  email: string
  date_creation: string
}

export interface Purchase {
  id: string
  date: string
  fournisseur_id: string
  total: number
  montant_paye: number
  reste_a_payer: number
  statut: "En attente" | "Reçu" | "Facturé"
  items: Array<{
    produit_id: string
    quantite: number
    prix_unitaire: number
  }>
}

export interface Sale {
  id: string
  date: string
  client_id?: string
  total: number
  mode_paiement: "Espèces" | "Carte" | "Chèque" | "Virement"
  items: Array<{
    produit_id: string
    quantite: number
    prix_unitaire: number
    type_prix: "detail" | "gros"
  }>
}

export interface Movement {
  id: string
  produit_id: string
  type_mouvement: "Entrée" | "Sortie"
  quantite: number
  date: string
  commentaire: string
  reference_document?: string
}

export interface Account {
  id: string
  name: string
  balance: number
  type: "Caisse" | "Banque" | "Autre"
  description?: string
}

export interface Transfer {
  id: string
  date: string
  fromAccountId: string
  toAccountId: string
  amount: number
  description: string
}

// New interfaces for user management
export interface User {
  id: string
  username: string
  password: string
  role: "admin" | "user"
  permissions: string[]
  created_date: string
  last_login?: string
  active: boolean
}

export interface AuthState {
  isAuthenticated: boolean
  currentUser: User | null
}

interface Store {
  products: Product[]
  clients: Client[]
  suppliers: Supplier[]
  purchases: Purchase[]
  sales: Sale[]
  movements: Movement[]
  accounts: Account[]
  transfers: Transfer[]
  users: User[]
  auth: AuthState

  // Actions pour les produits
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  replaceAllProducts: (products: Omit<Product, "id">[]) => void

  // Actions pour les clients
  addClient: (client: Omit<Client, "id">) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void

  // Actions pour les fournisseurs
  addSupplier: (supplier: Omit<Supplier, "id">) => void
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void

  // Actions pour les achats
  addPurchase: (purchase: Omit<Purchase, "id">) => void
  updatePurchase: (id: string, purchase: Partial<Purchase>) => void
  deletePurchase: (id: string) => void

  // Actions pour les ventes
  addSale: (sale: Omit<Sale, "id">) => void
  deleteSale: (id: string) => void
  updateSale: (id: string, updates: Partial<Sale>) => void

  // Actions pour les mouvements
  addMovement: (movement: Omit<Movement, "id">) => void

  // Actions pour les comptes
  addAccount: (account: Omit<Account, "id">) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  deleteAccount: (id: string) => void
  transferBetweenAccounts: (transfer: Omit<Transfer, "id">) => void
  getAccountById: (id: string) => Account | undefined

  // Actions pour l'authentification
  login: (username: string, password: string) => boolean
  logout: () => void
  addUser: (user: Omit<User, "id" | "created_date">) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  hasPermission: (permission: string) => boolean

  // Actions pour les paramètres
  clearAllData: () => void
  importAllData: (data: any) => void

  // Utilitaires
  getProductById: (id: string) => Product | undefined
  getClientById: (id: string) => Client | undefined
  getSupplierById: (id: string) => Supplier | undefined
}

// Données d'exemple
const sampleProducts: Product[] = [
  {
    id: "1",
    reference: "PLQ001",
    designation: "Plaquettes de frein avant Renault Clio",
    famille: "Freinage",
    sous_famille: "Plaquettes",
    tva: 19,
    prix_achat_ht: 2500,
    prix_achat_ttc: 2975,
    prix_vente_ht_detail: 4000,
    prix_vente_ttc_detail: 4760,
    prix_vente_ht_gros: 3500,
    prix_vente_ttc_gros: 4165,
    quantite_disponible: 25,
    min_stock: 10,
    marge_beneficiaire_pourcentage: 60,
    unite: "Jeu",
    localisation: "A1-B2",
    perissable: false,
    valeur_stock: 62500,
    fournisseur: "1",
    code_barre: "3661434567890",
  },
  {
    id: "2",
    reference: "FLT002",
    designation: "Filtre à huile Peugeot 308",
    famille: "Filtration",
    sous_famille: "Filtres huile",
    tva: 19,
    prix_achat_ht: 800,
    prix_achat_ttc: 952,
    prix_vente_ht_detail: 1500,
    prix_vente_ttc_detail: 1785,
    prix_vente_ht_gros: 1200,
    prix_vente_ttc_gros: 1428,
    quantite_disponible: 50,
    min_stock: 15,
    marge_beneficiaire_pourcentage: 80,
    unite: "Pièce",
    localisation: "B3-C1",
    perissable: false,
    valeur_stock: 40000,
    fournisseur: "2",
    code_barre: "3661434567891",
  },
  {
    id: "3",
    reference: "HUI003",
    designation: "Huile moteur 5W30 - 5L",
    famille: "Lubrifiants",
    sous_famille: "Huiles moteur",
    tva: 19,
    prix_achat_ht: 3200,
    prix_achat_ttc: 3808,
    prix_vente_ht_detail: 5500,
    prix_vente_ttc_detail: 6545,
    prix_vente_ht_gros: 4800,
    prix_vente_ttc_gros: 5712,
    quantite_disponible: 8,
    min_stock: 5,
    marge_beneficiaire_pourcentage: 70,
    unite: "Lot",
    localisation: "C2-D1",
    perissable: true,
    date_peremption: "2025-12-31",
    valeur_stock: 25600,
    fournisseur: "1",
    code_barre: "3661434567892",
  },
]

const sampleClients: Client[] = [
  {
    id: "1",
    nom: "Ahmed Benali",
    adresse: "123 Rue de la République, Alger",
    telephone: "0555123456",
    email: "ahmed.benali@email.com",
    date_creation: "2024-01-15",
  },
  {
    id: "2",
    nom: "Fatima Khelifi",
    adresse: "456 Avenue Pasteur, Oran",
    telephone: "0666789012",
    email: "fatima.khelifi@email.com",
    date_creation: "2024-02-20",
  },
]

const sampleSuppliers: Supplier[] = [
  {
    id: "1",
    nom: "AutoParts Distribution",
    adresse: "789 Zone Industrielle, Rouiba",
    telephone: "021456789",
    email: "contact@autoparts-dz.com",
    date_creation: "2023-06-10",
  },
  {
    id: "2",
    nom: "Pièces Auto Maghreb",
    adresse: "321 Rue des Frères Bouadou, Constantine",
    telephone: "031987654",
    email: "info@pam-dz.com",
    date_creation: "2023-08-15",
  },
]

const sampleSales: Sale[] = [
  {
    id: "1",
    date: "2024-01-20",
    client_id: "1",
    total: 4760,
    mode_paiement: "Espèces",
    items: [
      {
        produit_id: "1",
        quantite: 1,
        prix_unitaire: 4760,
        type_prix: "detail",
      },
    ],
  },
  {
    id: "2",
    date: "2024-01-19",
    total: 3570,
    mode_paiement: "Carte",
    items: [
      {
        produit_id: "2",
        quantite: 2,
        prix_unitaire: 1785,
        type_prix: "detail",
      },
    ],
  },
]

const sampleAccounts: Account[] = [
  {
    id: "1",
    name: "Caisse",
    balance: 50000,
    type: "Caisse",
    description: "Caisse principale du magasin",
  },
  {
    id: "2",
    name: "Banque principale",
    balance: 250000,
    type: "Banque",
    description: "Compte bancaire principal",
  },
  {
    id: "3",
    name: "Banque secondaire",
    balance: 100000,
    type: "Banque",
    description: "Compte bancaire secondaire",
  },
  {
    id: "4",
    name: "Bénéfice",
    balance: 75000,
    type: "Autre",
    description: "Compte des bénéfices",
  },
  {
    id: "5",
    name: "Maison",
    balance: 30000,
    type: "Autre",
    description: "Compte personnel",
  },
]

// Default admin user - THIS IS THE CORRECT PASSWORD
const defaultUsers: User[] = [
  {
    id: "admin",
    username: "admin",
    password: "Cobra13#",
    role: "admin",
    permissions: ["all"],
    created_date: "2024-01-01",
    active: true,
  },
]

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      products: sampleProducts,
      clients: sampleClients,
      suppliers: sampleSuppliers,
      purchases: [],
      sales: sampleSales,
      movements: [],
      accounts: sampleAccounts,
      transfers: [],
      users: defaultUsers,
      auth: {
        isAuthenticated: false,
        currentUser: null,
      },

      // Actions pour les produits
      addProduct: (product) => {
        const id = Date.now().toString()
        set((state) => ({
          products: [...state.products, { ...product, id }],
        }))
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }))
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }))
      },

      replaceAllProducts: (newProducts) => {
        const productsWithIds = newProducts.map((product, index) => ({
          ...product,
          id: `imported_${Date.now()}_${index}`,
        }))

        set(() => ({
          products: productsWithIds,
          movements: [],
          sales: [],
        }))
      },

      // Actions pour les clients
      addClient: (client) => {
        const id = Date.now().toString()
        set((state) => ({
          clients: [...state.clients, { ...client, id }],
        }))
      },

      updateClient: (id, updates) => {
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },

      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        }))
      },

      // Actions pour les fournisseurs
      addSupplier: (supplier) => {
        const id = Date.now().toString()
        set((state) => ({
          suppliers: [...state.suppliers, { ...supplier, id }],
        }))
      },

      updateSupplier: (id, updates) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }))
      },

      deleteSupplier: (id) => {
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
        }))
      },

      // Actions pour les achats
      addPurchase: (purchase) => {
        const id = Date.now().toString()
        const purchaseWithDefaults = {
          ...purchase,
          id,
          montant_paye: purchase.montant_paye || 0,
          reste_a_payer: purchase.reste_a_payer || purchase.total || 0,
        }

        set((state) => {
          let updatedProducts = state.products
          let newMovements = state.movements

          if (purchase.statut === "Reçu") {
            updatedProducts = state.products.map((product) => {
              const purchaseItem = purchase.items.find((item) => item.produit_id === product.id)
              if (purchaseItem) {
                return {
                  ...product,
                  quantite_disponible: product.quantite_disponible + purchaseItem.quantite,
                  valeur_stock: (product.quantite_disponible + purchaseItem.quantite) * product.prix_achat_ht,
                }
              }
              return product
            })

            const stockMovements = purchase.items.map((item) => ({
              id: `purchase_${id}_${item.produit_id}`,
              produit_id: item.produit_id,
              type_mouvement: "Entrée" as const,
              quantite: item.quantite,
              date: purchase.date,
              commentaire: `Réception commande #${id}`,
              reference_document: `BR${id}`,
            }))

            newMovements = [...state.movements, ...stockMovements]
          }

          return {
            purchases: [...state.purchases, purchaseWithDefaults],
            products: updatedProducts,
            movements: newMovements,
          }
        })
      },

      updatePurchase: (id, updates) => {
        set((state) => {
          const existingPurchase = state.purchases.find((p) => p.id === id)
          if (!existingPurchase) return state

          const updatedPurchase = { ...existingPurchase, ...updates }
          let updatedProducts = state.products
          let newMovements = state.movements

          if (existingPurchase.statut !== "Reçu" && updates.statut === "Reçu") {
            updatedProducts = state.products.map((product) => {
              const purchaseItem = existingPurchase.items.find((item) => item.produit_id === product.id)
              if (purchaseItem) {
                return {
                  ...product,
                  quantite_disponible: product.quantite_disponible + purchaseItem.quantite,
                  valeur_stock: (product.quantite_disponible + purchaseItem.quantite) * product.prix_achat_ht,
                }
              }
              return product
            })

            const stockMovements = existingPurchase.items.map((item) => ({
              id: `purchase_update_${id}_${item.produit_id}_${Date.now()}`,
              produit_id: item.produit_id,
              type_mouvement: "Entrée" as const,
              quantite: item.quantite,
              date: updates.date || existingPurchase.date,
              commentaire: `Réception commande #${id} (mise à jour)`,
              reference_document: `BR${id}`,
            }))

            newMovements = [...state.movements, ...stockMovements]
          } else if (existingPurchase.statut === "Reçu" && updates.statut !== "Reçu") {
            updatedProducts = state.products.map((product) => {
              const purchaseItem = existingPurchase.items.find((item) => item.produit_id === product.id)
              if (purchaseItem) {
                return {
                  ...product,
                  quantite_disponible: Math.max(0, product.quantite_disponible - purchaseItem.quantite),
                  valeur_stock:
                    Math.max(0, product.quantite_disponible - purchaseItem.quantite) * product.prix_achat_ht,
                }
              }
              return product
            })

            const reverseMovements = existingPurchase.items.map((item) => ({
              id: `purchase_reverse_${id}_${item.produit_id}_${Date.now()}`,
              produit_id: item.produit_id,
              type_mouvement: "Sortie" as const,
              quantite: item.quantite,
              date: new Date().toISOString().split("T")[0],
              commentaire: `Annulation réception commande #${id}`,
              reference_document: `ANN-BR${id}`,
            }))

            newMovements = [...state.movements, ...reverseMovements]
          }

          return {
            purchases: state.purchases.map((p) => (p.id === id ? updatedPurchase : p)),
            products: updatedProducts,
            movements: newMovements,
          }
        })
      },

      deletePurchase: (id) => {
        const purchase = get().purchases.find((p) => p.id === id)
        if (!purchase) return

        set((state) => {
          let updatedProducts = state.products
          let newMovements = state.movements

          if (purchase.statut === "Reçu") {
            updatedProducts = state.products.map((product) => {
              const purchaseItem = purchase.items.find((item) => item.produit_id === product.id)
              if (purchaseItem) {
                return {
                  ...product,
                  quantite_disponible: Math.max(0, product.quantite_disponible - purchaseItem.quantite),
                  valeur_stock:
                    Math.max(0, product.quantite_disponible - purchaseItem.quantite) * product.prix_achat_ht,
                }
              }
              return product
            })

            const reverseMovements = purchase.items.map((item) => ({
              id: `purchase_delete_${id}_${item.produit_id}_${Date.now()}`,
              produit_id: item.produit_id,
              type_mouvement: "Sortie" as const,
              quantite: item.quantite,
              date: new Date().toISOString().split("T")[0],
              commentaire: `Suppression commande #${id}`,
              reference_document: `SUPP-BR${id}`,
            }))

            newMovements = [...state.movements, ...reverseMovements]
          }

          return {
            purchases: state.purchases.filter((p) => p.id !== id),
            products: updatedProducts,
            movements: newMovements,
          }
        })
      },

      // Actions pour les ventes
      addSale: (sale) => {
        const id = Date.now().toString()
        const newSale = { ...sale, id }

        set((state) => {
          const updatedProducts = state.products.map((product) => {
            const saleItem = sale.items.find((item) => item.produit_id === product.id)
            if (saleItem) {
              return {
                ...product,
                quantite_disponible: Math.max(0, product.quantite_disponible - saleItem.quantite),
              }
            }
            return product
          })

          const newMovements = sale.items.map((item) => ({
            id: `${Date.now()}-${item.produit_id}`,
            produit_id: item.produit_id,
            type_mouvement: "Sortie" as const,
            quantite: item.quantite,
            date: sale.date,
            commentaire: `Vente #${id}`,
            reference_document: id,
          }))

          return {
            sales: [...state.sales, newSale],
            products: updatedProducts,
            movements: [...state.movements, ...newMovements],
          }
        })
      },

      deleteSale: (id) => {
        const sale = get().sales.find((s) => s.id === id)
        if (!sale) return

        set((state) => {
          const updatedProducts = state.products.map((product) => {
            const saleItem = sale.items.find((item) => item.produit_id === product.id)
            if (saleItem) {
              return {
                ...product,
                quantite_disponible: product.quantite_disponible + saleItem.quantite,
              }
            }
            return product
          })

          const restockMovements = sale.items.map((item) => ({
            id: `restock_${Date.now()}_${item.produit_id}`,
            produit_id: item.produit_id,
            type_mouvement: "Entrée" as const,
            quantite: item.quantite,
            date: new Date().toISOString().split("T")[0],
            commentaire: `Suppression vente #${id} - Restitution stock`,
            reference_document: `Suppr-${id}`,
          }))

          return {
            sales: state.sales.filter((s) => s.id !== id),
            products: updatedProducts,
            movements: [...state.movements, ...restockMovements],
          }
        })
      },

      updateSale: (id, updates) => {
        const existingSale = get().sales.find((s) => s.id === id)
        if (!existingSale) return

        set((state) => {
          let updatedProducts = state.products.map((product) => {
            const originalItem = existingSale.items.find((item) => item.produit_id === product.id)
            if (originalItem) {
              return {
                ...product,
                quantite_disponible: product.quantite_disponible + originalItem.quantite,
              }
            }
            return product
          })

          if (updates.items) {
            updatedProducts = updatedProducts.map((product) => {
              const newItem = updates.items?.find((item) => item.produit_id === product.id)
              if (newItem) {
                return {
                  ...product,
                  quantite_disponible: Math.max(0, product.quantite_disponible - newItem.quantite),
                }
              }
              return product
            })
          }

          let newMovements = state.movements.filter((movement) => movement.reference_document !== id)

          if (updates.items) {
            const updateMovements = updates.items.map((item) => ({
              id: `update_${Date.now()}_${item.produit_id}`,
              produit_id: item.produit_id,
              type_mouvement: "Sortie" as const,
              quantite: item.quantite,
              date: updates.date || existingSale.date,
              commentaire: `Vente modifiée #${id}`,
              reference_document: id,
            }))

            newMovements = [...newMovements, ...updateMovements]
          }

          return {
            sales: state.sales.map((s) => (s.id === id ? { ...s, ...updates } : s)),
            products: updatedProducts,
            movements: newMovements,
          }
        })
      },

      // Actions pour les mouvements
      addMovement: (movement) => {
        const id = Date.now().toString()
        set((state) => ({
          movements: [...state.movements, { ...movement, id }],
        }))
      },

      // Actions pour les comptes
      addAccount: (account) => {
        const id = Date.now().toString()
        set((state) => ({
          accounts: [...state.accounts, { ...account, id }],
        }))
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }))
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        }))
      },

      transferBetweenAccounts: (transfer) => {
        const id = Date.now().toString()
        const { fromAccountId, toAccountId, amount, date, description } = transfer

        if (fromAccountId === toAccountId) return

        set((state) => {
          const updatedAccounts = state.accounts.map((account) => {
            if (account.id === fromAccountId) {
              return { ...account, balance: account.balance - amount }
            }
            if (account.id === toAccountId) {
              return { ...account, balance: account.balance + amount }
            }
            return account
          })

          return {
            accounts: updatedAccounts,
            transfers: [...state.transfers, { id, fromAccountId, toAccountId, amount, date, description }],
          }
        })
      },

      getAccountById: (id) => {
        return get().accounts.find((a) => a.id === id)
      },

      // Actions pour l'authentification
      login: (username, password) => {
        console.log("Login attempt:", { username, password }) // Debug log
        const user = get().users.find((u) => u.username === username && u.password === password && u.active)
        console.log("Found user:", user) // Debug log
        console.log("All users:", get().users) // Debug log

        if (user) {
          set((state) => ({
            auth: {
              isAuthenticated: true,
              currentUser: user,
            },
            users: state.users.map((u) => (u.id === user.id ? { ...u, last_login: new Date().toISOString() } : u)),
          }))
          return true
        }
        return false
      },

      logout: () => {
        set(() => ({
          auth: {
            isAuthenticated: false,
            currentUser: null,
          },
        }))
      },

      addUser: (user) => {
        const id = Date.now().toString()
        const newUser = {
          ...user,
          id,
          created_date: new Date().toISOString().split("T")[0],
        }
        set((state) => ({
          users: [...state.users, newUser],
        }))
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        }))
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }))
      },

      hasPermission: (permission) => {
        const { currentUser } = get().auth
        if (!currentUser) return false
        if (currentUser.role === "admin" || currentUser.permissions.includes("all")) return true
        return currentUser.permissions.includes(permission)
      },

      // Actions pour les paramètres
      clearAllData: () => {
        set(() => ({
          products: [],
          clients: [],
          suppliers: [],
          purchases: [],
          sales: [],
          movements: [],
          accounts: [],
          transfers: [],
        }))
      },

      importAllData: (data) => {

import { supabase } from '@/lib/supabaseClient'

// Manual backup trigger — callable from console: uploadBackupNow()
export async function uploadBackupNow() {
  try {
    const state = useStore.getState() // get current app data
    const { error } = await supabase
      .from('app_backups')
      .insert([{ data: state }])

    if (error) {
      console.error('❌ Error uploading backup to Supabase:', error)
    } else {
      console.log('✅ Backup uploaded to Supabase')
    }
  } catch (err) {
    console.error('❌ Unexpected error uploading backup:', err)
  }
}

// Attach to window so you can call it in console
if (typeof window !== "undefined") {
  // @ts-ignore
  window.uploadBackupNow = uploadBackupNow
}

// Fetch latest backup from Supabase at startup
async function fetchLatestBackup(importAllData: (data: any) => void) {
  try {
    const { data, error } = await supabase
      .from('app_backups')
      .select('data')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('❌ Error fetching backup from Supabase:', error)
      return
    }

    if (data?.data) {
      importAllData(data.data)
      console.log('✅ Data loaded from latest Supabase backup')
    }
  } catch (err) {
    console.error('❌ Unexpected error fetching backup:', err)
  }
}

// Run on startup (browser only)
if (typeof window !== "undefined") {
  fetchLatestBackup(useStore.getState().importAllData)
}

// Realtime updates from Supabase
supabase
  .channel('realtime:app_backups')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'app_backups' },
    () => {
      console.log('🔄 New backup detected from Supabase Realtime')
      fetchLatestBackup(useStore.getState().importAllData)
    }
  )
  .subscribe()

        set(() => ({
          products: data.products || [],
          clients: data.clients || [],
          suppliers: data.suppliers || [],
          purchases: data.purchases || [],
          sales: data.sales || [],
          movements: data.movements || [],
          accounts: data.accounts || [],
          transfers: data.transfers || [],
        }))
      },

      // Utilitaires
      getProductById: (id) => {
        return get().products.find((p) => p.id === id)
      },

      getClientById: (id) => {
        return get().clients.find((c) => c.id === id)
      },

      getSupplierById: (id) => {
        return get().suppliers.find((s) => s.id === id)
      },
    }),
    {
      name: "auto-parts-storage",
    },
  ),
)
