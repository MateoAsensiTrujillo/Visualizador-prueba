import type { Atributo, AtributoDetalle, Categoria, Objeto, Subcategoria } from "./catalog-types"

/* -------------------------------------------------------------------------- */
/*                               Normalización                                */
/* -------------------------------------------------------------------------- */

/** Pasa a minúsculas y elimina tildes/diacríticos ("Hidrografía" -> "hidrografia"). */
export const normalize = (value: unknown = ""): string =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

/**
 * Normaliza carácter por carácter guardando la posición original de cada
 * carácter normalizado, para poder resaltar sobre el texto original.
 */
const normalizeWithMap = (text: string) => {
  let normalized = ""
  const map: number[] = []
  for (let i = 0; i < text.length; i++) {
    const n = normalize(text[i])
    for (let j = 0; j < n.length; j++) {
      normalized += n[j]
      map.push(i)
    }
  }
  return { normalized, map }
}

export interface HighlightSegment {
  text: string
  match: boolean
}

/** Divide un texto en segmentos marcando las coincidencias (insensible a tildes y mayúsculas). */
export const getHighlightSegments = (text: string, query: string): HighlightSegment[] => {
  const q = normalize(query).trim()
  if (!text || !q) return [{ text: text ?? "", match: false }]

  const { normalized, map } = normalizeWithMap(text)
  const segments: HighlightSegment[] = []
  let cursor = 0
  let from = 0
  let idx = normalized.indexOf(q, from)

  while (idx !== -1) {
    const start = map[idx]
    const end = map[idx + q.length - 1] + 1
    if (start > cursor) segments.push({ text: text.slice(cursor, start), match: false })
    segments.push({ text: text.slice(start, end), match: true })
    cursor = end
    from = idx + q.length
    idx = normalized.indexOf(q, from)
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false })
  return segments
}

