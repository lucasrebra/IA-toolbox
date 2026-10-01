'use client';
import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, Code2, Copy, RotateCcw, Search, X } from 'lucide-react';
import data from './library-examples.json';
import { categories, normalize, phases, problems, type Filters } from './catalog';

export type Language = '' | 'python' | 'cpp';
type Variant = { code: string; dependencies: string; install: string; sources: {api:string;signature:string;file:string;line:number}[]; validation:string; validationNote:string };
export type Recipe = {id:string;category:string;title:string;description:string;problems:string[];phases:string[];inputs:string;output:string;choose:string;limit:string;python:Variant;cpp:Variant|null};
export const libraryRecipes = data as Recipe[];
export function filterRecipes(filters: Filters, language: Language = '') {
  const terms = normalize(filters.query).split(/\s+/).filter(Boolean);
  return libraryRecipes.filter(r => (!filters.category || r.category===filters.category)
    && (!filters.problem || r.problems.includes(filters.problem))
    && (!filters.phase || r.phases.includes(filters.phase))
    && (!language || language==='python' || !!r.cpp)
    && terms.every(term=>normalize([r.title,r.description,r.choose,r.limit,r.inputs,r.output,...r.problems,...r.phases,...r.python.sources.map(s=>s.api),...(r.cpp?.sources.map(s=>s.api)??[])].join(' ')).includes(term)));
}
function VariantCode({variant,language}:{variant:Variant;language:'python'|'cpp'}) {
  const [copy,setCopy]=useState('');
  const label=language==='python'?'Python':'C++';
  async function copyCode(){try{await navigator.clipboard.writeText(variant.code);setCopy('Código copiado');}catch{setCopy('No se pudo copiar. Selecciona el código para copiarlo manualmente.');}}
  return <div className="library-variant">
    <div className="validation-line"><span className={variant.validation==='executed'?'validated':'reviewed'}>{variant.validation==='executed'?<Check size={14}/>:<Code2 size={14}/>} {variant.validation==='executed'?'Ejecutado':variant.validation==='syntax'?'Sintaxis comprobada':'Fuente revisada'}</span><p>{variant.validationNote}</p></div>
    <dl className="recipe-meta"><div><dt>Dependencias</dt><dd>{variant.dependencies}</dd></div></dl>
    <details className="setup-detail"><summary>Preparar y ejecutar {label}</summary><p>Desde la raíz de la librería descomprimida. Guarda el código como {language==='python'?'ejemplo.py':'ejemplo.cpp'}.</p><pre><code>{variant.install}{language==='python'?'\npython ejemplo.py':''}</code></pre>{language==='cpp'&&variant.dependencies.includes('OpenCV')&&<p>Añade al final de <code>cpp/CMakeLists.txt</code> las líneas <code>add_executable(ejemplo ../ejemplo.cpp)</code> y <code>target_link_libraries(ejemplo PRIVATE aitoolbox_cv)</code>. Ejecuta los comandos anteriores y después <code>./build/ejemplo</code>. Requiere el SDK OpenCV.</p>}</details>
    <div className="recipe-code"><div className="recipe-codebar"><span>{label} · {language==='python'?'ejemplo.py':'ejemplo.cpp'}</span><button onClick={copyCode} aria-label={'Copiar ejemplo '+label}><Copy size={14}/>Copiar código</button></div><pre tabIndex={0} aria-label={'Código '+label}><code>{variant.code}</code></pre></div>
    <p className="copy-feedback" role="status">{copy}</p>
    <details className="source-detail"><summary>Funciones y archivos de la versión 0.3.1</summary>{variant.sources.map(s=><div key={s.file+s.api} className="api-source"><strong>{s.api}</strong><code>{s.signature}</code><small>{s.file}:{s.line}</small></div>)}</details>
  </div>;
}
export default function LibraryExamples({filters,update,reset}:{filters:Filters;update:(key:keyof Filters,value:string)=>void;reset:()=>void}) {
  const [language,setLanguage]=useState<Language>('');
  const [detail,setDetail]=useState<Recipe|null>(null);
  const [codeLanguage,setCodeLanguage]=useState<'python'|'cpp'>('python');
  const dialog=useRef<HTMLDialogElement>(null);
  const results=filterRecipes(filters,language);
  const filtered=Object.values(filters).some(Boolean)||!!language;
  useEffect(()=>{if(detail&&dialog.current&&!dialog.current.open)dialog.current.showModal();},[detail]);
  const close=()=>{dialog.current?.close();setDetail(null);};
  const clear=()=>{reset();setLanguage('');};
  const open=(r:Recipe)=>{setCodeLanguage(language==='cpp'?'cpp':'python');setDetail(r);};
  return <section id="examples-panel" role="tabpanel" aria-labelledby="examples-tab">
    <div className="library-banner"><Code2 size={26}/><div><strong>Industrial AI Toolbox · v0.3.1</strong><p>32 casos basados en el código de tu librería. 16 incluyen C++; uno usa el adaptador opcional OpenCV. Python cubre más funciones y adaptadores.</p></div></div>
    <details className="library-start"><summary>Cómo usar estos ejemplos en tu equipo</summary><ol><li>Descomprime <strong>Industrial_AI_Toolbox_Python_CPP_v0.3.1</strong> y abre una terminal en su carpeta raíz.</li><li>En Python, crea un entorno virtual (<code>python -m venv .venv</code>) y actívalo. Abre una ficha y ejecuta su comando de instalación.</li><li>Copia el ejemplo a <code>ejemplo.py</code> o <code>ejemplo.cpp</code>. La ficha explica sus datos, dependencias y cómo ejecutarlo.</li><li>Los ejemplos con archivos o modelos externos son plantillas: prepara esas entradas antes de ejecutarlos.</li></ol><p>La web muestra código y resultados esperados. La ejecución se realiza en tu equipo.</p></details>
    <div className="filter-panel library-filters"><label className="search-box"><Search size={19}/><input aria-label="Buscar ejemplos de la librería" type="search" placeholder="Busca función, caso industrial o concepto…" value={filters.query} onChange={e=>update('query',e.target.value)}/></label><div className="filter-selects"><label>Tipo de problema<select aria-label="Tipo de problema" value={filters.problem} onChange={e=>update('problem',e.target.value)}><option value="">Todos los problemas</option>{problems.map(p=><option key={p}>{p}</option>)}</select></label><label>Fase del proyecto<select aria-label="Fase del proyecto" value={filters.phase} onChange={e=>update('phase',e.target.value)}><option value="">Todas las fases</option>{phases.map(p=><option key={p}>{p}</option>)}</select></label><label>Lenguaje<select aria-label="Lenguaje de los ejemplos" value={language} onChange={e=>setLanguage(e.target.value as Language)}><option value="">Todos</option><option value="python">Python</option><option value="cpp">C++ disponible</option></select></label></div></div>
    <div className="result-header"><p role="status"><strong>{results.length}</strong> {results.length===1?'ejemplo':'ejemplos'} {filtered?'en esta selección':'de tu librería'}</p>{filtered?<button className="reset-button" onClick={clear}><RotateCcw size={14}/>Limpiar filtros</button>:<span>Abre un caso para ver código y resultados</span>}</div>
    {results.length?<div className="capability-grid library-grid">{results.map(r=><article className="capability-card library-card" key={r.id}><div className="card-top"><span className="category-icon"><Code2 size={19}/></span><span>{categories.find(c=>c.id===r.category)?.short}</span></div><h2><button className="card-title" onClick={()=>open(r)}>{r.title}</button></h2><p className="card-description">{r.description}</p><div className="library-list"><span>Python</span>{r.cpp&&<span>C++{r.cpp.validation==='source'?' · opcional':''}</span>}</div><div className="card-bottom"><span>{r.phases.slice(0,2).join(' · ')}</span><button onClick={()=>open(r)} aria-label={'Ver ejemplo: '+r.title}>Ver código<BookOpen size={15}/></button></div></article>)}</div>:<div className="empty-state"><Search size={34}/><h2>No hay ejemplos con estos filtros</h2><p>Amplía la categoría, el problema, la fase o el lenguaje.</p><button className="primary-button" onClick={clear}>Restablecer ejemplos</button></div>}
    <dialog className="detail-dialog library-dialog" ref={dialog} aria-labelledby="library-detail-title" onCancel={()=>setDetail(null)} onClose={()=>setDetail(null)} onClick={e=>{if(e.target===dialog.current)close();}}>{detail&&<div className="detail-content"><header><span className="eyebrow">TU LIBRERÍA · {categories.find(c=>c.id===detail.category)?.short}</span><button className="icon-button" onClick={close} aria-label="Cerrar ejemplo"><X size={22}/></button></header><h2 id="library-detail-title">{detail.title}</h2><p className="detail-description">{detail.description}</p><div className="tip-box"><span>CUÁNDO ELEGIRLO</span><p>{detail.choose}</p></div><dl className="recipe-meta"><div><dt>Entradas</dt><dd>{detail.inputs}</dd></div><div><dt>Resultado esperado</dt><dd>{detail.output}</dd></div></dl><div className="recipe-note"><strong>Alcance y límites</strong><p>{detail.limit}</p></div><div className="language-switch" role="group" aria-label="Lenguaje del código"><button aria-pressed={codeLanguage==='python'} onClick={()=>setCodeLanguage('python')}>Python</button>{detail.cpp?<button aria-pressed={codeLanguage==='cpp'} onClick={()=>setCodeLanguage('cpp')}>C++</button>:<span>Sin ejemplo C++ para esta función en v0.3.1</span>}</div><VariantCode key={detail.id+codeLanguage} variant={codeLanguage==='cpp'&&detail.cpp?detail.cpp:detail.python} language={codeLanguage}/></div>}</dialog>
  </section>;
}
