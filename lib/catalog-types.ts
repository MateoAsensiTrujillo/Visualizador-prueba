export interface Atributo {
  codigo: string
  denominacion: string
}

export interface AtributoDetalle {
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

export interface Objeto {
  nombre: string
  codigo: number
  geometria: string
  definicion: string
  atributos: Atributo[]
}

export interface Subcategoria {
  nombre: string
  codigo: number
  contenido: string
  objetos: Objeto[]
}

export interface Categoria {
  nombre: string
  codigo: number
  contenido: string
  subcategorias: Subcategoria[]
}
