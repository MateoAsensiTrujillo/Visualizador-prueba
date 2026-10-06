import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, MapPin, Database, ChevronRight, Hash } from "lucide-react";
import { highlight } from "@/lib/search-utils";
import { SearchResult, Categoria, Subcategoria, Objeto, Atributo } from "@/lib/types";

interface SearchResultsProps {
  results: SearchResult;
  searchTerm: string;
  onNavigateToCategory: (cat: Categoria) => void;
  onNavigateToSubcategory: (sub: Subcategoria, cat: Categoria) => void;
  onNavigateToObject: (obj: Objeto, sub: Subcategoria, cat: Categoria) => void;
  getCategoryConfig: (codigo: string | number) => any;
  getGeometryTypes: (geometria: string) => string[];
  getGeometryColor: (gType: string) => string;
  isDByF: (codigo: string | number) => boolean;
}

export function SearchResults({
  results,
  searchTerm,
  onNavigateToCategory,
  onNavigateToSubcategory,
  onNavigateToObject,
  getCategoryConfig,
  getGeometryTypes,
  getGeometryColor,
  isDByF,
}: SearchResultsProps) {
  const total = results.categorias.length + results.subcategorias.length + results.objetos.length + results.atributos.length;

  if (total === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No se encontraron resultados para "{searchTerm}"
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-gray-600 font-medium pb-2 border-b">
        {total} resultados para '{searchTerm}'
      </div>

      {results.categorias.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Clases ({results.categorias.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {results.categorias.map((categoria) => {
              const config = getCategoryConfig(categoria.codigo);
              const IconComponent = config.icon || Database;
              return (
                <div
                  key={categoria.codigo}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 border-2 rounded-lg p-4 min-h-[130px] flex flex-col justify-center items-center text-center shadow-sm bg-white ${config.borderColor}`}
                  onClick={() => onNavigateToCategory(categoria)}
                >
                  <div className={`rounded-full p-3 mb-2 shadow-md ${config.circleColor}`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <div className="font-bold text-sm leading-tight mb-2 text-gray-800">
                    {highlight(categoria.nombre, searchTerm)}
                  </div>
                  <Badge variant="outline" className="mb-1 text-xs bg-white border-gray-300">
                    Código: {highlight(categoria.codigo.toString().padStart(2, "0"), searchTerm)}
                  </Badge>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {results.subcategorias.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Subclases ({results.subcategorias.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {results.subcategorias.map((subcategoria) => {
              const config = getCategoryConfig(subcategoria.parentCat.codigo);
              return (
                <div
                  key={subcategoria.codigo}
                  className={`${config.color} ${config.hoverColor} cursor-pointer transition-all duration-200 hover:scale-105 border-2 rounded-lg p-4 min-h-[100px] flex flex-col justify-center items-center text-center shadow-sm`}
                  onClick={() => onNavigateToSubcategory(subcategoria, subcategoria.parentCat)}
                >
                  <div className={`${config.circleColor} rounded-full p-2 mb-2`}>
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                  <div className="font-bold text-sm leading-tight mb-2">
                    {highlight(subcategoria.nombre, searchTerm)}
                  </div>
                  <Badge variant="outline" className="mb-1 text-xs bg-white/50 border-gray-400">
                    Código: {highlight(subcategoria.codigo.toString().padStart(4, "0"), searchTerm)}
                  </Badge>
                  <div className="text-xs font-semibold text-gray-700 mt-2 border-t pt-1 w-full">
                    {subcategoria.parentCat.nombre}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {results.objetos.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Objetos ({results.objetos.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.objetos.map((objeto) => {
              const config = getCategoryConfig(objeto.parentCat.codigo);
              return (
                <div
                  key={objeto.codigo}
                  className="cursor-pointer transition-all duration-200 hover:shadow-md border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col"
                  onClick={() => onNavigateToObject(objeto, objeto.parentSub, objeto.parentCat)}
                >
                  <div className="h-1.5 w-full" style={{ backgroundColor: config.circleColor.replace("bg-[","").replace("]","") }} />
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-xs font-mono bg-gray-50">
                        {highlight(objeto.codigo.toString(), searchTerm)}
                      </Badge>
                      {getGeometryTypes(objeto.geometria).map((gType) => (
                        <Badge key={gType} className={`${getGeometryColor(gType)} text-[10px] px-1 py-0 shadow-sm`}>{gType}</Badge>
                      ))}
                      {isDByF(objeto.codigo) && (
                        <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] px-1 py-0 shadow-sm border-0">
                          DByF
                        </Badge>
                      )}
                    </div>
                    <div className="font-bold text-base text-gray-900 mb-1 leading-tight">
                      {highlight(objeto.nombre, searchTerm)}
                    </div>
                    <div className="text-xs text-gray-500 mb-3 flex items-center flex-wrap gap-1 mt-auto pt-2">
                      <span className="truncate max-w-[120px]">{objeto.parentCat.nombre}</span>
                      <ChevronRight className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[120px] font-medium">{objeto.parentSub.nombre}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {results.atributos.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Atributos ({results.atributos.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.atributos.map((atributo) => (
              <div
                key={atributo.codigo}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col"
              >
                <div className="flex items-start gap-2 mb-2">
                  <Badge variant="secondary" className="font-mono text-xs shrink-0">
                    {highlight(atributo.codigo, searchTerm)}
                  </Badge>
                  <div className="font-bold text-sm text-gray-900">
                    {highlight(atributo.denominacion || atributo.nombre || "", searchTerm)}
                  </div>
                </div>
                {atributo.definicion && (
                  <div className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {highlight(atributo.definicion, searchTerm)}
                  </div>
                )}
                <div className="mt-auto">
                  <div className="text-xs font-semibold text-gray-500 mb-2">
                    Usado en {atributo.objetos.length} objeto{atributo.objetos.length !== 1 ? 's' : ''}:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {atributo.objetos.slice(0, 5).map(({ objeto, subcategoria, categoria }, idx) => (
                      <Button
                        key={`${atributo.codigo}-${objeto.codigo}-${idx}`}
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2 py-0 border-gray-300 text-gray-600 hover:text-blue-600"
                        onClick={() => onNavigateToObject(objeto, subcategoria, categoria)}
                      >
                        {objeto.nombre}
                      </Button>
                    ))}
                    {atributo.objetos.length > 5 && (
                      <Badge variant="outline" className="text-[10px] h-6 flex items-center bg-gray-50">
                        +{atributo.objetos.length - 5} más
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
