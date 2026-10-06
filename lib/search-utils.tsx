import React from 'react';

export const normalize = (s: string = "") =>
  s.toString()
   .normalize("NFD")
   .replace(/[\u0300-\u036f]/g, "")
   .toLowerCase()
   .trim();

export const highlight = (text: string, q: string) => {
  if (!q) return text;
  
  const normalizedText = normalize(text);
  const normalizedQuery = normalize(q);
  
  const index = normalizedText.indexOf(normalizedQuery);
  if (index === -1) return text;
  
  const originalMatch = text.slice(index, index + q.length);
  const before = text.slice(0, index);
  const after = text.slice(index + q.length);
  
  return (
    <>
      {before}
      <mark className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">{originalMatch}</mark>
      {after}
    </>
  );
};