/** Devuelve un fragmento del texto centrado en la primera coincidencia. */
export const makeSnippet = (text: string, query: string, radius = 70): string => {
  if (!text) return ""
  const q = normalize(query).trim()
  const { normalized, map } = normalizeWithMap(text)
  const idx = normalized.indexOf(q)
  if (idx === -1 || text.length <= radius * 2) return text.length > radius * 2 ? text.slice(0, radius * 2) + "…" : text
  const startOrig = map[idx]
  const start = Math.max(0, startOrig - radius)
  const end = Math.min(text.length, startOrig + q.length + radius)
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`
}

/* -------------------------------------------------------------------------- */
/*                                   Índice                                   */
/* -------------------------------------------------------------------------- */

/** Campo buscable: etiqueta para mostrar al usuario, texto original y su versión normalizada. */
interface Campo {
  etiqueta: string
  texto: string
  norm: string
  /** Menor = más relevante */
  peso: number
}

const campo = (etiqueta: string, texto: unknown, peso: number): Campo => {
  const t = String(texto ?? "")
  return { etiqueta, texto: t, norm: normalize(t), peso }
}

export interface ObjetoRef {
  categoria: Categoria
  subcategoria: Subcategoria
  objeto: Objeto
}

interface EntradaCategoria {
  tipo: "categoria"
  key: string
  categoria: Categoria
  campos: Campo[]
}
interface EntradaSubcategoria {
  tipo: "subcategoria"
  key: string
  categoria: Categoria
  subcategoria: Subcategoria
  campos: Campo[]
}
interface EntradaObjeto extends ObjetoRef {
  tipo: "objeto"
  key: string
  campos: Campo[]
}
interface EntradaAtributo {
  tipo: "atributo"
  key: string
  codigo: string
  nombre: string
  detalle: AtributoDetalle | null
  objetos: ObjetoRef[]
  campos: Campo[]
}

type Entrada = EntradaCategoria | EntradaSubcategoria | EntradaObjeto | EntradaAtributo

export interface SearchIndex {
  categorias: EntradaCategoria[]
  subcategorias: EntradaSubcategoria[]
  objetos: EntradaObjeto[]
  atributos: EntradaAtributo[]
}

const padCodigo = (codigo: number, length: number) => codigo.toString().padStart(length, "0")

/** Recorre el catálogo una sola vez y genera un índice plano de búsqueda. */
export const buildSearchIndex = (data: Categoria[], atributosDetalle: AtributoDetalle[]): SearchIndex => {
  const detallePorCodigo = new Map(atributosDetalle.map((a) => [a.codigo, a]))
  const atributosMap = new Map<string, { atributo: Atributo; objetos: ObjetoRef[] }>()

  const index: SearchIndex = { categorias: [], subcategorias: [], objetos: [], atributos: [] }

  for (const categoria of data) {
    index.categorias.push({
      tipo: "categoria",
      key: `c-${categoria.codigo}`,
      categoria,
      campos: [
        campo("Código", padCodigo(categoria.codigo, 2), 0),
        campo("Nombre", categoria.nombre, 1),
        campo("Contenido", categoria.contenido, 3),
      ],
    })

    for (const subcategoria of categoria.subcategorias) {
      index.subcategorias.push({
        tipo: "subcategoria",
        key: `s-${subcategoria.codigo}`,
        categoria,
        subcategoria,
        campos: [
          campo("Código", padCodigo(subcategoria.codigo, 4), 0),
          campo("Nombre", subcategoria.nombre, 1),
          campo("Contenido", subcategoria.contenido, 3),
        ],
      })

      for (const objeto of subcategoria.objetos) {
        const ref: ObjetoRef = { categoria, subcategoria, objeto }
        index.objetos.push({
          tipo: "objeto",
          key: `o-${objeto.codigo}`,
          ...ref,
          campos: [
            campo("Código", padCodigo(objeto.codigo, 6), 0),
            campo("Nombre", objeto.nombre, 1),
            campo("Definición", objeto.definicion, 3),
            campo("Geometría", objeto.geometria, 4),
          ],
        })

        for (const atributo of objeto.atributos) {
          const codigo = atributo.codigo?.trim()
          if (!codigo) continue
          const entry = atributosMap.get(codigo)
          if (entry) entry.objetos.push(ref)
          else atributosMap.set(codigo, { atributo, objetos: [ref] })
        }
      }
    }
  }

  // Atributos usados en el catálogo
  const agregarAtributo = (codigo: string, denominacion: string, objetos: ObjetoRef[]) => {
    const detalle = detallePorCodigo.get(codigo) ?? null
    const nombre = (detalle?.nombre || denominacion || codigo).trim()
    const campos: Campo[] = [campo("Código", codigo, 0), campo("Nombre", nombre, 1)]
    if (denominacion && normalize(denominacion).trim() !== normalize(nombre).trim()) {
      campos.push(campo("Denominación", denominacion, 1))
    }
    if (detalle) {
      campos.push(campo("Definición", detalle.definicion, 3))
      campos.push(campo("Tipo", detalle.tipo, 4))
      if (detalle.observaciones && detalle.observaciones !== "-") {
        campos.push(campo("Observaciones", detalle.observaciones, 4))
      }
      for (const valor of detalle.dominio ?? []) {
        campos.push(campo("Valor de dominio", valor.etiqueta, 2))
        if (valor.definicion) campos.push(campo("Definición de valor", valor.definicion, 4))
        if (valor.observaciones) campos.push(campo("Observación de valor", valor.observaciones, 4))
      }
    }
    index.atributos.push({ tipo: "atributo", key: `a-${codigo}`, codigo, nombre, detalle, objetos, campos })
  }

  for (const [codigo, { atributo, objetos }] of atributosMap) {
    agregarAtributo(codigo, atributo.denominacion, objetos)
  }
  // Atributos definidos en el diccionario pero no usados por ningún objeto
  for (const detalle of atributosDetalle) {
    if (!atributosMap.has(detalle.codigo)) agregarAtributo(detalle.codigo, detalle.nombre, [])
  }

  return index
}

/* -------------------------------------------------------------------------- */
/*                                  Búsqueda                                  */
/* -------------------------------------------------------------------------- */

export interface Coincidencia {
  etiqueta: string
  texto: string
}

export type SearchHit<E extends Entrada = Entrada> = E & {
  score: number
  /** Campo principal por el que coincidió (el más relevante) */
  coincidencia: Coincidencia
  /** Coincidencias secundarias (ej. valores de dominio) */
  otras: Coincidencia[]
}

export interface SearchResults {
  query: string
  categorias: SearchHit<EntradaCategoria>[]
  subcategorias: SearchHit<EntradaSubcategoria>[]
  objetos: SearchHit<EntradaObjeto>[]
  atributos: SearchHit<EntradaAtributo>[]
  total: number
}

export const MIN_QUERY_LENGTH = 2

const evaluar = <E extends Entrada>(entrada: E, q: string): SearchHit<E> | null => {
  let mejor: Campo | null = null
  let score = Infinity
  const otras: Coincidencia[] = []

  for (const c of entrada.campos) {
    if (!c.norm) continue
    let s: number
    if (c.norm === q) s = c.peso * 10 // coincidencia exacta
    else if (c.norm.startsWith(q)) s = c.peso * 10 + 1
    else if (c.norm.includes(q)) s = c.peso * 10 + 2
    else continue

    if (s < score) {
      if (mejor) otras.push({ etiqueta: mejor.etiqueta, texto: mejor.texto })
      score = s
      mejor = c
    } else {
      otras.push({ etiqueta: c.etiqueta, texto: c.texto })
    }
  }

  if (!mejor) return null
  return {
    ...entrada,
    score,
    coincidencia: { etiqueta: mejor.etiqueta, texto: mejor.texto },
    otras,
  } as SearchHit<E>
}

const buscarEn = <E extends Entrada>(entradas: E[], q: string, nombreDe: (e: E) => string) =>
  entradas
    .map((e) => evaluar(e, q))
    .filter((h): h is SearchHit<E> => h !== null)
    .sort((a, b) => a.score - b.score || nombreDe(a).localeCompare(nombreDe(b), "es"))

/** Busca en todo el índice. Devuelve null si la consulta es demasiado corta. */
export const searchIndex = (index: SearchIndex, query: string): SearchResults | null => {
  const q = normalize(query).trim()
  if (q.length < MIN_QUERY_LENGTH) return null

  const categorias = buscarEn(index.categorias, q, (e) => e.categoria.nombre)
  const subcategorias = buscarEn(index.subcategorias, q, (e) => e.subcategoria.nombre)
  const objetos = buscarEn(index.objetos, q, (e) => e.objeto.nombre)
  const atributos = buscarEn(index.atributos, q, (e) => e.nombre)

  return {
    query: q,
    categorias,
    subcategorias,
    objetos,
    atributos,
    total: categorias.length + subcategorias.length + objetos.length + atributos.length,
  }
}
