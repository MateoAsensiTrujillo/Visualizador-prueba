"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  MapPin,
  Database,
  Layers,
  Factory,
  Users,
  Truck,
  Waves,
  Mountain,
  Leaf,
  Shield,
  Building,
  ArrowLeft,
  Cloud,
  MapIcon,
  BarChart3,
  FileText,
  Archive,
  Download,
  ExternalLink,
  ChevronDown,
} from "lucide-react"

// Import the JSON data
import catalogData from "@/data/catalogo-objetos-2025.json"
import dbyFData from "../data/DByF_V2.0_IDERA_2022.json"

interface Atributo {
  codigo: string
  denominacion: string
}

interface AtributoDetalle {
  codigo: string
  nombre: string
  definicion: string
  dominio: Array<{
    codigo: number | string
    etiqueta: string
    definicion: string
    observaciones: string
  }> | null
  tipo: string
  observaciones: string
}

interface Objeto {
  nombre: string
  codigo: number
  geometria: string
  definicion: string
  atributos: Atributo[]
}

interface Subcategoria {
  nombre: string
  codigo: number
  contenido: string
  objetos: Objeto[]
}

interface Categoria {
  nombre: string
  codigo: number
  contenido: string
  subcategorias: Subcategoria[]
}

const categoryColors = {
  1: {
    // INDUSTRIA Y SERVICIOS - Yellow
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-yellow-400",
    lightColor: "bg-yellow-50 border-yellow-200 text-yellow-800",
    hoverColor: "hover:bg-gray-200",
    icon: Factory,
    name: "INDUSTRIA Y SERVICIOS",
  },
  2: {
    // INFRAESTRUCTURA SOCIAL - Red
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-red-400",
    lightColor: "bg-red-50 border-red-200 text-red-800",
    hoverColor: "hover:bg-gray-200",
    icon: Users,
    name: "INFRAESTRUCTURA SOCIAL",
  },
  3: {
    // TRANSPORTE - Orange
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-orange-400",
    lightColor: "bg-orange-50 border-orange-200 text-orange-800",
    hoverColor: "hover:bg-gray-200",
    icon: Truck,
    name: "TRANSPORTE",
  },
  4: {
    // HIDROGRAFÍA Y OCEANOGRAFÍA - Light Blue
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-cyan-400",
    lightColor: "bg-cyan-50 border-cyan-200 text-cyan-800",
    hoverColor: "hover:bg-gray-200",
    icon: Waves,
    name: "HIDROGRAFÍA Y OCEANOGRAFÍA",
  },
  5: {
    // GEOGRAFÍA FÍSICA - Brown
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-amber-400",
    lightColor: "bg-amber-50 border-amber-200 text-amber-800",
    hoverColor: "hover:bg-gray-200",
    icon: Mountain,
    name: "GEOGRAFÍA FÍSICA",
  },
  6: {
    // BIOTA - Green
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-green-400",
    lightColor: "bg-green-50 border-green-200 text-green-800",
    hoverColor: "hover:bg-gray-200",
    icon: Leaf,
    name: "BIOTA",
  },
  7: {
    // DEMARCACIÓN - Gray
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-gray-400",
    lightColor: "bg-gray-50 border-gray-200 text-gray-800",
    hoverColor: "hover:bg-gray-200",
    icon: Building,
    name: "DEMARCACIÓN",
  },
  8: {
    // CLIMA Y METEOROLOGÍA - Dark Blue
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-blue-400",
    lightColor: "bg-blue-50 border-blue-200 text-blue-800",
    hoverColor: "hover:bg-gray-200",
    icon: Cloud,
    name: "CLIMA Y METEOROLOGÍA",
  },
  9: {
    // DEFENSA Y SEGURIDAD - Purple
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-purple-400",
    lightColor: "bg-purple-50 border-purple-200 text-purple-800",
    hoverColor: "hover:bg-gray-200",
    icon: Shield,
    name: "DEFENSA Y SEGURIDAD",
  },
  10: {
    // CATASTRO - Beige/Orange
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-orange-400",
    lightColor: "bg-orange-50 border-orange-200 text-orange-800",
    hoverColor: "hover:bg-gray-200",
    icon: MapIcon,
    name: "CATASTRO",
  },
  11: {
    // UNIDADES GEOESTADÍSTICAS - Light Green
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-emerald-400",
    lightColor: "bg-emerald-50 border-emerald-200 text-emerald-800",
    hoverColor: "hover:bg-gray-200",
    icon: BarChart3,
    name: "UNIDADES GEOESTADÍSTICAS",
  },
  12: {
    // ABSTRACTO - Dark Purple
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-violet-400",
    lightColor: "bg-violet-50 border-violet-200 text-violet-800",
    hoverColor: "hover:bg-gray-200",
    icon: Archive,
    name: "ABSTRACTO",
  },
}

