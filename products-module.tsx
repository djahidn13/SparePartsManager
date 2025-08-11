"use client"

import type React from "react"

import { useState, useMemo, useEffect, useCallback } from "react"
import { FixedSizeList as List } from "react-window"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Package,
  MoreHorizontal,
  Settings,
  FileSpreadsheet,
  CheckCircle,
  FileDown,
  Loader2,
} from "lucide-react"
import { useStore, type Product } from "@/store"
import * as XLSX from "xlsx"

// Virtual scrolling row component
const ProductRow = ({ index, style, data }: { index: number; style: any; data: any }) => {
  const { 
    products, 
    visibleColumns, 
    getSupplierName, 
    getStockStatus, 
    canEdit, 
    setSelectedProduct, 
    setShowViewDialog, 
    setShowEditDialog, 
    handleDeleteProduct 
  } = data

  const product = products[index]
  if (!product) return null

  const stockStatus = getStockStatus(product)
  const isOutOfStock = product.quantite_disponible === 0
  const rowBgColor = index % 2 === 0 ? "bg-blue-25" : "bg-blue-50"

  return (
    <div style={style} className={`flex items-center border-b hover:bg-gray-50 ${rowBgColor} ${isOutOfStock ? "bg-red-50" : ""}`}>
      {visibleColumns.reference && (
        <div className={`min-w-[120px] px-4 py-2 font-mono font-medium ${isOutOfStock ? "text-red-700" : ""}`}>
          {product.reference}
        </div>
      )}
      {visibleColumns.designation && (
        <div className="min-w-[600px] max-w-[600px] px-4 py-2">
          <div
            className={`whitespace-normal break-words leading-relaxed text-sm overflow-hidden ${
              isOutOfStock ? "text-red-700 font-medium" : ""
            }`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: "1.5em",
              maxHeight: "3em",
            }}
          >
            {product.designation.length > 160
              ? product.designation.substring(0, 160) + "..."
              : product.designation}
          </div>
        </div>
      )}
      {visibleColumns.famille && (
        <div className={`min-w-[120px] px-4 py-2 ${isOutOfStock ? "text-red-700" : ""}`}>{product.famille}</div>
      )}
      {visibleColumns.sous_famille && (
        <div className={`min-w-[120px] px-4 py-2 ${isOutOfStock ? "text-red-700" : ""}`}>{product.sous_famille}</div>
      )}
      {visibleColumns.tva && (
        <div className={`min-w-[80px] px-4 py-2 ${isOutOfStock ? "text-red-700" : ""}`}>{product.tva}%</div>
      )}
      {visibleColumns.prix_achat_ht && (
        <div className={`min-w-[120px] px-4 py-2 ${isOutOfStock ? "text-red-700" : ""}`}>
          {Math.round((product.prix_achat_ht || 0)).toFixed(2).toLocaleString()} DZD
        </div>
      )}
      {visibleColumns.prix_vente_detail_ht && (
        <div className={`min-w-[140px] px-4 py-2 ${isOutOfStock ? "text-red-700" : ""}`}>
          {Math.round((product.prix_vente_ht_detail || 0)).toFixed(2).toLocaleString()} DZD
        </div>
      )}
      {visibleColumns.prix_vente_detail_ttc && (
        <div className={`min-w-[140px] px-4 py-2 ${isOutOfStock ? "text-red-700" : ""}`}>
          {Math.round((product.prix_vente_ttc_detail || 0)).toFixed(2).toLocaleString()} DZD
        </div>
      )}
      {visibleColumns.prix_vente_gros_ht && (
        <div className={`min-w-[140px] px-4 py-2 ${isOutOfStock ? "text-red-700" : ""}`}>
          {Math.round((product.prix_vente_ht_gros || 0)).toFixed(2).toLocaleString()} DZD
        </div>
      )}
      {visibleColumns.prix_vente_gros_ttc && (
        <div className={`min-w-[140px] px-4 py-2 ${isOutOfStock ? "text-red-700" : ""}`}>
          {Math.round((product.prix_vente_ttc_gros || 0)).toFixed(2).toLocaleString()} DZD
        </div>
      )}
      {visibleColumns.stock && (
        <div className="min-w-[100px] px-4 py-2">
          <div className="flex flex-col gap-1">
            <span className={`font-medium ${isOutOfStock ? "text-red-700" : ""}`}>
              {product.quantite_disponible}
            </span>
            <Badge variant="secondary" className={`text-xs ${stockStatus.color}`}>
              {stockStatus.status}
            </Badge>
          </div>
        </div>
      )}
      {visibleColumns.localisation && (
        <div className={`min-w-[120px] px-4 py-2 ${isOutOfStock ? "text-red-700" : ""}`}>{product.localisation}</div>
      )}
      {visibleColumns.valeur_stock && (
        <div className={`min-w-[120px] px-4 py-2 ${isOutOfStock ? "text-red-700" : ""}`}>
          {Math.round((product.valeur_stock || 0)).toFixed(2).toLocaleString()} DZD
        </div>
      )}
      {visibleColumns.fournisseur && (
        <div className={`min-w-[140px] px-4 py-2 ${isOutOfStock ? "text-red-700" : ""}`}>
          {getSupplierName(product.fournisseur)}
        </div>
      )}
      {visibleColumns.code_barre && (
        <div className={`min-w-[140px] px-4 py-2 font-mono text-sm ${isOutOfStock ? "text-red-700" : ""}`}>
          {product.code_barre}
        </div>
      )}
      {visibleColumns.actions && (
        <div className="min-w-[100px] px-4 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedProduct(product)
                  setShowViewDialog(true)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir
              </DropdownMenuItem>
              {canEdit && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedProduct(product)
                      setShowEditDialog(true)
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

// Virtual table header component
const VirtualTableHeader = ({ visibleColumns, isAdmin }: { visibleColumns: any; isAdmin: boolean }) => {
  return (
    <div className="flex items-center bg-gray-50 border-b font-medium text-sm">
      {visibleColumns.reference && <div className="min-w-[120px] px-4 py-3">Référence</div>}
      {visibleColumns.designation && <div className="min-w-[600px] max-w-[600px] px-4 py-3">Désignation</div>}
      {visibleColumns.famille && <div className="min-w-[120px] px-4 py-3">Famille</div>}
      {visibleColumns.sous_famille && <div className="min-w-[120px] px-4 py-3">Sous-famille</div>}
      {visibleColumns.tva && <div className="min-w-[80px] px-4 py-3">TVA</div>}
      {visibleColumns.prix_achat_ht && <div className="min-w-[120px] px-4 py-3">Prix Achat HT</div>}
      {visibleColumns.prix_vente_detail_ht && <div className="min-w-[140px] px-4 py-3">Prix Vente Détail HT</div>}
      {visibleColumns.prix_vente_detail_ttc && <div className="min-w-[140px] px-4 py-3">Prix Vente Détail TTC</div>}
      {visibleColumns.prix_vente_gros_ht && <div className="min-w-[140px] px-4 py-3">Prix Vente Gros HT</div>}
      {visibleColumns.prix_vente_gros_ttc && <div className="min-w-[140px] px-4 py-3">Prix Vente Gros TTC</div>}
      {visibleColumns.stock && <div className="min-w-[100px] px-4 py-3">Stock</div>}
      {visibleColumns.localisation && <div className="min-w-[120px] px-4 py-3">Localisation</div>}
      {visibleColumns.valeur_stock && <div className="min-w-[120px] px-4 py-3">Valeur Stock</div>}
      {visibleColumns.fournisseur && <div className="min-w-[140px] px-4 py-3">Fournisseur</div>}
      {visibleColumns.code_barre && <div className="min-w-[140px] px-4 py-3">Code Barre</div>}
      {visibleColumns.actions && <div className="min-w-[100px] px-4 py-3">Actions</div>}
    </div>
  )
}

// XLSX utility functions using SheetJS
const exportToXLSX = (data: any[], filename: string) => {
  try {
    // Convert products data to Excel format
    const excelData = data.map((product) => ({
      Référence: product.reference,
      Désignation: product.designation,
      Famille: product.famille,
      "Sous-famille": product.sous_famille,
      "TVA (%)": product.tva,
      "Prix Achat HT (DZD)": product.prix_achat_ht,
      "Prix Vente Détail HT (DZD)": product.prix_vente_ht_detail,
      "Prix Vente Détail TTC (DZD)": product.prix_vente_ttc_detail,
      "Prix Vente Gros HT (DZD)": product.prix_vente_ht_gros,
      "Prix Vente Gros TTC (DZD)": product.prix_vente_ttc_gros,
      "Stock Disponible": product.quantite_disponible,
      "Stock Minimum": product.min_stock,
      Unité: product.unite,
      Localisation: product.localisation,
      "Valeur Stock (DZD)": product.valeur_stock,
      "Fournisseur": product.fournisseur,
      "Code Barre": product.code_barre,
      Périssable: product.perissable ? "OUI" : "NON",
      "Date Péremption": product.date_peremption || "",
    }))

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // Référence
      { wch: 50 }, // Désignation
      { wch: 15 }, // Famille
      { wch: 20 }, // Sous-famille
      { wch: 10 }, // TVA
      { wch: 20 }, // Prix Achat HT
      { wch: 25 }, // Prix Vente Détail HT
      { wch: 25 }, // Prix Vente Détail TTC
      { wch: 25 }, // Prix Vente Gros HT
      { wch: 25 }, // Prix Vente Gros TTC
      { wch: 15 }, // Stock Disponible
      { wch: 15 }, // Stock Minimum
      { wch: 10 }, // Unité
      { wch: 15 }, // Localisation
      { wch: 20 }, // Valeur Stock
      { wch: 15 }, // Fournisseur
      { wch: 20 }, // Code Barre
      { wch: 12 }, // Périssable
      { wch: 15 }, // Date Péremption
    ]
    worksheet["!cols"] = columnWidths

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produits")

    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename.endsWith(".xlsx") ? filename : filename + ".xlsx")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    throw new Error("Erreur lors de l'export Excel")
  }
}

const createXLSXTemplate = () => {
  try {
    const templateData = [
      {
        Référence: "PLQ001",
        Désignation: "Plaquettes de frein avant Renault Clio",
        Famille: "Freinage",
        "Sous-famille": "Plaquettes",
        "TVA (%)": 19,
        "Prix Achat HT (DZD)": 2500,
        "Prix Vente Détail HT (DZD)": 4000,
        "Prix Vente Détail TTC (DZD)": 4760,
        "Prix Vente Gros HT (DZD)": 3500,
        "Prix Vente Gros TTC (DZD)": 4165,
        "Stock Disponible": 25,
        "Stock Minimum": 10,
        Unité: "Jeu",
        Localisation: "A1-B2",
        "Valeur Stock (DZD)": 62500,
        "Fournisseur": "Automotors-Pro",
        "Code Barre": "3661434567890",
        Périssable: "NON",
        "Date Péremption": "",
      },
      {
        Référence: "FLT002",
        Désignation: "Filtre à huile Peugeot 308",
        Famille: "Filtration",
        "Sous-famille": "Filtres huile",
        "TVA (%)": 19,
        "Prix Achat HT (DZD)": 800,
        "Prix Vente Détail HT (DZD)": 1500,
        "Prix Vente Détail TTC (DZD)": 1785,
        "Prix Vente Gros HT (DZD)": 1200,
        "Prix Vente Gros TTC (DZD)": 1428,
        "Stock Disponible": 50,
        "Stock Minimum": 15,
        Unité: "Pièce",
        Localisation: "B3-C1",
        "Valeur Stock (DZD)": 40000,
        "Fournisseur": "EMSG Mansour",
        "Code Barre": "3661434567891",
        Périssable: "NON",
        "Date Péremption": "",
      },
      {
        Référence: "AMO003",
        Désignation: "Amortisseur arrière Volkswagen Golf",
        Famille: "Suspension",
        "Sous-famille": "Amortisseurs",
        "TVA (%)": 19,
        "Prix Achat HT (DZD)": 4500,
        "Prix Vente Détail HT (DZD)": 7200,
        "Prix Vente Détail TTC (DZD)": 8568,
        "Prix Vente Gros HT (DZD)": 6300,
        "Prix Vente Gros TTC (DZD)": 7497,
        "Stock Disponible": 12,
        "Stock Minimum": 5,
        Unité: "Pièce",
        Localisation: "C2-D1",
        "Valeur Stock (DZD)": 54000,
        "Fournisseur": "Atlas Automotive Parts",
        "Code Barre": "3661434567892",
        Périssable: "NON",
        "Date Péremption": "",
      },
    ]

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(templateData)

    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // Référence
      { wch: 50 }, // Désignation
      { wch: 15 }, // Famille
      { wch: 20 }, // Sous-famille
      { wch: 10 }, // TVA
      { wch: 20 }, // Prix Achat HT
      { wch: 25 }, // Prix Vente Détail HT
      { wch: 25 }, // Prix Vente Détail TTC
      { wch: 25 }, // Prix Vente Gros HT
      { wch: 25 }, // Prix Vente Gros TTC
      { wch: 15 }, // Stock Disponible
      { wch: 15 }, // Stock Minimum
      { wch: 10 }, // Unité
      { wch: 15 }, // Localisation
      { wch: 20 }, // Valeur Stock
      { wch: 15 }, // Fournisseur
      { wch: 20 }, // Code Barre
      { wch: 12 }, // Périssable
      { wch: 15 }, // Date Péremption
    ]
    worksheet["!cols"] = columnWidths

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Produits")

    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "template-produits.xlsx")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    throw new Error("Erreur lors de la création du modèle Excel")
  }
}

