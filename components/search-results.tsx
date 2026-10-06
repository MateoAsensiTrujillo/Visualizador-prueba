"use client"

import { useEffect, useState, type ComponentType, type ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, ChevronUp, Database, FileText, Layers, MapPin, SearchX } from "lucide-react"
import type { Categoria, Subcategoria } from "@/lib/catalog-types"
import {
  getHighlightSegments,
  makeSnippet,
  type Coincidencia,
  type ObjetoRef,
  type SearchResults as SearchResultsData,
} from "@/lib/search-utils"

interface CategoryConfig {
  color: string
  circleColor: string
  hoverColor: string
  icon: ComponentType<{ className?: string }>
}

interface SearchResultsProps {
  results: SearchResultsData
  rawQuery: string
  getCategoryConfig: (codigo: number) => CategoryConfig
  getGeometryType: (geometria: string) => string
  getGeometryColor: (geometria: string) => string
  isDByF: (codigo: number) => boolean
  onSelectCategoria: (categoria: Categoria) => void
  onSelectSubcategoria: (categoria: Categoria, subcategoria: Subcategoria) => void
  onSelectObjeto: (ref: ObjetoRef, atributoCodigo?: string) => void
}

const PAGE_SIZE = 24
const OBJETOS_POR_ATRIBUTO = 8

/* ---------------------------------- Helpers --------------------------------- */

export function Highlight({ text, query }: { text: string; query: string }) {
  const segments = getHighlightSegments(text, query)
  return (
    <>
      {segments.map((s, i) =>
        s.match ? (
          <mark key={i} className="bg-yellow-200 text-inherit rounded-sm px-0.5">
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  )
}

/** Muestra en qué campo coincidió la búsqueda cuando no es el nombre o el código. */
function MatchInfo({ coincidencia, otras, query }: { coincidencia: Coincidencia; otras: Coincidencia[]; query: string }) {
  const esPrincipal = coincidencia.etiqueta === "Nombre" || coincidencia.etiqueta === "Código"
  const extras = otras.filter((o) => o.etiqueta !== "Nombre" && o.etiqueta !== "Código")
  const mostrar = esPrincipal ? extras.slice(0, 1) : [coincidencia]
  if (mostrar.length === 0) return null

  return (
    <div className="mt-2 space-y-1">
      {mostrar.map((m, i) => (
        <div key={i} className="text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold text-gray-700">{m.etiqueta}: </span>
          <Highlight text={makeSnippet(m.texto, query)} query={query} />
        </div>
      ))}
      {!esPrincipal && extras.length > 1 && (
        <div className="text-[11px] text-gray-400">+{extras.length - 1} coincidencias más</div>
      )}
    </div>
  )
}

function Breadcrumb({ parts }: { parts: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-[11px] uppercase tracking-wide text-gray-500">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {p}
        </span>
      ))}
    </div>
  )
}

function Section({
  id,
  title,
  count,
  icon: Icon,
  children,
  expanded,
  onToggle,
}: {
  id: string
  title: string
  count: number
  icon: ComponentType<{ className?: string }>
  children: ReactNode
  expanded: boolean
  onToggle: () => void
}) {
  if (count === 0) return null
  return (
    <section id={id} className="scroll-mt-40 space-y-3">
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <Icon className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <Badge variant="secondary">{count}</Badge>
      </div>
      {children}
      {count > PAGE_SIZE && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={onToggle} className="bg-white">
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" /> Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" /> Mostrar todos ({count})
              </>
            )}
          </Button>
        </div>
      )}
    </section>
  )
}

/* --------------------------------- Component -------------------------------- */

