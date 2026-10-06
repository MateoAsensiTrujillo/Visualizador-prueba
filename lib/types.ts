export interface DominioValor {
  codigo: string;
  etiqueta: string;
  definicion: string;
  observaciones: string;
}

export interface Atributo {
  codigo: string;
  nombre?: string;
  denominacion: string;
  tipo: string;
  definicion: string;
  observaciones: string;
  dominio: DominioValor[] | null;
}

export interface Objeto {
  nombre: string;
  codigo: string | number;
  geometria: string;
  definicion: string;
  atributos: Atributo[];
  archivo_xml?: string;
  archivo_docx?: string;
}

export interface Subcategoria {
  nombre: string;
  codigo: string | number;
  contenido: string;
  objetos: Objeto[];
}

export interface Categoria {
  nombre: string;
  codigo: string | number;
  contenido: string;
  color: string;
  subcategorias: Subcategoria[];
}

export type NavigationLevel = "categories" | "subcategories" | "objects";

export interface SearchResult {
  categorias: (Categoria & { textoBusqueda: string })[];
  subcategorias: (Subcategoria & { parentCat: Categoria; textoBusqueda: string })[];
  objetos: (Objeto & { parentCat: Categoria; parentSub: Subcategoria; textoBusqueda: string })[];
  atributos: (Atributo & { 
    textoBusqueda: string;
    objetos: { categoria: Categoria; subcategoria: Subcategoria; objeto: Objeto }[];
  })[];
}
