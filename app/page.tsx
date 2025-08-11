"use client"

import { useState, useEffect, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Car,
  Package,
  Users,
  Truck,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  User,
  AlertTriangle,
  DollarSign,
  Activity,
  CreditCard,
  ArrowUpRight,
} from "lucide-react"
import { useStore } from "@/store"
import ProductsModule from "@/products-module"
import ClientsModule from "@/clients-module"
import SuppliersModule from "@/suppliers-module"
import PurchasesModule from "@/purchases-module"
import SalesModule from "@/sales-module"
import POSModule from "@/pos-module"
import MovementsModule from "@/movements-module"
import TreasuryModule from "@/treasury-module"
import SettingsModule from "@/settings-module"
import LoginPage from "@/login-page"

type ActiveModule =
  | "dashboard"
  | "products"
  | "clients"
  | "suppliers"
  | "purchases"
  | "sales"
  | "pos"
  | "movements"
  | "treasury"
  | "settings"

function AppSidebar() {
  const { auth, logout } = useStore()
  const currentUser = auth.currentUser
  const isAdmin = currentUser?.role === "admin"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-sidebar-primary-foreground">
                <Car className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">AutoParts Manager</span>
                <span className="truncate text-xs">Gestion des pièces auto</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "dashboard" }))}
                  tooltip="Tableau de bord"
                >
                  <BarChart3 />
                  <span>Tableau de bord</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "products" }))}
                  tooltip="Produits"
                >
                  <Package />
                  <span>Produits</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "clients" }))}
                  tooltip="Clients"
                >
                  <Users />
                  <span>Clients</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "suppliers" }))}
                    tooltip="Fournisseurs"
                  >
                    <Truck />
                    <span>Fournisseurs</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Transactions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "purchases" }))}
                    tooltip="Achats"
                  >
                    <ShoppingCart />
                    <span>Achats</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "sales" }))}
                  tooltip="Ventes"
                >
                  <TrendingUp />
                  <span>Ventes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "pos" }))}
                  tooltip="Point de Vente"
                >
                  <CreditCard />
                  <span>Point de Vente</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "movements" }))}
                      tooltip="Mouvements"
                    >
                      <Activity />
                      <span>Mouvements</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "treasury" }))}
                      tooltip="Trésorerie"
                    >
                      <DollarSign />
                      <span>Trésorerie</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Système</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "settings" }))}
                  tooltip="Paramètres"
                >
                  <Settings />
                  <span>Paramètres</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  tooltip={`${currentUser?.username} - ${currentUser?.role === "admin" ? "Administrateur" : "Utilisateur"}`}
                >
                  <User className="size-4" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{currentUser?.username}</span>
                    <span className="truncate text-xs">
                      {currentUser?.role === "admin" ? "Administrateur" : "Utilisateur"}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={logout}>
                  <LogOut />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function Dashboard() {
  const { products, clients, suppliers, sales, purchases, accounts } = useStore()
  
// Calculate statistics
  const totalProducts = products.length
  const lowStockProducts = products.filter((p) => p.quantite_disponible <= p.min_stock).length
  const outOfStockProducts = products.filter((p) => p.quantite_disponible === 0).length
  const totalClients = clients.length

  // Calculate sales statistics
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
  const todaySales = sales
    .filter((sale) => {
      const saleDate = new Date(sale.date).toDateString()
      const today = new Date().toDateString()
      return saleDate === today
    })
    .reduce((sum, sale) => sum + sale.total, 0)

  // Calculate purchase statistics
  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.total, 0)
  const pendingPurchases = purchases.filter((p) => p.statut === "En attente").length

  // Calculate treasury balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  // Recent sales (last 5)
  const recentSales = sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  
  const monthlyStats = useMemo(() => {
    const monthlyData: Record<string, { ventes: number; achats: number }> = {}

    sales.forEach((sale) => {
      const month = new Date(sale.date).toLocaleString("default", { month: "short", year: "numeric" })
      if (!monthlyData[month]) monthlyData[month] = { ventes: 0, achats: 0 }
      monthlyData[month].ventes += sale.total
    })

    purchases.forEach((purchase) => {
      const month = new Date(purchase.date).toLocaleString("default", { month: "short", year: "numeric" })
      if (!monthlyData[month]) monthlyData[month] = { ventes: 0, achats: 0 }
      monthlyData[month].achats += purchase.total
    })

    return Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date("01 " + a.month).getTime() - new Date("01 " + b.month).getTime())
  }, [sales, purchases])
return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
        <p className="text-gray-600">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockProducts > 0 && <span className="text-orange-600">{lowStockProducts} en stock faible</span>}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">Clients enregistrés</p>
          </CardContent>
        </Card>

      </div>

      {/* Alerts */}
      {(lowStockProducts > 0 || outOfStockProducts > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Alertes Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-orange-700">Produits en stock faible</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {lowStockProducts}
                  </Badge>
                </div>
              )}
              {outOfStockProducts > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-red-700">Produits en rupture</span>
                  <Badge variant="destructive">{outOfStockProducts}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventes récentes</CardTitle>
            <CardDescription>Les 5 dernières ventes effectuées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Vente #{sale.id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(sale.date).toLocaleDateString("fr-FR")} - {sale.mode_paiement}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{sale.total.toLocaleString()} DZD</p>
                      <div className="flex items-center text-xs text-green-600">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        Vente
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Aucune vente récente</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventes vs Achats</CardTitle>
            <CardDescription>Comparaison mensuelle</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} DZD`} />
                <Legend />
                <Bar dataKey="ventes" fill="#22c55e" name="Ventes" />
                <Bar dataKey="achats" fill="#3b82f6" name="Achats" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Home() {
  const { auth } = useStore()
  const [activeModule, setActiveModule] = useState<ActiveModule>("dashboard")

  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      setActiveModule(event.detail as ActiveModule)
  } 

    const navigateToPOS = () => {
    setActiveModule("pos")
  }
  
    window.addEventListener("navigate", handleNavigate as EventListener)
    return () => window.removeEventListener("navigate", handleNavigate as EventListener)
  }, [])

  const handleLogin = () => {
    // Login handled by the login page component
  }

  if (!auth.isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard />
      case "products":
        return <ProductsModule />
      case "clients":
        return <ClientsModule />
      case "suppliers":
        return <SuppliersModule />
      case "purchases":
        return <PurchasesModule />
      case "sales":
        return <SalesModule onNavigateToPOS={() => setActiveModule("pos")} />
      case "pos":
        return <POSModule />
      case "movements":
        return <MovementsModule />
      case "treasury":
        return <TreasuryModule />
      case "settings":
        return <SettingsModule />
      default:
        return <Dashboard />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">AutoParts Manager</h1>
            </div>
          </header>
          <div className="flex-1 p-6 overflow-auto">{renderActiveModule()}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