const geometryColors = {
  Polígono: "bg-emerald-500 text-white",
  Punto: "bg-rose-500 text-white",
  Línea: "bg-indigo-500 text-white",
  default: "bg-gray-500 text-white",
}

const getGeometryType = (geometria: string): string => {
  if (geometria.toLowerCase().includes("point") || geometria.toLowerCase().includes("punto")) {
    return "Punto"
  }
  if (
    geometria.toLowerCase().includes("line") ||
    geometria.toLowerCase().includes("línea") ||
    geometria.toLowerCase().includes("linea")
  ) {
    return "Línea"
  }
  if (
    geometria.toLowerCase().includes("polygon") ||
    geometria.toLowerCase().includes("polígono") ||
    geometria.toLowerCase().includes("poligono")
  ) {
    return "Polígono"
  }
  return geometria
}

type NavigationLevel = "categories" | "subcategories" | "objects"

export function GeographicDataDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel>("categories")
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategoria | null>(null)
  const [expandedDefinitions, setExpandedDefinitions] = useState<Set<number>>(new Set())
  const [atributos, setAtributos] = useState<AtributoDetalle[]>([])

  const data = catalogData as Categoria[]

  useEffect(() => {
    fetch("/atributos-2025.json")
      .then((res) => res.json())
      .then((data) => setAtributos(data))
      .catch((error) => console.error("Error loading atributos:", error))
  }, [])

  const getAtributoDetalle = (codigo: string): AtributoDetalle | null => {
    return atributos.find((attr) => attr.codigo === codigo) || null
  }

  const getFilteredData = () => {
    if (currentLevel === "categories") {
      return data.filter((categoria) => categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    } else if (currentLevel === "subcategories" && selectedCategory) {
      return selectedCategory.subcategorias.filter((subcategoria) =>
        subcategoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    } else if (currentLevel === "objects" && selectedSubcategory) {
      return selectedSubcategory.objetos.filter((objeto) =>
        objeto.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    return []
  }

  const getCategoryConfig = (codigo: number) => {
    return (
      categoryColors[codigo as keyof typeof categoryColors] || {
        color: "bg-gray-100 text-gray-900 border-gray-300",
        circleColor: "bg-gray-700",
        lightColor: "bg-gray-50 border-gray-200 text-gray-800",
        hoverColor: "hover:bg-gray-200",
        icon: Database,
        name: "CATEGORÍA",
      }
    )
  }

  const getGeometryColor = (geometria: string) => {
    return geometryColors[geometria as keyof typeof geometryColors] || geometryColors.default
  }

  const handleCategorySelect = (categoria: Categoria) => {
    setSelectedCategory(categoria)
    setCurrentLevel("subcategories")
    setSearchTerm("")
  }

  const handleSubcategorySelect = (subcategoria: Subcategoria) => {
    setSelectedSubcategory(subcategoria)
    setCurrentLevel("objects")
    setSearchTerm("")
  }

  const handleBackNavigation = () => {
    if (currentLevel === "objects") {
      setCurrentLevel("subcategories")
      setSelectedSubcategory(null)
    } else if (currentLevel === "subcategories") {
      setCurrentLevel("categories")
      setSelectedCategory(null)
      setSelectedSubcategory(null)
    }
    setSearchTerm("")
  }

  const isDByF = (codigo: number): boolean => {
    try {
      return dbyFData.DByF.some((item: any) => {
        const itemCode = Number.parseInt(item.Column5?.toString() || "0")
        return itemCode === codigo
      })
    } catch (error) {
      return false
    }
  }

  const toggleDefinition = (codigo: number) => {
    setExpandedDefinitions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(codigo)) {
        newSet.delete(codigo)
      } else {
        newSet.add(codigo)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 backdrop-blur-sm shadow-sm rounded-lg mb-8 p-4">
          <div className="flex items-center justify-center gap-6">
            <img src="/images/logo-idera.png" alt="IDERA Logo" className="h-28 w-auto" />
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 text-balance">
                Catálogo de Objetos Geográficos
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 text-pretty">
                Infraestructura de Datos Espaciales de la República Argentina
              </p>
            </div>
          </div>
        </div>

        {/* Information Banner */}
        <Card className="mb-6 border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-gray-700 mb-1">ALCANCE</h3>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    Facilitar el manejo de la información Geoespacial de forma homologada y descentralizada que
                    contribuya a garantizar la interoperabilidad y calidad de la información generada en el ámbito
                    nacional.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-700 mb-1">CAMPO DE APLICACIÓN</h3>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    Generación de Cartografía Oficial de la República Argentina.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-gray-700 mb-1">NÚMERO DE LA VERSIÓN</h3>
                    <p className="text-sm text-gray-900">2.2</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-700 mb-1">FECHA DE LA VERSIÓN</h3>
                    <p className="text-sm text-gray-900">Septiembre 2025</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-700 mb-1">LENGUAJE</h3>
                    <p className="text-sm text-gray-900">ESPAÑOL - ES</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-gray-700 mb-2">FUENTES PRINCIPALES</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <a
                        href="https://www.ign.es/web/ide-glosario-panhispanico"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Versión Panhispánica del Glosario Normalizado de ISO/TC211
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <a
                        href="https://campus.idera.gob.ar/mod/resource/view.php?id=151"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Guía de Normas ISO/TC211 del IPGH
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <a
                        href="https://www.dgiwg.org/digest/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Compendio del Estándar de Intercambio de Información Geográfica Digital (DGWIG - Año 2000)
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <a
                        href="http://www.geoportaligm.gob.ec/portal/index.php/descargas/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Catálogo de Objetos Geográficos IGM Ecuador
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <a
                        href="http://www.ign.gob.ar/NuestrasActividades/catalogo-de-objetos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Diccionario y Catálogo de Objetos Geográficos IGN Argentina Versión 2.0
                      </a>
                    </div>
                  </div>
                </div>

                {/* Symbology Download Menu */}
                <div className="pt-3 border-t border-cyan-200">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Simbología para Datos Básicos y Fundamentales
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem
                        onClick={() => {
                          // TODO: Replace with actual ZIP file download
                          alert(
                            "Por favor, proporciona el archivo ZIP para SLD-SVG (sin escala) para habilitar esta descarga.",
                          )
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        SLD-SVG sin escala (zip)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          // TODO: Replace with actual ZIP file download
                          alert(
                            "Por favor, proporciona el archivo ZIP para SLD-SVG (con escala) para habilitar esta descarga.",
                          )
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        SLD-SVG con escala (zip)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Navigation Controls */}
          <div className="flex items-center gap-4 mb-6">
            {currentLevel !== "categories" && (
              <Button
                variant="outline"
                onClick={handleBackNavigation}
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            )}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={
                  currentLevel === "categories"
                    ? "Buscar categorías..."
                    : currentLevel === "subcategories"
                      ? "Buscar subcategorías..."
                      : "Buscar objetos..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {currentLevel === "categories" && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {getFilteredData().map((categoria: Categoria) => {
                const config = getCategoryConfig(categoria.codigo)
                const IconComponent = config.icon
                const totalObjetos = categoria.subcategorias.reduce((acc, sub) => acc + sub.objetos.length, 0)

                return (
                  <div
                    key={categoria.codigo}
                    className={`${config.color} ${config.hoverColor} cursor-pointer transition-all duration-200 hover:scale-105 border-2 rounded-lg p-4 min-h-[120px] flex flex-col justify-center items-center text-center shadow-sm`}
                    onClick={() => handleCategorySelect(categoria)}
                  >
                    <div className={`${config.circleColor} rounded-full p-3 mb-2`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="font-bold text-sm leading-tight mb-2">{categoria.nombre}</div>
                    <Badge variant="outline" className="mb-1 text-xs bg-white/50 border-gray-400">
                      Código: {categoria.codigo.toString().padStart(2, "0")}
                    </Badge>
                    <div className="text-xs opacity-80">{categoria.subcategorias.length} subcategorías</div>
                    <div className="text-xs opacity-80">{totalObjetos} objetos</div>
                  </div>
                )
              })}
            </div>
          )}

          {currentLevel === "subcategories" && selectedCategory && (
            <div className="space-y-4">
              <Card className="border-2 border-gray-300 shadow-sm bg-white">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const config = getCategoryConfig(selectedCategory.codigo)
                      const IconComponent = config.icon
                      return (
                        <div className={`p-2 rounded ${config.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                      )
                    })()}
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 text-gray-900">{selectedCategory.nombre}</CardTitle>
                      <p className="text-sm text-gray-900 leading-relaxed">{selectedCategory.contenido}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {getFilteredData().map((subcategoria: Subcategoria) => {
                  const config = getCategoryConfig(selectedCategory.codigo)
                  return (
                    <div
                      key={subcategoria.codigo}
                      className={`${config.color} ${config.hoverColor} cursor-pointer transition-all duration-200 hover:scale-105 border-2 rounded-lg p-4 min-h-[100px] flex flex-col justify-center items-center text-center shadow-sm`}
                      onClick={() => handleSubcategorySelect(subcategoria)}
                    >
                      <div className={`${config.circleColor} rounded-full p-2 mb-2`}>
                        <Layers className="h-6 w-6 text-white" />
                      </div>
                      <div className="font-bold text-sm leading-tight mb-2">{subcategoria.nombre}</div>
                      <Badge variant="outline" className="mb-1 text-xs bg-white/50 border-gray-400">
                        Código: {subcategoria.codigo.toString().padStart(4, "0")}
                      </Badge>
                      <div className="text-xs opacity-80">{subcategoria.objetos.length} objetos</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {currentLevel === "objects" && selectedSubcategory && (
            <div className="space-y-4">
              <Card className="border-2 border-gray-300 shadow-sm bg-white">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Layers className="h-6 w-6 text-gray-600" />
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 text-gray-900">{selectedSubcategory.nombre}</CardTitle>
                      <p className="text-sm text-gray-900 leading-relaxed">{selectedSubcategory.contenido}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredData().map((objeto: Objeto) => {
                  const geometryType = getGeometryType(objeto.geometria)
                  const objectSlug = `${objeto.codigo}-${objeto.nombre
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[áàäâ]/g, "a")
                    .replace(/[éèëê]/g, "e")
                    .replace(/[íìïî]/g, "i")
                    .replace(/[óòöô]/g, "o")
                    .replace(/[úùüû]/g, "u")
                    .replace(/ñ/g, "n")
                    .replace(/[^a-z0-9-]/g, "")}`

                  const isExpanded = expandedDefinitions.has(objeto.codigo)
                  const needsExpansion = objeto.definicion.length > 200

                  return (
                    <Card
                      key={objeto.codigo}
                      className="transition-all duration-200 hover:shadow-lg border-2 border-gray-200 hover:border-gray-300"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                Código: {objeto.codigo.toString().padStart(6, "0")}
                              </Badge>
                              <Badge className={`${getGeometryColor(geometryType)} text-xs`}>{geometryType}</Badge>
                            </div>
                            <CardTitle className="text-lg text-balance leading-tight mb-2">{objeto.nombre}</CardTitle>
                            {isDByF(objeto.codigo) && (
                              <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-semibold">
                                Dato Básico y Fundamental
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div
                            className={`text-sm text-gray-900 text-pretty leading-relaxed ${
                              !isExpanded && needsExpansion ? "line-clamp-3" : ""
                            }`}
                          >
                            {objeto.definicion}
                          </div>
                          {needsExpansion && (
                            <button
                              onClick={() => toggleDefinition(objeto.codigo)}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
                            >
                              {isExpanded ? "Leer menos" : "Leer más"}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-end mb-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                                <FileText className="h-4 w-4" />
                                Atributos ({objeto.atributos.length})
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <MapPin className="h-5 w-5 text-blue-600" />
                                  {objeto.nombre}
                                  {isDByF(objeto.codigo) && (
                                    <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs">
                                      Dato Básico y Fundamental
                                    </Badge>
                                  )}
                                </DialogTitle>
                                <DialogDescription>
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant="outline">Código: {objeto.codigo.toString().padStart(6, "0")}</Badge>
                                    <Badge className={getGeometryColor(geometryType)}>{geometryType}</Badge>
                                  </div>
                                  {isDByF(objeto.codigo) && (
                                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                                      <div className="text-xs text-amber-800">
                                        <strong>Dato Básico y Fundamental:</strong> Este objeto forma parte del catálogo
                                        oficial DByF v2.0 de IDERA para la generación de cartografía oficial de la
                                        República Argentina.
                                      </div>
                                    </div>
                                  )}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div>
                                  <h4 className="font-semibold mb-2 text-gray-800">Definición</h4>
                                  <div className="text-sm text-gray-700 text-pretty leading-relaxed">
                                    {objeto.definicion}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2 text-gray-800">
                                    Atributos ({objeto.atributos.length})
                                  </h4>
                                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                                    {objeto.atributos.map((atributo, index) => {
                                      const detalle = getAtributoDetalle(atributo.codigo)
                                      return (
                                        <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                          <div className="flex items-start gap-2 mb-2">
                                            <Badge variant="outline" className="border-gray-300 shrink-0">
                                              {atributo.codigo}
                                            </Badge>
                                            <div className="flex-1">
                                              <div className="font-semibold text-sm text-gray-900">
                                                {detalle?.nombre || atributo.denominacion}
                                              </div>
                                              {detalle && (
                                                <>
                                                  <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                    {detalle.definicion}
                                                  </div>
                                                  <div className="flex gap-2 mt-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                      Tipo: {detalle.tipo}
                                                    </Badge>
                                                  </div>
                                                  {detalle.dominio && detalle.dominio.length > 0 && (
                                                    <div className="mt-2">
                                                      <div className="text-xs font-semibold text-gray-700 mb-1">
                                                        Valores posibles:
                                                      </div>
                                                      <div className="space-y-1 max-h-32 overflow-y-auto">
                                                        {detalle.dominio.map((valor, idx) => (
                                                          <div
                                                            key={idx}
                                                            className="text-xs text-gray-600 pl-2 border-l-2 border-gray-300"
                                                          >
                                                            <span className="font-medium">{valor.etiqueta}</span>
                                                            {valor.definicion && (
                                                              <span className="text-gray-500">
                                                                {" "}
                                                                - {valor.definicion}
                                                              </span>
                                                            )}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}
                                                  {detalle.observaciones && detalle.observaciones !== "-" && (
                                                    <div className="text-xs text-gray-500 mt-1 italic">
                                                      {detalle.observaciones}
                                                    </div>
                                                  )}
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="space-y-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Descarga
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  window.open(
                                    `https://www.idera.gob.ar/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=${objectSlug}`,
                                    "_blank",
                                  )
                                }
                              >
                                <ExternalLink className="h-3 w-3 mr-2" />
                                WFS
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                            onClick={() =>
                              window.open(`https://www.idera.gob.ar/catalogo/metadatos/${objeto.codigo}`, "_blank")
                            }
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Catálogo de Metadatos
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