const parseXLSXData = async (file: File, onProgress?: (progress: number) => void): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 50 // First 50% for reading
        onProgress(progress)
      }
    }

    reader.onload = async (event) => {
      try {
        if (onProgress) onProgress(60) // 60% after reading

        const data = event.target?.result
        if (!data) {
          throw new Error("Impossible de lire le fichier")
        }

        if (onProgress) onProgress(70) // 70% after parsing

        // Parse Excel file using SheetJS
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length < 2) {
          throw new Error("Le fichier doit contenir au moins une ligne d'en-têtes et une ligne de données")
        }

        if (onProgress) onProgress(80) // 80% after conversion

        // Get headers and data rows
        const headers = jsonData[0] as string[]
        const dataRows = jsonData.slice(1) as any[][]

        // Process data in chunks for large files
        const chunkSize = 1000
        const processedData: any[] = []

        for (let i = 0; i < dataRows.length; i += chunkSize) {
          const chunk = dataRows.slice(i, i + chunkSize)

          const chunkProcessed = chunk.map((row: any[]) => {
            const rowData: any = {}
            headers.forEach((header, index) => {
              rowData[header] = row[index] || ""
            })

            return {
              reference: rowData["Référence"] || "",
              designation: rowData["Désignation"] || "",
              famille: rowData["Famille"] || "",
              sous_famille: rowData["Sous-famille"] || "",
          tva:
            rowData["TVA (%)"] !== undefined &&
            rowData["TVA (%)"] !== "" &&
            !isNaN(Number.parseFloat(rowData["TVA (%)"]))
              ? Number.parseFloat(rowData["TVA (%)"])
              : 19,
              prix_achat_ht: Number.parseFloat(rowData["Prix Achat HT (DZD)"] || "0") || 0,
              prix_vente_ht_detail: Number.parseFloat(rowData["Prix Vente Détail HT (DZD)"] || "0") || 0,
              prix_vente_ht_gros: Number.parseFloat(rowData["Prix Vente Gros HT (DZD)"] || "0") || 0,
              quantite_disponible: Number.parseInt(rowData["Stock Disponible"] || "0") || 0,
              min_stock: Number.parseInt(rowData["Stock Minimum"] || "0") || 0,
              unite: (rowData["Unité"] as "Pièce" | "Kit" | "Jeu" | "Lot") || "Pièce",
              localisation: rowData["Localisation"] || "",
              fournisseur: rowData["Fournisseur"] || "",
              code_barre: rowData["Code Barre"] || "",
              perissable: rowData["Périssable"]?.toString().toUpperCase() === "OUI",
              date_peremption: rowData["Date Péremption"] || "",
              prix_achat_ttc: 0,
              prix_vente_ttc_detail: 0,
              prix_vente_ttc_gros: 0,
              marge_beneficiaire_pourcentage: 0,
              valeur_stock: 0,
            }
          })

          processedData.push(...chunkProcessed)

          // Update progress for processing
          if (onProgress) {
            const processProgress = 80 + ((i + chunkSize) / dataRows.length) * 20
            onProgress(Math.min(processProgress, 100))
          }

          // Allow UI to update for large files
          if (i % (chunkSize * 5) === 0) {
            await new Promise((resolve) => setTimeout(resolve, 10))
          }
        }

        if (onProgress) onProgress(100) // 100% complete

        resolve(processedData)
      } catch (error) {
        reject(
          new Error(
            `Erreur lors de l'analyse du fichier Excel: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
          ),
        )
      }
    }

    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier"))
    }

    reader.readAsArrayBuffer(file)
  })
}

// Function to save column visibility to localStorage
const saveColumnVisibility = (columns: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("products-column-visibility", JSON.stringify(columns))
  }
}

// Function to load column visibility from localStorage
const loadColumnVisibility = (defaultColumns: any) => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("products-column-visibility")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error("Error parsing saved column visibility:", error)
      }
    }
  }
  return defaultColumns
}

export default function ProductsModule() {
  const { products, suppliers, addProduct, updateProduct, deleteProduct, replaceAllProducts, auth, hasPermission } =
    useStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFamily, setSelectedFamily] = useState<string>("all")
  const [selectedSubFamily, setSelectedSubFamily] = useState<string>("all")
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [showStockValue, setShowStockValue] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [showSuccess, setShowSuccess] = useState("")
  const [priceCalculationMethod, setPriceCalculationMethod] = useState<"percentage" | "direct">("percentage")

  const isAdmin = auth.currentUser?.role === "admin"
  const canEdit = hasPermission("products:write") || isAdmin

  // Default column visibility - different for admin vs user
  const getDefaultVisibleColumns = () => {
    if (isAdmin) {
      return {
        reference: true,
        designation: true,
        famille: true,
        sous_famille: true,
        tva: true,
        prix_achat_ht: true,
        prix_vente_detail_ht: true,
        prix_vente_detail_ttc: true,
        prix_vente_gros_ht: true,
        prix_vente_gros_ttc: true,
        stock: true,
        localisation: true,
        valeur_stock: true,
        fournisseur: true,
        code_barre: true,
        actions: true,
      }
    } else {
      // Limited columns for regular users
      return {
        reference: true,
        designation: true,
        famille: false,
        sous_famille: true,
        tva: false,
        prix_achat_ht: false,
        prix_vente_detail_ht: false,
        prix_vente_detail_ttc: true,
        prix_vente_gros_ht: false,
        prix_vente_gros_ttc: false,
        stock: true,
        localisation: true,
        valeur_stock: false,
        fournisseur: false,
        code_barre: true,
        actions: true,
      }
    }
  }

  const defaultVisibleColumns = getDefaultVisibleColumns()

  // Column visibility state with localStorage persistence
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns)

  // Load saved column visibility on component mount
  useEffect(() => {
    const savedColumns = loadColumnVisibility(defaultVisibleColumns)
    setVisibleColumns(savedColumns)
  }, [])

  // Save column visibility when it changes
  const updateVisibleColumns = (newColumns: any) => {
    setVisibleColumns(newColumns)
    saveColumnVisibility(newColumns)
  }

  // New product form state
  const [newProduct, setNewProduct] = useState({
    reference: "",
    designation: "",
    famille: "",
    sous_famille: "",
    tva: 19,
    prix_achat_ht: 0,
    prix_achat_ttc: 0,
    prix_vente_ht_detail: 0,
    prix_vente_ttc_detail: 0,
    prix_vente_ht_gros: 0,
    prix_vente_ttc_gros: 0,
    quantite_disponible: 0,
    min_stock: 0,
    marge_beneficiaire_pourcentage: 50,
    unite: "Pièce" as "Pièce" | "Kit" | "Jeu" | "Lot",
    localisation: "",
    perissable: false,
    date_peremption: "",
    valeur_stock: 0,
    fournisseur: "",
    code_barre: "",
  })

  // Get unique values for filters
  const families = useMemo(() => [...new Set(products.map((p) => p.famille).filter((f) => f.trim() !== ""))], [products])
  const subFamilies = useMemo(() => [...new Set(products.map((p) => p.sous_famille).filter((f) => f.trim() !== ""))], [products])

  // Filter products with optimized filtering for large datasets
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code_barre.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFamily = selectedFamily === "all" || product.famille === selectedFamily
      const matchesSubFamily = selectedSubFamily === "all" || product.sous_famille === selectedSubFamily
      const matchesSupplier = selectedSupplier === "all" || product.fournisseur === selectedSupplier

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && product.quantite_disponible <= product.min_stock) ||
        (stockFilter === "out" && product.quantite_disponible === 0) ||
        (stockFilter === "available" && product.quantite_disponible > 0)

      return matchesSearch && matchesFamily && matchesSubFamily && matchesSupplier && matchesStock
    })
  }, [products, searchTerm, selectedFamily, selectedSubFamily, selectedSupplier, stockFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = products.length
    const lowStock = products.filter((p) => p.quantite_disponible <= p.min_stock).length
    const outOfStock = products.filter((p) => p.quantite_disponible === 0).length
    const totalValue = products.reduce((sum, p) => sum + (p.valeur_stock || 0), 0)

    return { total, lowStock, outOfStock, totalValue }
  }, [products])

  // Calculate prices based on method
  const calculatePrices = () => {
    if (priceCalculationMethod === "percentage") {
      const prixVenteHT = newProduct.prix_achat_ht * (1 + newProduct.marge_beneficiaire_pourcentage / 100)
      const prixVenteTTC = prixVenteHT * (1 + newProduct.tva / 100)
      return {
        prix_vente_ht_detail: prixVenteHT,
        prix_vente_ttc_detail: prixVenteTTC,
        prix_vente_ht_gros: prixVenteHT * 0.9,
        prix_vente_ttc_gros: prixVenteTTC * 0.9,
      }
    }
    return {
      prix_vente_ht_detail: newProduct.prix_vente_ht_detail,
      prix_vente_ttc_detail: newProduct.prix_vente_ttc_detail,
      prix_vente_ht_gros: newProduct.prix_vente_ht_gros,
      prix_vente_ttc_gros: newProduct.prix_vente_ttc_gros,
    }
  }

  const handleAddProduct = () => {
  const referenceExiste = products.some(
    (product) =>
      product.reference.trim().toLowerCase() === newProduct.reference.trim().toLowerCase()
  )

  if (referenceExiste) {
    setShowDuplicateDialog(true)
    return
  }

    const calculatedPrices = calculatePrices()
    const productData = {
      ...newProduct,
      ...calculatedPrices,
      prix_achat_ttc: newProduct.prix_achat_ht * (1 + newProduct.tva / 100),
      valeur_stock: newProduct.quantite_disponible * newProduct.prix_achat_ht,
      marge_beneficiaire_pourcentage:
        priceCalculationMethod === "percentage"
          ? newProduct.marge_beneficiaire_pourcentage
          : newProduct.prix_achat_ht > 0
            ? ((calculatedPrices.prix_vente_ht_detail - newProduct.prix_achat_ht) / newProduct.prix_achat_ht) * 100
            : 0,
    }

    addProduct(productData)
    setNewProduct({
      reference: "",
      designation: "",
      famille: "",
      sous_famille: "",
      tva: 19,
      prix_achat_ht: 0,
      prix_achat_ttc: 0,
      prix_vente_ht_detail: 0,
      prix_vente_ttc_detail: 0,
      prix_vente_ht_gros: 0,
      prix_vente_ttc_gros: 0,
      quantite_disponible: 0,
      min_stock: 0,
      marge_beneficiaire_pourcentage: 50,
      unite: "Pièce",
      localisation: "",
      perissable: false,
      date_peremption: "",
      valeur_stock: 0,
      fournisseur: "",
      code_barre: "",
    })
    setShowAddDialog(false)
    setShowSuccess("Produit ajouté avec succès!")
    setTimeout(() => setShowSuccess(""), 3000)
  }

  const handleEditProduct = () => {
    if (!selectedProduct) return

    const updatedData = {
      ...selectedProduct,
      prix_achat_ttc: selectedProduct.prix_achat_ht * (1 + selectedProduct.tva / 100),
      prix_vente_ttc_detail: selectedProduct.prix_vente_ht_detail * (1 + selectedProduct.tva / 100),
      prix_vente_ttc_gros: selectedProduct.prix_vente_ht_gros * (1 + selectedProduct.tva / 100),
      valeur_stock: selectedProduct.quantite_disponible * selectedProduct.prix_achat_ht,
      marge_beneficiaire_pourcentage:
        selectedProduct.prix_achat_ht > 0
          ? ((selectedProduct.prix_vente_ht_detail - selectedProduct.prix_achat_ht) / selectedProduct.prix_achat_ht) *
            100
          : 0,
    }

    updateProduct(selectedProduct.id, updatedData)
    setShowEditDialog(false)
    setSelectedProduct(null)
    setShowSuccess("Produit modifié avec succès!")
    setTimeout(() => setShowSuccess(""), 3000)
  }

  const handleDeleteProduct = useCallback((productId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      deleteProduct(productId)
      setShowSuccess("Produit supprimé avec succès!")
      setTimeout(() => setShowSuccess(""), 3000)
    }
  }, [deleteProduct])

  const handleExportProducts = () => {
    try {
      exportToXLSX(filteredProducts, `produits-${new Date().toISOString().split("T")[0]}.xlsx`)
      setShowSuccess("Export Excel terminé avec succès!")
      setTimeout(() => setShowSuccess(""), 3000)
    } catch (error) {
      alert("Erreur lors de l'export Excel. Veuillez réessayer.")
    }
  }

  const handleDownloadTemplate = () => {
    try {
      createXLSXTemplate()
      setShowSuccess("Modèle Excel téléchargé avec succès!")
      setTimeout(() => setShowSuccess(""), 3000)
    } catch (error) {
      console.error("Template download error:", error)
      alert("Erreur lors du téléchargement du modèle Excel. Veuillez réessayer.")
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 50MB)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        alert("Le fichier est trop volumineux. Taille maximale: 50MB")
        return
      }

      // Check file type - accept only Excel files
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ]
      const isValidType =
        validTypes.includes(file.type) ||
        file.name.toLowerCase().endsWith(".xlsx") ||
        file.name.toLowerCase().endsWith(".xls")

      if (!isValidType) {
        alert("Format de fichier non supporté. Utilisez un fichier Excel (.xlsx, .xls)")
        return
      }

      setSelectedFile(file)
      setImportProgress(0)
    }
  }

  const handleImportProducts = async () => {
    if (!selectedFile) return

    setIsImporting(true)
    setImportProgress(0)

    try {
      const importedProducts = await parseXLSXData(selectedFile, setImportProgress)

      if (importedProducts.length === 0) {
        throw new Error("Aucun produit trouvé dans les données")
      }

      // Calculate prices for each product
      const processedProducts = importedProducts.map((product) => ({
        ...product,
        prix_achat_ttc: product.prix_achat_ht * (1 + product.tva / 100),
        prix_vente_ttc_detail: product.prix_vente_ht_detail * (1 + product.tva / 100),
        prix_vente_ttc_gros: product.prix_vente_ht_gros * (1 + product.tva / 100),
        valeur_stock: product.quantite_disponible * product.prix_achat_ht,
        marge_beneficiaire_pourcentage:
          product.prix_achat_ht > 0
            ? ((product.prix_vente_ht_detail - product.prix_achat_ht) / product.prix_achat_ht) * 100
            : 0,
      }))

      replaceAllProducts(processedProducts)
      setSelectedFile(null)
      setShowImportDialog(false)
      setShowSuccess(`${importedProducts.length} produits importés avec succès depuis Excel!`)
      setTimeout(() => setShowSuccess(""), 3000)
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erreur lors de l'importation Excel. Vérifiez le format des données.",
      )
    } finally {
      setIsImporting(false)
      setImportProgress(0)
    }
  }

  const getSupplierName = useCallback((supplierValue: string) => {
    const supplier = suppliers.find((s) => s.nom === supplierValue || s.id === supplierValue)
    return supplier ? supplier.nom : supplierValue || "Non défini"
  }, [suppliers])

  const getStockStatus = useCallback((product: Product) => {
    if (product.quantite_disponible === 0) {
      return { status: "Rupture", color: "bg-red-100 text-red-800" }
    }
    if (product.quantite_disponible <= product.min_stock) {
      return { status: "Stock faible", color: "bg-orange-100 text-orange-800" }
    }
    return { status: "Disponible", color: "bg-green-100 text-green-800" }
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Get available columns for column settings based on user role
  const getAvailableColumns = () => {
    const allColumns = {
      reference: "Référence",
      designation: "Désignation",
      famille: "Famille",
      sous_famille: "Sous-famille",
      tva: "TVA",
      prix_achat_ht: "Prix Achat HT",
      prix_vente_detail_ht: "Prix Vente Détail HT",
      prix_vente_detail_ttc: "Prix Vente Détail TTC",
      prix_vente_gros_ht: "Prix Vente Gros HT",
      prix_vente_gros_ttc: "Prix Vente Gros TTC",
      stock: "Stock",
      localisation: "Localisation",
      valeur_stock: "Valeur Stock",
      fournisseur: "Fournisseur",
      code_barre: "Code Barre",
      actions: "Actions",
    }

    if (isAdmin) {
      return allColumns
    } else {
      // Limited columns for regular users
      return {
        reference: "Référence",
        designation: "Désignation",
        sous_famille: "Sous-famille",
        prix_vente_detail_ttc: "Prix Vente Détail TTC",
        stock: "Stock",
        localisation: "Localisation",
        code_barre: "Code Barre",
        actions: "Actions",
      }
    }
  }

  // Virtual list data for react-window
  const virtualListData = useMemo(() => ({
    products: filteredProducts,
    visibleColumns,
    getSupplierName,
    getStockStatus,
    canEdit,
    setSelectedProduct,
    setShowViewDialog,
    setShowEditDialog,
    handleDeleteProduct,
  }), [filteredProducts, visibleColumns, getSupplierName, getStockStatus, canEdit, handleDeleteProduct])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestion des Produits</h2>
          <p className="text-gray-600">Gérez votre catalogue de pièces automobiles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowColumnSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Colonnes
          </Button>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <FileDown className="w-4 h-4 mr-2" />
            Modèle Excel
          </Button>
          <Button variant="outline" onClick={handleExportProducts}>
            <Download className="w-4 h-4 mr-2" />
            Exporter Excel
          </Button>
          {canEdit && (
            <>
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Importer Excel
              </Button>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Produit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{showSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produits</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Faible</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rupture</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
                <p
                 className={`text-2xl font-bold cursor-pointer transition duration-200 ${
                   isAdmin
                     ? showStockValue
                       ? "text-green-600"
                       : "text-gray-400 blur-sm select-none"
                     : ""
                 }`}
                 onClick={() => {
                   if (isAdmin) setShowStockValue((prev) => !prev)
                 }}
                 title={!showStockValue && isAdmin ? "Cliquer pour afficher" : ""}
                >
                 {isAdmin ? (showStockValue ? `${stats.totalValue.toLocaleString()} DZD` : "•••••••••") : "---"}
                </p>
              </div>

              <Package className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par référence, désignation ou code barre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedFamily} onValueChange={setSelectedFamily}>
              <SelectTrigger>
                <SelectValue placeholder="Famille" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les familles</SelectItem>
                {families.map((family) => (
                  <SelectItem key={family} value={family}>
                    {family}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubFamily} onValueChange={setSelectedSubFamily}>
              <SelectTrigger>
                <SelectValue placeholder="Sous-famille" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sous-familles</SelectItem>
                {subFamilies.map((subFamily) => (
                  <SelectItem key={subFamily} value={subFamily}>
                    {subFamily}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isAdmin && (
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les fournisseurs</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les stocks</SelectItem>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="low">Stock faible</SelectItem>
                <SelectItem value="out">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Virtual Scrolling Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <VirtualTableHeader visibleColumns={visibleColumns} isAdmin={isAdmin} />
            <div style={{ height: "600px", width: "100%" }}>
              <List
                height={600}
                itemCount={filteredProducts.length}
                itemSize={64} // Height of each row
                itemData={virtualListData}
                overscanCount={5} // Render 5 extra items outside visible area for smooth scrolling
              >
                {ProductRow}
              </List>
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun produit trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Column Settings Dialog */}
      <Dialog open={showColumnSettings} onOpenChange={setShowColumnSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Paramètres des colonnes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(getAvailableColumns()).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={visibleColumns[key] || false}
                    onCheckedChange={(checked) =>
                      updateVisibleColumns({ ...visibleColumns, [key]: checked as boolean })
                    }
                  />
                  <Label htmlFor={key} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau produit</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="pricing">Prix et marges</TabsTrigger>
              <TabsTrigger value="stock">Stock et localisation</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reference">Référence *</Label>
                  <Input
                    id="reference"
                    value={newProduct.reference}
                    onChange={(e) => setNewProduct({ ...newProduct, reference: e.target.value })}
                    placeholder="REF001"
                  />
                </div>
                <div>
                  <Label htmlFor="code_barre">Code Barre</Label>
                  <Input
                    id="code_barre"
                    value={newProduct.code_barre}
                    onChange={(e) => setNewProduct({ ...newProduct, code_barre: e.target.value })}
                    placeholder="1234567890123"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="designation">Désignation *</Label>
                <Input
                  id="designation"
                  value={newProduct.designation}
                  onChange={(e) => setNewProduct({ ...newProduct, designation: e.target.value })}
                  placeholder="Description détaillée du produit"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="famille">Famille</Label>
                  <Input
                    id="famille"
                    value={newProduct.famille}
                    onChange={(e) => setNewProduct({ ...newProduct, famille: e.target.value })}
                    placeholder="Freinage"
                  />
                </div>
                <div>
                  <Label htmlFor="sous_famille">Sous-famille</Label>
                  <Input
                    id="sous_famille"
                    value={newProduct.sous_famille}
                    onChange={(e) => setNewProduct({ ...newProduct, sous_famille: e.target.value })}
                    placeholder="Plaquettes"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unite">Unité</Label>
                  <Select
                    value={newProduct.unite}
                    onValueChange={(value: "Pièce" | "Kit" | "Jeu" | "Lot") =>
                      setNewProduct({ ...newProduct, unite: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pièce">Pièce</SelectItem>
                      <SelectItem value="Kit">Kit</SelectItem>
                      <SelectItem value="Jeu">Jeu</SelectItem>
                      <SelectItem value="Lot">Lot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tva">TVA (%)</Label>
                  <Input
                    id="tva"
                    type="number"
                    value={newProduct.tva}
                    onChange={(e) => setNewProduct({ ...newProduct, tva: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {isAdmin && (
                <div>
                  <Label htmlFor="fournisseur">Fournisseur</Label>
                  <Select
                    value={newProduct.fournisseur}
                    onValueChange={(value) => setNewProduct({ ...newProduct, fournisseur: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur" />
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
              )}
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prix_achat_ht">Prix d'achat HT (DZD)</Label>
                  <Input
                    id="prix_achat_ht"
                    type="number"
                    value={newProduct.prix_achat_ht}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, prix_achat_ht: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label>Prix d'achat TTC (DZD)</Label>
                  <Input
                    value={(newProduct.prix_achat_ht * (1 + newProduct.tva / 100)).toFixed(2)}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Méthode de calcul du prix de vente</Label>
                <RadioGroup
                  value={priceCalculationMethod}
                  onValueChange={(value: "percentage" | "direct") => setPriceCalculationMethod(value)}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage">Par pourcentage de marge</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct" id="direct" />
                    <Label htmlFor="direct">Saisie directe</Label>
                  </div>
                </RadioGroup>
              </div>

              {priceCalculationMethod === "percentage" ? (
                <div>
                  <Label htmlFor="marge">Marge bénéficiaire (%)</Label>
                  <Input
                    id="marge"
                    type="number"
                    value={newProduct.marge_beneficiaire_pourcentage}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        marge_beneficiaire_pourcentage: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prix_vente_ht_detail">Prix vente détail HT (DZD)</Label>
                    <Input
                      id="prix_vente_ht_detail"
                      type="number"
                      value={newProduct.prix_vente_ht_detail}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, prix_vente_ht_detail: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="prix_vente_ttc_detail">Prix vente détail TTC (DZD)</Label>
                    <Input
                      id="prix_vente_ttc_detail"
                      type="number"
                      value={newProduct.prix_vente_ttc_detail}
                      onChange={(e) => {
                        const ttc = Number.parseFloat(e.target.value) || 0
                        const ht = ttc / (1 + newProduct.tva / 100)
                        setNewProduct({
                          ...newProduct,
                          prix_vente_ttc_detail: ttc,
                          prix_vente_ht_detail: ht,
                        })
                      }}
                    />
                  </div>
                </div>
              )}

              {priceCalculationMethod === "percentage" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prix vente détail HT calculé (DZD)</Label>
                    <Input
                      value={(newProduct.prix_achat_ht * (1 + newProduct.marge_beneficiaire_pourcentage / 100)).toFixed(
                        2,
                      )}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label>Prix vente détail TTC calculé (DZD)</Label>
                    <Input
                      value={(
                        newProduct.prix_achat_ht *
                        (1 + newProduct.marge_beneficiaire_pourcentage / 100) *
                        (1 + newProduct.tva / 100)
                      ).toFixed(2)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prix vente gros HT (DZD)</Label>
                  <Input
                    value={
                      priceCalculationMethod === "percentage"
                        ? (
                            newProduct.prix_achat_ht *
                            (1 + newProduct.marge_beneficiaire_pourcentage / 100) *
                            0.9
                          ).toFixed(2)
                        : (newProduct.prix_vente_ht_detail * 0.9).toFixed(2)
                    }
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Prix vente gros TTC (DZD)</Label>
                  <Input
                    value={
                      priceCalculationMethod === "percentage"
                        ? (
                            newProduct.prix_achat_ht *
                            (1 + newProduct.marge_beneficiaire_pourcentage / 100) *
                            0.9 *
                            (1 + newProduct.tva / 100)
                          ).toFixed(2)
                        : (newProduct.prix_vente_ttc_detail * 0.9).toFixed(2)
                    }
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stock" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantite_disponible">Quantité disponible</Label>
                  <Input
                    id="quantite_disponible"
                    type="number"
                    value={newProduct.quantite_disponible}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, quantite_disponible: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="min_stock">Stock minimum</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    value={newProduct.min_stock}
                    onChange={(e) => setNewProduct({ ...newProduct, min_stock: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="localisation">Localisation</Label>
                <Input
                  id="localisation"
                  value={newProduct.localisation}
                  onChange={(e) => setNewProduct({ ...newProduct, localisation: e.target.value })}
                  placeholder="A1-B2"
                />
              </div>

              <div>
                <Label>Valeur du stock (DZD)</Label>
                <Input
                  value={(newProduct.quantite_disponible * newProduct.prix_achat_ht).toLocaleString()}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perissable"
                  checked={newProduct.perissable}
                  onCheckedChange={(checked) => setNewProduct({ ...newProduct, perissable: checked as boolean })}
                />
                <Label htmlFor="perissable">Produit périssable</Label>
              </div>

              {newProduct.perissable && (
                <div>
                  <Label htmlFor="date_peremption">Date de péremption</Label>
                  <Input
                    id="date_peremption"
                    type="date"
                    value={newProduct.date_peremption}
                    onChange={(e) => setNewProduct({ ...newProduct, date_peremption: e.target.value })}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddProduct}>Ajouter le produit</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Informations générales</TabsTrigger>
                <TabsTrigger value="pricing">Prix et marges</TabsTrigger>
                <TabsTrigger value="stock">Stock et localisation</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-reference">Référence *</Label>
                    <Input
                      id="edit-reference"
                      value={selectedProduct.reference}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, reference: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-code_barre">Code Barre</Label>
                    <Input
                      id="edit-code_barre"
                      value={selectedProduct.code_barre}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, code_barre: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-designation">Désignation *</Label>
                  <Input
                    id="edit-designation"
                    value={selectedProduct.designation}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, designation: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-famille">Famille</Label>
                    <Input
                      id="edit-famille"
                      value={selectedProduct.famille}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, famille: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-sous_famille">Sous-famille</Label>
                    <Input
                      id="edit-sous_famille"
                      value={selectedProduct.sous_famille}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, sous_famille: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-unite">Unité</Label>
                    <Select
                      value={selectedProduct.unite}
                      onValueChange={(value: "Pièce" | "Kit" | "Jeu" | "Lot") =>
                        setSelectedProduct({ ...selectedProduct, unite: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pièce">Pièce</SelectItem>
                        <SelectItem value="Kit">Kit</SelectItem>
                        <SelectItem value="Jeu">Jeu</SelectItem>
                        <SelectItem value="Lot">Lot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-tva">TVA (%)</Label>
                    <Input
                      id="edit-tva"
                      type="number"
                      value={selectedProduct.tva}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, tva: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                {isAdmin && (
                  <div>
                    <Label htmlFor="edit-fournisseur">Fournisseur</Label>
                    <Select
                      value={selectedProduct.fournisseur}
                      onValueChange={(value) => setSelectedProduct({ ...selectedProduct, fournisseur: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un fournisseur" />
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
                )}
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-prix_achat_ht">Prix d'achat HT (DZD)</Label>
                    <Input
                      id="edit-prix_achat_ht"
                      type="number"
                      value={selectedProduct.prix_achat_ht}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          prix_achat_ht: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Prix d'achat TTC (DZD)</Label>
                    <Input
                      value={(selectedProduct.prix_achat_ht * (1 + selectedProduct.tva / 100)).toFixed(2)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-prix_vente_ht_detail">Prix vente détail HT (DZD)</Label>
                    <Input
                      id="edit-prix_vente_ht_detail"
                      type="number"
                      value={selectedProduct.prix_vente_ht_detail}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          prix_vente_ht_detail: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-prix_vente_ttc_detail">Prix vente détail TTC (DZD)</Label>
                    <Input
                      id="edit-prix_vente_ttc_detail"
                      type="number"
                      value={selectedProduct.prix_vente_ttc_detail}
                      onChange={(e) => {
                        const ttc = Number.parseFloat(e.target.value) || 0
                        const ht = ttc / (1 + selectedProduct.tva / 100)
                        setSelectedProduct({
                          ...selectedProduct,
                          prix_vente_ttc_detail: ttc,
                          prix_vente_ht_detail: ht,
                        })
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-prix_vente_ht_gros">Prix vente gros HT (DZD)</Label>
                    <Input
                      id="edit-prix_vente_ht_gros"
                      type="number"
                      value={selectedProduct.prix_vente_ht_gros}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          prix_vente_ht_gros: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Prix vente gros TTC (DZD)</Label>
                    <Input
                      value={(selectedProduct.prix_vente_ht_gros * (1 + selectedProduct.tva / 100)).toFixed(2)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <Label>Marge bénéficiaire (%)</Label>
                  <Input
                    value={
                      selectedProduct.prix_achat_ht > 0
                        ? (
                            ((selectedProduct.prix_vente_ht_detail - selectedProduct.prix_achat_ht) /
                              selectedProduct.prix_achat_ht) *
                            100
                          ).toFixed(2)
                        : "0"
                    }
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </TabsContent>

              <TabsContent value="stock" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-quantite_disponible">Quantité disponible</Label>
                    <Input
                      id="edit-quantite_disponible"
                      type="number"
                      value={selectedProduct.quantite_disponible}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          quantite_disponible: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-min_stock">Stock minimum</Label>
                    <Input
                      id="edit-min_stock"
                      type="number"
                      value={selectedProduct.min_stock}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, min_stock: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-localisation">Localisation</Label>
                  <Input
                    id="edit-localisation"
                    value={selectedProduct.localisation}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, localisation: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Valeur du stock (DZD)</Label>
                  <Input
                    value={(selectedProduct.quantite_disponible * selectedProduct.prix_achat_ht).toLocaleString()}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-perissable"
                    checked={selectedProduct.perissable}
                    onCheckedChange={(checked) =>
                      setSelectedProduct({ ...selectedProduct, perissable: checked as boolean })
                    }
                  />
                  <Label htmlFor="edit-perissable">Produit périssable</Label>
                </div>

                {selectedProduct.perissable && (
                  <div>
                    <Label htmlFor="edit-date_peremption">Date de péremption</Label>
                    <Input
                      id="edit-date_peremption"
                      type="date"
                      value={selectedProduct.date_peremption}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, date_peremption: e.target.value })}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditProduct}>Enregistrer les modifications</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du produit</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Référence</Label>
                      <p className="font-mono font-medium">{selectedProduct.reference}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Désignation</Label>
                      <p className="whitespace-normal break-words">{selectedProduct.designation}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Famille</Label>
                        <p>{selectedProduct.famille}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Sous-famille</Label>
                        <p>{selectedProduct.sous_famille}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Unité</Label>
                        <p>{selectedProduct.unite}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">TVA</Label>
                        <p>{selectedProduct.tva}%</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Code Barre</Label>
                      <p className="font-mono text-sm">{selectedProduct.code_barre}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Prix et marges</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isAdmin && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Prix achat HT</Label>
                          <p className="font-medium">{(selectedProduct.prix_achat_ht || 0).toFixed(2).toLocaleString()} DZD</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Prix achat TTC</Label>
                          <p className="font-medium">{(selectedProduct.prix_achat_ttc || 0).toFixed(2).toLocaleString()} DZD</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Prix vente détail HT</Label>
                        <p className="font-medium">
                          {(selectedProduct.prix_vente_ht_detail || 0).toFixed(2).toLocaleString()} DZD
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Prix vente détail TTC</Label>
                        <p className="font-medium">
                          {(selectedProduct.prix_vente_ttc_detail || 0).toFixed(2).toLocaleString()} DZD
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Prix vente gros HT</Label>
                        <p className="font-medium">{(selectedProduct.prix_vente_ht_gros || 0).toFixed(2).toLocaleString()} DZD</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Prix vente gros TTC</Label>
                        <p className="font-medium">{(selectedProduct.prix_vente_ttc_gros || 0).toFixed(2).toLocaleString()} DZD</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Marge bénéficiaire</Label>
                        <p className="font-medium text-green-600">
                          {(selectedProduct.marge_beneficiaire_pourcentage || 0).toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stock et localisation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Quantité disponible</Label>
                        <p className="font-medium text-2xl">{selectedProduct.quantite_disponible}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Stock minimum</Label>
                        <p className="font-medium">{selectedProduct.min_stock}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Statut du stock</Label>
                      <Badge className={getStockStatus(selectedProduct).color}>
                        {getStockStatus(selectedProduct).status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Localisation</Label>
                      <p>{selectedProduct.localisation}</p>
                    </div>
                    {isAdmin && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Valeur du stock</Label>
                        <p className="font-medium text-green-600">
                          {(selectedProduct.valeur_stock || 0).toFixed(2).toLocaleString()} DZD
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations complémentaires</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isAdmin && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Fournisseur</Label>
                        <p>{getSupplierName(selectedProduct.fournisseur)}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Produit périssable</Label>
                      <Badge variant={selectedProduct.perissable ? "destructive" : "secondary"}>
                        {selectedProduct.perissable ? "Oui" : "Non"}
                      </Badge>
                    </div>
                    {selectedProduct.perissable && selectedProduct.date_peremption && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Date de péremption</Label>
                        <p>{new Date(selectedProduct.date_peremption).toLocaleDateString("fr-FR")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Products Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Importer des produits Excel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertDescription>
                Importez vos produits au format Excel (.xlsx, .xls). Utilisez le modèle fourni pour garantir la
                compatibilité. Taille maximale: 50MB.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadTemplate} className="flex-1 bg-transparent">
                <FileDown className="w-4 h-4 mr-2" />
                Télécharger le modèle Excel
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Glissez-déposez votre fichier Excel ici ou cliquez pour sélectionner
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      className="sr-only"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">Formats supportés: .xlsx, .xls (max 50MB)</p>
                </div>
              </div>
            </div>

            {selectedFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">{selectedFile.name}</p>
                      <p className="text-xs text-blue-600">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Importation Excel en cours...</span>
                  <span>{Math.round(importProgress)}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Structure Excel requise :</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>
                  <strong>Colonnes obligatoires :</strong>
                </p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>Référence, Désignation, Famille, Sous-famille</li>
                  <li>TVA (%), Prix Achat HT (DZD), Prix Vente Détail HT (DZD)</li>
                  <li>Stock Disponible, Stock Minimum, Unité, Localisation</li>
                  <li>Fournisseur, Code Barre, Périssable (OUI/NON)</li>
                </ul>
                <p className="mt-2">
                  <strong>Conseil :</strong> Utilisez le modèle Excel fourni pour éviter les erreurs de format.
                </p>
                <p className="mt-1">
                  <strong>Performance :</strong> Les gros fichiers Excel sont traités par chunks pour optimiser les
                  performances.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowImportDialog(false)} disabled={isImporting}>
              Annuler
            </Button>
            <Button onClick={handleImportProducts} disabled={!selectedFile || isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importation Excel...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importer Excel
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Référence existe déjà</DialogTitle>
          </DialogHeader>
          <div className="text-gray-700 text-sm">
            Un produit avec cette référence existe déjà. Veuillez en choisir une autre.
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowDuplicateDialog(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}