'use client';
import { useState } from 'react';
import { Check, Code2, Copy, ExternalLink } from 'lucide-react';
import recipes from './examples.json';

type Recipe = { title: string; dependencies: string; inputs: string; output: string; note: string; code: string; source: string; validation: string };
export default function ExampleRecipe({ capabilityId }: { capabilityId: string }) {
  const recipe = (recipes as Record<string, Recipe>)[capabilityId];
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle');
  if (!recipe) return null;
  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(recipe.code);
      setCopyState('copied');
    } catch { setCopyState('manual'); }
  };
  return <details className="example-recipe">
    <summary><Code2 size={19}/><span>Ejemplo Python<small>{recipe.title}</small></span><span className="recipe-expand">Abrir</span></summary>
    <div className="recipe-body">
      <p className="recipe-validation">{recipe.validation === 'executed' ? <><Check size={15}/>Ejecutado con datos de ejemplo</> : <><Code2 size={15}/>Sintaxis validada · requiere el entorno indicado</>}</p>
      <dl className="recipe-meta"><div><dt>Dependencias</dt><dd>{recipe.dependencies}</dd></div><div><dt>Entrada</dt><dd>{recipe.inputs}</dd></div><div><dt>Salida esperada</dt><dd>{recipe.output}</dd></div></dl>
      <div className="recipe-code"><div className="recipe-codebar"><span>PYTHON</span><button onClick={copy} aria-label="Copiar código Python">{copyState === 'copied' ? <Check size={15}/> : <Copy size={15}/>} {copyState === 'copied' ? 'Copiado' : 'Copiar código'}</button></div><pre tabIndex={0} aria-label={'Código Python: '+recipe.title}><code>{recipe.code}</code></pre></div>
      <p className="copy-feedback" role="status">{copyState === 'copied' ? 'Código copiado al portapapeles.' : copyState === 'manual' ? 'No se pudo copiar automáticamente. Selecciona el código y cópialo con Ctrl+C o ⌘C.' : ''}</p>
      <p className="recipe-note">{recipe.note}</p>
      <a className="recipe-source" href={recipe.source} target="_blank" rel="noopener noreferrer">Referencia del ejemplo<ExternalLink size={14}/></a>
    </div>
  </details>;
}
