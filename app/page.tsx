'use client';
import { useEffect, useRef, useState } from 'react';
import { Boxes, Database, ScanEye, BrainCircuit, Activity, SlidersHorizontal, Sparkles, Cpu, GitBranch, Search, X, Plus, Check, LockKeyhole, Layers3, GitCompareArrows, BookOpen, ExternalLink, RotateCcw, Code2 } from 'lucide-react';
import ExampleRecipe from './example-recipe';
import LibraryExamples, { libraryRecipes } from './library-examples';
import { capabilities, categories, libraries, problems, phases, filterCapabilities, toggleSelection, type Filters, type Capability } from './catalog';
const icons = [Boxes, Database, ScanEye, BrainCircuit, Activity, SlidersHorizontal, Sparkles, Cpu, GitBranch];
const emptyFilters: Filters = { query: '', category: '', problem: '', phase: '' };
type ModelContext = { registerTool: (tool: Record<string, unknown>, options: {signal: AbortSignal}) => void | Promise<void> };
export default function Home() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [view, setView] = useState<'examples' | 'catalog' | 'compare'>('examples');
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Capability | null>(null);
  const [message, setMessage] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const selectedRef = useRef(selected); selectedRef.current = selected;
  const results = filterCapabilities(filters);
  const areaItems = view==='examples'?libraryRecipes:capabilities;
  const activeCategory = categories.find(c=>c.id===filters.category);
  const filtered = Object.values(filters).some(Boolean);
  useEffect(()=>{ if(detail && dialog.current && !dialog.current.open) dialog.current.showModal(); },[detail]);
  useEffect(()=>{ if(!message) return; const timer=setTimeout(()=>setMessage(''),5000); return ()=>clearTimeout(timer); },[message]);
  // WebMCP reuses the same filters and comparison state as the visible interface.
  useEffect(()=>{
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if(!context?.registerTool) return;
    const lifecycle = new AbortController();
    const settled = () => new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
    const tools = [
      {name:'filter_capabilities',title:'Filtrar capacidades',description:'Aplica filtros al catálogo visible y devuelve las capacidades que coinciden.',inputSchema:{type:'object',properties:{query:{type:'string'},category:{type:'string',enum:['',...categories.map(c=>c.id)]},problem:{type:'string',enum:['',...problems]},phase:{type:'string',enum:['',...phases]}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async(input:unknown)=>{
        if(!input || typeof input!=='object' || Array.isArray(input)) throw new Error('Se esperaba un objeto de filtros');
        const value=input as Record<string,unknown>;
        if(Object.keys(value).some(k=>!['query','category','problem','phase'].includes(k)) || Object.values(value).some(v=>typeof v!=='string')) throw new Error('Filtros inválidos');
        const next={...emptyFilters,...value} as Filters;
        if((next.category&&!categories.some(c=>c.id===next.category))||(next.problem&&!problems.includes(next.problem))||(next.phase&&!phases.includes(next.phase))) throw new Error('Filtro desconocido');
        setFilters(next);setView('catalog');await settled();return {count:filterCapabilities(next).length,capabilities:filterCapabilities(next).map(c=>({id:c.id,title:c.title}))};
      }},
      {name:'compare_libraries',title:'Comparar librerías',description:'Selecciona hasta tres librerías por ID y abre la comparación visible.',inputSchema:{type:'object',properties:{libraryIds:{type:'array',items:{type:'string',enum:libraries.map(l=>l.id)},minItems:1,maxItems:3,uniqueItems:true}},required:['libraryIds'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async(input:unknown)=>{
        const value=input as {libraryIds?:unknown};
        if(!value || Object.keys(value).some(k=>k!=='libraryIds') || !Array.isArray(value.libraryIds)||value.libraryIds.length<1||value.libraryIds.length>3||new Set(value.libraryIds).size!==value.libraryIds.length||value.libraryIds.some(id=>typeof id!=='string'||!libraries.some(l=>l.id===id))) throw new Error('Selecciona entre una y tres librerías válidas, sin duplicados');
        setSelected(value.libraryIds as string[]);setView('compare');await settled();return {libraries:value.libraryIds.map(id=>libraries.find(l=>l.id===id))};
      }},
    ];
    for(const tool of tools){try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
    return ()=>lifecycle.abort();
  },[]);
  const update = (key: keyof Filters, value: string) => setFilters(f=>({...f,[key]:value}));
  const toggle = (id: string) => {try { const next=toggleSelection(selectedRef.current,id);selectedRef.current=next;setSelected(next); }catch(error){setMessage((error as Error).message);}};
  const closeDetail = () => {dialog.current?.close();setDetail(null);};
  const choosePreset = (ids: string[]) => {setSelected(ids);setView('compare');};
  const comparison = selected.map(id=>libraries.find(l=>l.id===id)!);
  return <div className="app-shell">
    <a className="skip-link" href="#workspace">Saltar al contenido</a>
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Boxes size={23}/></span><div>IA Toolbox<small>PYTHON + C++ · I+D / INDUSTRIA</small></div></div>
      <div className="sidebar-label">ÁREAS DE TRABAJO</div>
      <nav aria-label="Áreas de la caja de herramientas">
        <button className={!filters.category&&view!=='compare'?'nav-item active':'nav-item'} onClick={()=>{update('category','');if(view==='compare')setView('catalog');}}><Layers3 size={18}/><span>{view==='examples'?'Todos los ejemplos':'Todas las capacidades'}</span><span className="nav-count">{areaItems.length}</span></button>
        {categories.map((cat,i)=>{const Icon=icons[i];return <button key={cat.id} className={filters.category===cat.id&&view!=='compare'?'nav-item active':'nav-item'} onClick={()=>{update('category',cat.id);if(view==='compare')setView('catalog');}}><Icon size={18}/><span>{cat.short}</span><span className="nav-count">{areaItems.filter(c=>c.category===cat.id).length}</span></button>;})}
      </nav>
      <div className="sidebar-bottom"><div className="private-label"><LockKeyhole size={15}/>Espacio privado</div><div className="profile"><span>LR</span><div>Lucas Rey<small>Caja de herramientas personal</small></div></div></div>
    </aside>
    <main id="workspace" className="workspace">
      <header className="topbar"><span><Code2 size={17}/> Mi caja de herramientas</span><span className="edition">Edición 03 <span>/</span> Octubre 2026</span></header>
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow">DEL PROBLEMA A LA HERRAMIENTA</div><h1>{view==='compare'?'Compara y decide':view==='examples'?(activeCategory?.name??'De la función al ejemplo'):activeCategory?.name??'Encuentra tu siguiente herramienta'}</h1><p>{view==='compare'?'Criterios concretos para elegir según tu proyecto.':view==='examples'?'Casos de uso basados en tu Industrial AI Toolbox, con código Python y C++ según su cobertura.':activeCategory?.description??'Explora capacidades, contrasta alternativas y elige por lo que necesitas resolver.'}</p></div><div className="catalog-stats"><strong>{view==='examples'?libraryRecipes.length:libraries.length}<span>{view==='examples'?'ejemplos':'librerías'}</span></strong><i/><strong>{categories.length}<span>áreas</span></strong></div></div>
        <div className="view-tabs" role="tablist" aria-label="Vistas" onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const views=['examples','catalog','compare'] as const;const next=views[(views.indexOf(view)+(e.key==='ArrowRight'?1:2))%3];setView(next);document.getElementById(next+'-tab')?.focus();}}}><button id="examples-tab" role="tab" tabIndex={view==='examples'?0:-1} aria-selected={view==='examples'} aria-controls="examples-panel" onClick={()=>setView('examples')} className={view==='examples'?'selected':''}><Code2 size={17}/>Ejemplos de tu librería</button><button id="catalog-tab" role="tab" tabIndex={view==='catalog'?0:-1} aria-selected={view==='catalog'} aria-controls="catalog-panel" onClick={()=>setView('catalog')} className={view==='catalog'?'selected':''}><Layers3 size={17}/>Explorar capacidades</button><button id="compare-tab" role="tab" tabIndex={view==='compare'?0:-1} aria-selected={view==='compare'} aria-controls="compare-panel" onClick={()=>setView('compare')} className={view==='compare'?'selected':''}><GitCompareArrows size={17}/>Comparar alternativas<span className="tab-count">{selected.length}</span></button></div>
        {view==='examples'?<LibraryExamples filters={filters} update={update} reset={()=>setFilters(emptyFilters)}/>:view==='catalog'?<section id="catalog-panel" role="tabpanel" aria-labelledby="catalog-tab">
          <div className="filter-panel"><label className="search-box"><Search size={19}/><input aria-label="Buscar capacidad o librería" type="search" placeholder="Busca una capacidad, librería o concepto…" value={filters.query} onChange={e=>update('query',e.target.value)}/></label><div className="filter-selects"><label>Tipo de problema<select aria-label="Tipo de problema" value={filters.problem} onChange={e=>update('problem',e.target.value)}><option value="">Todos los problemas</option>{problems.map(p=><option key={p}>{p}</option>)}</select></label><label>Fase del proyecto<select aria-label="Fase del proyecto" value={filters.phase} onChange={e=>update('phase',e.target.value)}><option value="">Todas las fases</option>{phases.map(p=><option key={p}>{p}</option>)}</select></label></div></div>
          <div className="result-header"><p role="status"><strong>{results.length}</strong> {results.length===1?'capacidad':'capacidades'} {filtered?'en esta selección':'para tu proyecto'}</p>{filtered?<button className="reset-button" onClick={()=>setFilters(emptyFilters)}><RotateCcw size={14}/>Limpiar filtros</button>:<span>Abre una ficha para ver alternativas y un ejemplo Python</span>}</div>
          {results.length?<div className="capability-grid">{results.map(cap=>{const i=categories.findIndex(c=>c.id===cap.category);const Icon=icons[i];return <article className="capability-card" key={cap.id}><div className="card-top"><span className={'category-icon tint-'+i}><Icon size={20}/></span><span>{categories[i].short}</span></div><h2><button className="card-title" onClick={()=>setDetail(cap)}>{cap.title}</button></h2><p className="card-description">{cap.description}</p><div className="library-list">{cap.libs.map(id=><span key={id}>{libraries.find(l=>l.id===id)!.name}</span>)}</div><div className="card-bottom"><span>{cap.phases.slice(0,2).join(' · ')}</span><button onClick={()=>setDetail(cap)} aria-label={'Ver ficha: '+cap.title}>Ficha y ejemplo <BookOpen size={15}/></button></div></article>;})}</div>:<div className="empty-state"><Search size={34}/><h2>No hay coincidencias</h2><p>Prueba otro término o amplía la fase y el tipo de problema.</p><button className="primary-button" onClick={()=>setFilters(emptyFilters)}>Restablecer catálogo</button></div>}
        </section>:<section id="compare-panel" role="tabpanel" aria-labelledby="compare-tab">
          <div className="compare-intro"><div><h2>{selected.length?'Tu selección':'Empieza con una decisión concreta'}</h2><p>Selecciona hasta 3 librerías desde las fichas o prueba una comparación habitual.</p></div>{selected.length>0&&<button className="reset-button" onClick={()=>setSelected([])}><X size={15}/>Vaciar selección</button>}</div>
          <div className="presets"><button onClick={()=>choosePreset(['pandas','polars'])}>Datos <span>pandas / Polars</span></button><button onClick={()=>choosePreset(['catboost','xgboost','lightgbm'])}>ML tabular <span>CatBoost / XGBoost / LightGBM</span></button><button onClick={()=>choosePreset(['onnx','tensorrt'])}>Inferencia <span>ONNX Runtime / TensorRT</span></button></div>
          {comparison.length>0?<><div className="table-scroll"><table className="compare-table"><caption className="sr-only">Comparación de librerías seleccionadas</caption><thead><tr><th scope="col">Criterio</th>{comparison.map(l=><th scope="col" key={l.id}><div>{l.name}<button onClick={()=>toggle(l.id)} aria-label={'Quitar '+l.name}><X size={17}/></button></div></th>)}</tr></thead><tbody>{([{label:'Para qué sirve',field:'purpose'},{label:'Cuándo elegirla',field:'choose'},{label:'Límites y decisiones',field:'limit'},{label:'Hardware habitual',field:'hardware'}] as const).map(row=><tr key={row.field}><th scope="row">{row.label}</th>{comparison.map(l=><td key={l.id}>{l[row.field]}</td>)}</tr>)}<tr><th scope="row">Capacidades relacionadas</th>{comparison.map(l=><td key={l.id}><div className="related-list">{capabilities.filter(c=>c.libs.includes(l.id)).map(c=><button key={c.id} onClick={()=>setDetail(c)}>{c.title}</button>)}</div></td>)}</tr><tr><th scope="row">Fuente primaria</th>{comparison.map(l=><td key={l.id}><a href={l.docs} target="_blank" rel="noopener noreferrer">Documentación oficial <ExternalLink size={14}/></a></td>)}</tr></tbody></table></div><div className="decision-note"><SlidersHorizontal size={20}/><p>Los criterios de elección son orientativos. Compara con tus datos, la misma evaluación y el hardware final. Algunas herramientas se complementan en un pipeline.</p></div></>:<div className="compare-empty"><GitCompareArrows size={38}/><h3>Una comparación útil empieza con tu problema</h3><p>Abre una capacidad y añade las alternativas que quieras evaluar.</p><button className="primary-button" onClick={()=>setView('catalog')}>Explorar catálogo</button></div>}
        </section>}
        <footer className="page-footer"><span>Catálogo revisado el 1 oct. 2026</span><span>{view==='examples'?'Fuente: código adjunto v0.3.1 · Estado de validación en cada ejemplo':'Fuentes oficiales en cada ficha · Criterios de elección editoriales'}</span></footer>
      </div>
    </main>
    {selected.length>0&&view==='catalog'&&<div className="compare-tray"><GitCompareArrows size={20}/><span><strong>{selected.length}/3</strong> en comparación</span><div>{comparison.map(l=><button key={l.id} onClick={()=>toggle(l.id)} aria-label={'Quitar '+l.name}>{l.name}<X size={13}/></button>)}</div><button className="primary-button" onClick={()=>setView('compare')}>Comparar</button></div>}
    {message&&!detail&&<div className="toast" role="alert">{message}<button onClick={()=>setMessage('')} aria-label="Cerrar aviso"><X size={16}/></button></div>}
    <dialog className="detail-dialog" ref={dialog} aria-labelledby="detail-title" onCancel={()=>setDetail(null)} onClose={()=>setDetail(null)} onClick={e=>{if(e.target===dialog.current)closeDetail();}}>{detail&&<div className="detail-content"><header><span className="eyebrow">{categories.find(c=>c.id===detail.category)!.name}</span><button className="icon-button" onClick={closeDetail} aria-label="Cerrar ficha"><X size={22}/></button></header><h2 id="detail-title">{detail.title}</h2><p className="detail-description">{detail.description}</p><div className="detail-tags">{detail.problems.map(p=><span key={p}>{p}</span>)}</div><div className="tip-box"><span>CRITERIO DE ELECCIÓN</span><p>{detail.tip}</p></div><ExampleRecipe key={detail.id} capabilityId={detail.id}/>{message&&<p className="inline-notice" role="alert">{message}</p>}<div className="alternatives-heading"><h3>{detail.libs.length>1?'Librerías y alternativas':'Librería de referencia'}</h3><span>{selected.length}/3 seleccionadas</span></div>{detail.libs.map((id,index)=>{const l=libraries.find(x=>x.id===id)!;const added=selected.includes(id);return <article className="library-detail" key={id}><div className="library-detail-title"><h4>{l.name}</h4>{index===0&&<span>Punto de partida</span>}</div><p>{l.purpose}</p><dl><div><dt>Elígela cuando</dt><dd>{l.choose}</dd></div><div><dt>Ten en cuenta</dt><dd>{l.limit}</dd></div><div><dt>Hardware</dt><dd>{l.hardware}</dd></div></dl><div className="library-actions"><a href={l.docs} target="_blank" rel="noopener noreferrer">Documentación oficial<ExternalLink size={14}/></a><button className={added?'add-button added':'add-button'} aria-pressed={added} onClick={()=>toggle(id)}>{added?<Check size={15}/>:<Plus size={15}/>} {added?'Añadida':'Comparar'}</button></div></article>;})}<div className="detail-end"><span>Fases: {detail.phases.join(' · ')}</span>{selected.length>0&&<button className="primary-button" onClick={()=>{closeDetail();setView('compare');}}>Ver comparación ({selected.length})</button>}</div></div>}</dialog>
  </div>;
}
