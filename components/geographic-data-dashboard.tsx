"use client"

import { useState, useEffect, useMemo } from "react"
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
  Home,
  Cloud,
  MapIcon,
  BarChart3,
  FileText,
  Archive,
  Download,
  ExternalLink,
  ChevronDown,
} from "lucide-react"

import catalogData from "@/data/catalogo-idesob.json"
import dbyFData from "../data/DByF_V2.0_IDERA_2022.json"
import { SearchResults } from "./search-results"
import { normalize } from "@/lib/search-utils"
import { useDebounce } from "@/hooks/use-debounce"
import { Categoria, Subcategoria, Objeto, Atributo, SearchResult, NavigationLevel } from "@/lib/types"

const categoryColors: Record<string, {
  color: string; circleColor: string; lightColor: string; hoverColor: string;
  borderColor: string; textColor: string;
  icon: React.ComponentType<{ className?: string }>; name: string
}> = {
  "1": {
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-[#FFFF99]",
    lightColor: "bg-[#FFFF99]/40 border-[#FFFF99]/80 text-[#7A5000]",
    hoverColor: "hover:bg-[#FFFF99]/60",
    borderColor: "border-[#FFFF99]",
    textColor: "text-[#7A5000]",
    icon: Factory,
    name: "INDUSTRIA Y SERVICIOS",
  },
  "2": {
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-[#FF0000]",
    lightColor: "bg-[#FF0000]/10 border-[#FF0000]/30 text-[#CC0000]",
    hoverColor: "hover:bg-[#FF0000]/10",
    borderColor: "border-[#FF0000]",
    textColor: "text-[#CC0000]",
    icon: Users,
    name: "GEOGRAFÍA SOCIAL",
  },
  "3": {
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-[#FF8000]",
    lightColor: "bg-[#FF8000]/10 border-[#FF8000]/40 text-[#CC6600]",
    hoverColor: "hover:bg-[#FF8000]/10",
    borderColor: "border-[#FF8000]",
    textColor: "text-[#CC6600]",
    icon: Truck,
    name: "TRANSPORTE",
  },
  "4": {
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-[#33CCFF]",
    lightColor: "bg-[#33CCFF]/10 border-[#33CCFF]/40 text-[#007EA8]",
    hoverColor: "hover:bg-[#33CCFF]/10",
    borderColor: "border-[#33CCFF]",
    textColor: "text-[#007EA8]",
    icon: Waves,
    name: "HIDROGRAFÍA Y OCEANOGRAFÍA",
  },
  "5": {
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-[#996633]",
    lightColor: "bg-[#996633]/10 border-[#996633]/40 text-[#664422]",
    hoverColor: "hover:bg-[#996633]/10",
    borderColor: "border-[#996633]",
    textColor: "text-[#664422]",
    icon: Mountain,
    name: "GEOGRAFÍA FÍSICA",
  },
  "6": {
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-[#00FF00]",
    lightColor: "bg-[#00FF00]/20 border-[#00FF00]/40 text-[#008000]",
    hoverColor: "hover:bg-[#00FF00]/20",
    borderColor: "border-[#00FF00]",
    textColor: "text-[#008000]",
    icon: Leaf,
    name: "BIOTA",
  },
  "7": {
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-[#808080]",
    lightColor: "bg-[#808080]/20 border-[#808080]/40 text-[#555555]",
    hoverColor: "hover:bg-[#808080]/20",
    borderColor: "border-[#808080]",
    textColor: "text-[#555555]",
    icon: Building,
    name: "DEMARCACIÓN",
  },
  "9": {
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-[#9966FF]",
    lightColor: "bg-[#9966FF]/10 border-[#9966FF]/40 text-[#6633CC]",
    hoverColor: "hover:bg-[#9966FF]/10",
    borderColor: "border-[#9966FF]",
    textColor: "text-[#6633CC]",
    icon: Shield,
    name: "DEFENSA Y SEGURIDAD",
  },
  "10": {
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-[#0080C0]",
    lightColor: "bg-[#0080C0]/20 border-[#0080C0]/40 text-[#005580]",
    hoverColor: "hover:bg-[#0080C0]/20",
    borderColor: "border-[#0080C0]",
    textColor: "text-[#005580]",
    icon: Cloud,
    name: "CLIMA Y METEOROLOGÍA",
  },
  "11": {
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-[#FF9966]",
    lightColor: "bg-[#FF9966]/20 border-[#FF9966]/40 text-[#CC5522]",
    hoverColor: "hover:bg-[#FF9966]/20",
    borderColor: "border-[#FF9966]",
    textColor: "text-[#CC5522]",
    icon: MapIcon,
    name: "CATASTRO",
  },
  "12": {
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-[#00CC99]",
    lightColor: "bg-[#00CC99]/20 border-[#00CC99]/40 text-[#008866]",
    hoverColor: "hover:bg-[#00CC99]/20",
    borderColor: "border-[#00CC99]",
    textColor: "text-[#008866]",
    icon: BarChart3,
    name: "UNIDADES GEOESTADÍSTICAS",
  },
  "23": {
    color: "bg-gray-100 text-gray-900 border-gray-300",
    circleColor: "bg-[#800080]",
    lightColor: "bg-[#800080]/10 border-[#800080]/40 text-[#4D004D]",
    hoverColor: "hover:bg-[#800080]/10",
    borderColor: "border-[#800080]",
    textColor: "text-[#4D004D]",
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

/** Devuelve un array con los tipos de geometría detectados en el string */
const getGeometryTypes = (geometria: string): string[] => {
  const raw = geometria.toLowerCase()
  const types: string[] = []
  if (raw.includes("punto") || raw.includes("point")) types.push("Punto")
  if (raw.includes("línea") || raw.includes("linea") || raw.includes("line")) types.push("Línea")
  if (raw.includes("polígono") || raw.includes("poligono") || raw.includes("polygon")) types.push("Polígono")
  if (raw.includes("ráster") || raw.includes("raster")) types.push("Ráster")
  if (types.length === 0 && geometria.trim()) types.push(geometria.trim())
  return types
}

export function GeographicDataDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel>("categories")
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategoria | null>(null)
  const [expandedDefinitions, setExpandedDefinitions] = useState<Set<string | number>>(new Set())
  const [openDialogObjectId, setOpenDialogObjectId] = useState<string | number | null>(null)

  const data = catalogData as Categoria[]
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const isGlobalSearch = debouncedSearchTerm.trim().length >= 2

  const searchIndex = useMemo(() => {
    const idx: SearchResult = {
      categorias: [],
      subcategorias: [],
      objetos: [],
      atributos: []
    }
    const atributosMap = new Map<string, typeof idx.atributos[0]>()

    data.forEach(cat => {
      idx.categorias.push({
        ...cat,
        textoBusqueda: normalize(`${cat.nombre} ${cat.codigo}`)
      })

      cat.subcategorias.forEach(sub => {
        idx.subcategorias.push({
          ...sub,
          parentCat: cat,
          textoBusqueda: normalize(`${sub.nombre} ${sub.codigo}`)
        })

        sub.objetos.forEach(obj => {
          idx.objetos.push({
            ...obj,
            parentCat: cat,
            parentSub: sub,
            textoBusqueda: normalize(`${obj.nombre} ${obj.codigo} ${obj.definicion}`)
          })

          obj.atributos.forEach(attr => {
            if (!atributosMap.has(attr.codigo)) {
              atributosMap.set(attr.codigo, {
                ...attr,
                textoBusqueda: normalize(`${attr.denominacion || attr.nombre || ""} ${attr.codigo}`),
                objetos: []
              })
            }
            atributosMap.get(attr.codigo)!.objetos.push({
              categoria: cat,
              subcategoria: sub,
              objeto: obj
            })
          })
        })
      })
    })
    
    idx.atributos = Array.from(atributosMap.values())
    return idx
  }, [data])

  const searchResults = useMemo(() => {
    if (!isGlobalSearch) return null
    const q = normalize(debouncedSearchTerm)
    return {
      categorias: searchIndex.categorias.filter(c => c.textoBusqueda.includes(q)),
      subcategorias: searchIndex.subcategorias.filter(s => s.textoBusqueda.includes(q)),
      objetos: searchIndex.objetos.filter(o => o.textoBusqueda.includes(q)),
      atributos: searchIndex.atributos.filter(a => a.textoBusqueda.includes(q))
    }
  }, [debouncedSearchTerm, searchIndex, isGlobalSearch])

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

  const getCategoryConfig = (codigo: string | number) => {
    return (
      categoryColors[codigo] || {
        color: "bg-gray-100 text-gray-900 border-gray-300",
        circleColor: "bg-gray-700",
        lightColor: "bg-gray-50 border-gray-200 text-gray-800",
        hoverColor: "hover:bg-gray-200",
        icon: Database,
        name: "CATEGORÍA",
      }
    )
  }

  const getAtributoDetalle = (codigo: string, atributosLista: Atributo[]): Atributo | null => {
    return atributosLista.find((a) => a.codigo === codigo) || null
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

  const handleNavigateToObject = (objeto: Objeto, subcategoria: Subcategoria, categoria: Categoria) => {
    setSelectedCategory(categoria)
    setSelectedSubcategory(subcategoria)
    setCurrentLevel("objects")
    setSearchTerm("")
    setOpenDialogObjectId(objeto.codigo)
    
    setTimeout(() => {
      const el = document.getElementById(`objeto-${objeto.codigo}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-4', 'ring-blue-400', 'ring-offset-2', 'transition-all', 'duration-500')
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-blue-400', 'ring-offset-2')
        }, 2000)
      }
    }, 100)
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

  const isDByF = (codigo: string | number): boolean => {
    try {
      const numCodigo = typeof codigo === 'string' ? Number.parseInt(codigo, 10) : codigo;
      return dbyFData.DByF.some((item: any) => {
        const itemCode = Number.parseInt(item.Column5?.toString() || "0")
        return itemCode === numCodigo
      })
    } catch (error) {
      return false
    }
  }

  const toggleDefinition = (codigo: string | number) => {
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
        <div className="sticky top-0 z-50 backdrop-blur-sm shadow-lg rounded-xl mb-8 overflow-hidden">
          {/* Gradient background - green tones */}
          <div className="bg-gradient-to-r from-[#1a4731] via-[#2d6a4f] to-[#40916c] p-5">
            <div className="flex items-center justify-between gap-4">

              {/* Left: IDESoB logo (main) - links to idesob.uns.edu.ar */}
              <div className="flex-shrink-0">
                <a href="https://idesob.uns.edu.ar/" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/logo-idesob.png"
                    alt="Logo IDESoB"
                    className="h-16 w-auto object-contain drop-shadow-md bg-white/90 rounded-lg px-3 py-1 hover:opacity-85 transition-opacity cursor-pointer"
                  />
                </a>
              </div>

              {/* Center: Title */}
              <div className="flex-1 text-center px-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="inline-block w-10 h-px bg-white/40 rounded-full" />
                  <span className="text-xs font-semibold tracking-[0.3em] text-white/75 uppercase">IDESoB</span>
                  <span className="inline-block w-10 h-px bg-white/40 rounded-full" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-balance drop-shadow-md"
                  style={{ color: "#d8f3dc" }}>
                  Catálogo de Objetos Geográficos
                </h1>
                <p className="text-sm sm:text-base font-medium mt-1 text-pretty" style={{ color: "#b7e4c7" }}>
                  Infraestructura de Datos Espaciales del Sudoeste Bonaerense
                </p>
              </div>

              {/* Right: UNS logo - links to uns.edu.ar */}
              <div className="flex-shrink-0">
                <a href="https://www.uns.edu.ar/" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/logo-uns.png"
                    alt="Logo UNS"
                    className="h-16 w-auto object-contain drop-shadow-md bg-white/90 rounded-lg px-3 py-1 hover:opacity-85 transition-opacity cursor-pointer"
                  />
                </a>
              </div>

            </div>
          </div>
          {/* Bottom accent strip - lighter green */}
          <div className="h-1 bg-gradient-to-r from-[#52b788] via-[#95d5b2] to-[#52b788]" />
        </div>

        {/* Information Banner */}
        <Card className="mb-6 border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-gray-700 mb-1">ALCANCE</h3>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    Facilitar el manejo de la información geográfica de forma homologada y descentralizada que
                    contribuya a garantizar la interoperabilidad y calidad de la información geográfica producida en el ámbito de la IDESoB.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-700 mb-1">CAMPO DE APLICACIÓN</h3>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    Instituciones territoriales del Sudoeste Bonaerense.<br />
                    Autoridades de planificación del Sudoeste Bonaerense.<br />
                    Todos los responsables de la creación de información geográfica.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-gray-700 mb-1">NÚMERO DE LA VERSIÓN</h3>
                    <p className="text-sm text-gray-900">2.1</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-700 mb-1">FECHA DE LA VERSIÓN</h3>
                    <p className="text-sm text-gray-900">2026</p>
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


              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Navigation Controls */}
          <div className="flex items-center gap-4 mb-6">
            {currentLevel !== "categories" && !isGlobalSearch && (
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentLevel("categories")
                  setSelectedCategory(null)
                  setSelectedSubcategory(null)
                  setSearchTerm("")
                }}
                className="flex items-center gap-2 bg-transparent"
              >
                <Home className="h-4 w-4" />
                Inicio
              </Button>
            )}
            {currentLevel !== "categories" && !isGlobalSearch && (
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
                placeholder="Buscar categorías, subcategorías, objetos o atributos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 border-gray-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {isGlobalSearch && searchResults ? (
            <SearchResults
              results={searchResults}
              searchTerm={debouncedSearchTerm}
              onNavigateToCategory={handleCategorySelect}
              onNavigateToSubcategory={(sub, cat) => {
                setSelectedCategory(cat)
                handleSubcategorySelect(sub)
              }}
              onNavigateToObject={handleNavigateToObject}
              getCategoryConfig={getCategoryConfig}
              getGeometryTypes={getGeometryTypes}
              getGeometryColor={getGeometryColor}
              isDByF={isDByF}
            />
          ) : (
            <>


          {currentLevel === "categories" && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {(getFilteredData() as any[]).map((categoria: Categoria) => {
                const config = getCategoryConfig(categoria.codigo)
                const IconComponent = config.icon
                const totalObjetos = categoria.subcategorias.reduce((acc, sub) => acc + sub.objetos.length, 0)

                return (
                  <div
                    key={categoria.codigo}
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 border-2 rounded-lg p-4 min-h-[130px] flex flex-col justify-center items-center text-center shadow-sm bg-white ${config.borderColor}`}
                    onClick={() => handleCategorySelect(categoria)}
                  >
                    <div
                      className={`rounded-full p-3 mb-2 shadow-md ${config.circleColor}`}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="font-bold text-sm leading-tight mb-2 text-gray-800">{categoria.nombre}</div>
                    <Badge variant="outline" className="mb-1 text-xs bg-white border-gray-300">
                      Código: {categoria.codigo.toString().padStart(2, "0")}
                    </Badge>
                    <div className="text-xs text-gray-500">{categoria.subcategorias.length} subcategorías</div>
                    <div className="text-xs text-gray-500">{totalObjetos} objetos</div>
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
                {(getFilteredData() as any[]).map((subcategoria: Subcategoria) => {
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
                {(getFilteredData() as any[]).map((objeto: Objeto) => {
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
                      id={`objeto-${objeto.codigo}`}
                      key={objeto.codigo}
                      className="transition-all duration-200 hover:shadow-xl border-0 shadow-md overflow-hidden scroll-mt-24"
                    >
                      {/* Colored top accent bar using exact Excel HEX color */}
                      <div
                        className="h-1.5 w-full"
                        style={{ backgroundColor: selectedCategory?.color || getCategoryConfig(selectedCategory?.codigo || "").circleColor.replace("bg-[","").replace("]","") }}
                      />
                      <CardHeader className="pb-2 bg-gradient-to-b from-gray-50 to-white">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className="text-xs font-mono bg-white">
                                {objeto.codigo}
                              </Badge>
                              {getGeometryTypes(objeto.geometria).map((gType) => (
                                <Badge key={gType} className={`${getGeometryColor(gType)} text-xs shadow-sm`}>{gType}</Badge>
                              ))}
                            </div>
                            <CardTitle className="text-base font-bold text-gray-900 text-balance leading-tight mb-1">{objeto.nombre}</CardTitle>
                            {isDByF(objeto.codigo) && (
                              <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-semibold shadow-sm">
                                Dato Básico y Fundamental
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
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
                          <Dialog 
                            open={openDialogObjectId === objeto.codigo} 
                            onOpenChange={(open) => setOpenDialogObjectId(open ? objeto.codigo : null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                className="flex items-center gap-2 text-white hover:opacity-90 shadow-sm border-0"
                                style={{ backgroundColor: selectedCategory?.color || "#3B82F6" }}
                              >
                                <FileText className="h-4 w-4" />
                                Ver atributos ({objeto.atributos.length})
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
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    <Badge variant="outline">Código: {objeto.codigo.toString().padStart(6, "0")}</Badge>
                                    {getGeometryTypes(objeto.geometria).map((gType) => (
                                      <Badge key={gType} className={getGeometryColor(gType)}>{gType}</Badge>
                                    ))}
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
                                      return (
                                        <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                          <div className="flex items-start gap-2 mb-2">
                                            <Badge variant="outline" className="border-gray-300 shrink-0">
                                              {atributo.codigo}
                                            </Badge>
                                            <div className="flex-1">
                                              <div className="font-semibold text-sm text-gray-900">
                                                {atributo.denominacion}
                                              </div>
                                              {atributo.definicion && (
                                                <>
                                                  <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                    {atributo.definicion}
                                                  </div>
                                                  <div className="flex gap-2 mt-2">
                                                    {atributo.tipo && (
                          <Badge variant="secondary" className="text-xs">
                            Tipo: {atributo.tipo === "PERFIL DE OG" ? (
                              <a 
                                href="https://drive.google.com/drive/u/0/folders/1j68xYZ0IKxnQToZ96Wx1r2o7Lq-IlvXq" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline ml-1"
                              >
                                {atributo.tipo}
                              </a>
                            ) : (
                              atributo.tipo
                            )}
                          </Badge>
                        )}
                                                  </div>
                                                  {atributo.dominio && atributo.dominio.length > 0 && (
                                                    <div className="mt-2">
                                                      <div className="text-xs font-semibold text-gray-700 mb-1">
                                                        Valores posibles:
                                                      </div>
                                                      <div className="space-y-1 max-h-32 overflow-y-auto">
                                                        {atributo.dominio.map((valor, idx) => (
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
                                                  {atributo.observaciones && atributo.observaciones !== "-" && (
                                                    <div className="text-xs text-gray-500 mt-1 italic">
                                                      {atributo.observaciones}
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
                                onSelect={() =>
                                  window.open(
                                    `https://www.idera.gob.ar/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=${objectSlug}`,
                                    "_blank",
                                  )
                                }
                                className="cursor-pointer"
                              >
                                <ExternalLink className="h-3 w-3 mr-2" />
                                WFS
                              </DropdownMenuItem>
                              {objeto.archivo_xml && (
                                <DropdownMenuItem
                                  onSelect={() => {
                                    const link = document.createElement("a");
                                    link.href = objeto.archivo_xml || "";
                                    link.download = (objeto.archivo_xml || "").split('/').pop() || "";
                                    link.click();
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Download className="h-3 w-3 mr-2" />
                                  Catálogo (XML ISO 19110)
                                </DropdownMenuItem>
                              )}
                              {objeto.archivo_docx && (
                                <DropdownMenuItem
                                  onSelect={() => {
                                    const link = document.createElement("a");
                                    link.href = objeto.archivo_docx || "";
                                    link.download = (objeto.archivo_docx || "").split('/').pop() || "";
                                    link.click();
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Download className="h-3 w-3 mr-2" />
                                  Planilla de definición (DOCX)
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 font-semibold"
                            onClick={() =>
                              window.open(`https://catalogo-ig.labgeot.uns.edu.ar/geonetwork/srv/spa/catalog.search#/home`, "_blank")
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
          </>
          )}
        </div>
      </div>
    </div>
  )
}