export function SearchResults({
  results,
  rawQuery,
  getCategoryConfig,
  getGeometryType,
  getGeometryColor,
  isDByF,
  onSelectCategoria,
  onSelectSubcategoria,
  onSelectObjeto,
}: SearchResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedAtributos, setExpandedAtributos] = useState<Set<string>>(new Set())

  // Reiniciar expansiones cuando cambia la consulta
  useEffect(() => {
    setExpandedSections(new Set())
    setExpandedAtributos(new Set())
  }, [results.query])

  const toggle = (setter: typeof setExpandedSections, key: string) =>
    setter((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const limit = <T,>(items: T[], key: string) => (expandedSections.has(key) ? items : items.slice(0, PAGE_SIZE))
  const q = rawQuery

  if (results.total === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-white/70">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-semibold text-gray-700">No se encontraron resultados</p>
          <p className="text-sm text-gray-500 mt-1">
            Probá con otro término para &quot;<span className="font-medium">{rawQuery}</span>&quot;.
          </p>
        </CardContent>
      </Card>
    )
  }

  const resumen = [
    { id: "res-categorias", label: "Categorías", count: results.categorias.length },
    { id: "res-subcategorias", label: "Subcategorías", count: results.subcategorias.length },
    { id: "res-objetos", label: "Objetos", count: results.objetos.length },
    { id: "res-atributos", label: "Atributos", count: results.atributos.length },
  ]

  return (
    <div className="space-y-8">
      {/* Resumen */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-gray-700 mr-2">
          <span className="font-semibold">{results.total}</span> resultados para &quot;
          <span className="font-semibold">{rawQuery}</span>&quot;
        </p>
        {resumen
          .filter((r) => r.count > 0)
          .map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => document.getElementById(r.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              {r.label} · {r.count}
            </button>
          ))}
      </div>

      {/* Categorías */}
      <Section
        id="res-categorias"
        title="Categorías"
        count={results.categorias.length}
        icon={Database}
        expanded={expandedSections.has("categorias")}
        onToggle={() => toggle(setExpandedSections, "categorias")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {limit(results.categorias, "categorias").map((hit) => {
            const config = getCategoryConfig(hit.categoria.codigo)
            const Icon = config.icon
            return (
              <button
                key={hit.key}
                type="button"
                onClick={() => onSelectCategoria(hit.categoria)}
                className={`${config.color} ${config.hoverColor} text-left border-2 rounded-lg p-4 shadow-sm transition-all duration-200 hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${config.circleColor} rounded-full p-2 shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm">
                      <Highlight text={hit.categoria.nombre} query={q} />
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs bg-white/50 border-gray-400">
                      Código: <Highlight text={hit.categoria.codigo.toString().padStart(2, "0")} query={q} />
                    </Badge>
                  </div>
                </div>
                <MatchInfo coincidencia={hit.coincidencia} otras={hit.otras} query={q} />
              </button>
            )
          })}
        </div>
      </Section>

      {/* Subcategorías */}
      <Section
        id="res-subcategorias"
        title="Subcategorías"
        count={results.subcategorias.length}
        icon={Layers}
        expanded={expandedSections.has("subcategorias")}
        onToggle={() => toggle(setExpandedSections, "subcategorias")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {limit(results.subcategorias, "subcategorias").map((hit) => {
            const config = getCategoryConfig(hit.categoria.codigo)
            return (
              <button
                key={hit.key}
                type="button"
                onClick={() => onSelectSubcategoria(hit.categoria, hit.subcategoria)}
                className={`${config.color} ${config.hoverColor} text-left border-2 rounded-lg p-4 shadow-sm transition-all duration-200 hover:scale-[1.02]`}
              >
                <Breadcrumb parts={[hit.categoria.nombre]} />
                <div className="flex items-center gap-3 mt-2">
                  <div className={`${config.circleColor} rounded-full p-2 shrink-0`}>
                    <Layers className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm">
                      <Highlight text={hit.subcategoria.nombre} query={q} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs bg-white/50 border-gray-400">
                        Código: <Highlight text={hit.subcategoria.codigo.toString().padStart(4, "0")} query={q} />
                      </Badge>
                      <span className="text-xs opacity-80">{hit.subcategoria.objetos.length} objetos</span>
                    </div>
                  </div>
                </div>
                <MatchInfo coincidencia={hit.coincidencia} otras={hit.otras} query={q} />
              </button>
            )
          })}
        </div>
      </Section>

      {/* Objetos */}
      <Section
        id="res-objetos"
        title="Objetos"
        count={results.objetos.length}
        icon={MapPin}
        expanded={expandedSections.has("objetos")}
        onToggle={() => toggle(setExpandedSections, "objetos")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {limit(results.objetos, "objetos").map((hit) => {
            const geometryType = getGeometryType(hit.objeto.geometria)
            const config = getCategoryConfig(hit.categoria.codigo)
            return (
              <Card
                key={hit.key}
                role="button"
                tabIndex={0}
                onClick={() => onSelectObjeto(hit)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelectObjeto(hit)}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 border-gray-200 hover:border-indigo-300"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`${config.circleColor} h-2.5 w-2.5 rounded-full shrink-0`} />
                    <Breadcrumb parts={[hit.categoria.nombre, hit.subcategoria.nombre]} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Código: <Highlight text={hit.objeto.codigo.toString().padStart(6, "0")} query={q} />
                    </Badge>
                    <Badge className={`${getGeometryColor(geometryType)} text-xs`}>{geometryType}</Badge>
                    {isDByF(hit.objeto.codigo) && (
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs">DByF</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base leading-tight mt-2">
                    <Highlight text={hit.objeto.nombre} query={q} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <MatchInfo coincidencia={hit.coincidencia} otras={hit.otras} query={q} />
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-600">
                    <FileText className="h-3.5 w-3.5" />
                    Ver atributos ({hit.objeto.atributos.length})
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Section>

      {/* Atributos */}
      <Section
        id="res-atributos"
        title="Atributos"
        count={results.atributos.length}
        icon={FileText}
        expanded={expandedSections.has("atributos")}
        onToggle={() => toggle(setExpandedSections, "atributos")}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {limit(results.atributos, "atributos").map((hit) => {
            const abierto = expandedAtributos.has(hit.codigo)
            const objetos = abierto ? hit.objetos : hit.objetos.slice(0, OBJETOS_POR_ATRIBUTO)
            return (
              <Card key={hit.key} className="border-2 border-gray-200 bg-white">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="border-gray-300 shrink-0 font-mono">
                      <Highlight text={hit.codigo} query={q} />
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base leading-tight">
                        <Highlight text={hit.nombre} query={q} />
                      </CardTitle>
                      {hit.detalle?.tipo && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Tipo: {hit.detalle.tipo}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {hit.detalle?.definicion && hit.coincidencia.etiqueta !== "Definición" && (
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{hit.detalle.definicion}</p>
                  )}
                  <MatchInfo coincidencia={hit.coincidencia} otras={hit.otras} query={q} />

                  <div className="mt-3 border-t border-gray-100 pt-3">
                    {hit.objetos.length === 0 ? (
                      <p className="text-xs italic text-gray-400">No está asignado a ningún objeto del catálogo.</p>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Usado en {hit.objetos.length} objeto{hit.objetos.length !== 1 ? "s" : ""}:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {objetos.map((ref) => (
                            <button
                              key={ref.objeto.codigo}
                              type="button"
                              onClick={() => onSelectObjeto(ref, hit.codigo)}
                              title={`${ref.categoria.nombre} › ${ref.subcategoria.nombre}`}
                              className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs text-indigo-700 transition-colors hover:bg-indigo-100"
                            >
                              {ref.objeto.nombre}
                            </button>
                          ))}
                          {hit.objetos.length > OBJETOS_POR_ATRIBUTO && (
                            <button
                              type="button"
                              onClick={() => toggle(setExpandedAtributos, hit.codigo)}
                              className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                            >
                              {abierto ? "Ver menos" : `+${hit.objetos.length - OBJETOS_POR_ATRIBUTO} más`}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
