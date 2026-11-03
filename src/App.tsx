import { useEffect, useMemo, useState } from 'react'
import { Activity, BookOpen, ChevronRight, CircleHelp, FileCheck2, Filter, Info, Menu, Plus, Search, ShieldCheck, Users, X } from 'lucide-react'
import { hasSupabase, supabase } from './supabase'

type Politician = { id: string; name: string; role: string; party: string | null; jurisdiction: string; term: string | null; source_url: string | null; verified: boolean }
type Evidence = { id: string; title: string; status: string; source_type: string; source_url: string; collected_at: string; politician_id: string | null }

const demoPoliticians: Politician[] = []
const demoEvidence: Evidence[] = []

const statusLabel: Record<string, string> = {
  corroborated: 'Corroborada', partial: 'Parcialmente corroborada',
  conflicting: 'Informações conflitantes', unverified: 'Não verificada', corrected: 'Corrigida'
}

export default function App() {
  const [tab, setTab] = useState('Visão geral')
  const [query, setQuery] = useState('')
  const [politicians, setPoliticians] = useState<Politician[]>(demoPoliticians)
  const [evidence, setEvidence] = useState<Evidence[]>(demoEvidence)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [showMethod, setShowMethod] = useState(false)
  const [selected, setSelected] = useState<Politician | null>(null)

  useEffect(() => {
    if (!supabase) return
    let alive = true
    async function load() {
      setLoading(true)
      const [p, e] = await Promise.all([
        supabase!.from('politicians').select('id,name,role,party,jurisdiction,term,source_url,verified').order('name'),
        supabase!.from('evidence').select('id,title,status,source_type,source_url,collected_at,politician_id').order('collected_at', { ascending: false }).limit(20)
      ])
      if (!alive) return
      if (!p.error && p.data) setPoliticians(p.data as Politician[])
      if (!e.error && e.data) setEvidence(e.data as Evidence[])
      if (p.error || e.error) setNotice('Não foi possível carregar os dados. Verifique a configuração do banco de dados.')
      setLoading(false)
    }
    load()
    return () => { alive = false }
  }, [])

  const filtered = useMemo(() => politicians.filter(p =>
    `${p.name} ${p.role} ${p.party ?? ''} ${p.jurisdiction}`.toLowerCase().includes(query.toLowerCase())
  ), [politicians, query])

  const nav = [
    { name: 'Visão geral', icon: Activity },
    { name: 'Políticos', icon: Users },
    { name: 'Fontes e evidências', icon: FileCheck2 },
    { name: 'Como funciona', icon: BookOpen }
  ]

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">R</div><div><strong>Régua Cidadã</strong><small>INFORMAÇÃO PARA DECIDIR</small></div></div>
      <div className="nav-label">PLATAFORMA</div>
      {nav.map(item => <button key={item.name} className={`nav-item ${tab === item.name ? 'active' : ''}`} onClick={() => setTab(item.name)}><item.icon size={18}/>{item.name}</button>)}
      <div className="sidebar-bottom"><ShieldCheck size={18}/><span>Independência e transparência</span></div>
    </aside>

    <main className="main">
      <header className="topbar"><button className="mobile-menu" aria-label="Menu"><Menu size={20}/></button><div className="crumb">Régua Cidadã <ChevronRight size={14}/> {tab}</div><button className="method-button" onClick={() => setShowMethod(true)}><CircleHelp size={16}/> Nossa metodologia</button></header>

      <section className="content">
        <div className="eyebrow">PLATAFORMA CÍVICA INDEPENDENTE</div>
        <h1>{tab === 'Visão geral' ? 'Informação para decidir com liberdade.' : tab}</h1>
        <p className="lead">{tab === 'Visão geral' ? 'Consulte registros, examine evidências e forme sua própria opinião. O Régua Cidadã não recomenda candidatos nem determina o que você deve pensar.' : tab === 'Políticos' ? 'Consulte registros públicos de representantes. A plataforma não presume que dados oficiais sejam completos ou imparciais.' : tab === 'Fontes e evidências' ? 'Toda afirmação relevante deve permitir rastrear sua origem, data e evidências disponíveis.' : 'Conheça as regras que protegem a independência da plataforma.'}</p>

        {!hasSupabase && <div className="setup-alert"><Info size={19}/><div><strong>Banco de dados ainda não conectado</strong><p>Esta versão começa sem políticos fictícios. Conecte um projeto Supabase e importe dados verificados para publicar registros reais.</p></div></div>}
        {notice && <div className="notice">{notice}</div>}

        {tab === 'Visão geral' && <>
          <div className="principles">
            <div><ShieldCheck/><strong>Sem recomendação de voto</strong><span>Não escolhemos lados nem indicamos candidatos.</span></div>
            <div><FileCheck2/><strong>Fontes rastreáveis</strong><span>O cidadão pode abrir e examinar os documentos.</span></div>
            <div><Users/><strong>Opinião do cidadão</strong><span>A avaliação pessoal não se confunde com fatos.</span></div>
          </div>
          <div className="section-head"><div><div className="eyebrow">DADOS DISPONÍVEIS</div><h2>Registros na plataforma</h2></div></div>
          <div className="stats"><div><span>Políticos cadastrados</span><strong>{politicians.length}</strong><small>Sem perfis fictícios</small></div><div><span>Evidências registradas</span><strong>{evidence.length}</strong><small>Com origem identificável</small></div><div><span>Fontes confirmadas</span><strong>{evidence.filter(e => e.status === 'corroborated').length}</strong><small>Com evidências independentes</small></div></div>
          <div className="empty-state"><div className="empty-icon"><BookOpen/></div><h3>Estamos preparando a base de informações</h3><p>Nenhum político foi inserido ainda. Preferimos mostrar uma base vazia a apresentar dados inventados como se fossem reais.</p><button className="text-button" onClick={() => setTab('Como funciona')}>Entenda os critérios <ChevronRight size={16}/></button></div>
        </>}

        {tab === 'Políticos' && <>
          <div className="search-row"><div className="searchbox"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nome, cargo, partido ou localidade"/></div><button className="filter-button"><Filter size={17}/> Filtros</button></div>
          <div className="results-line">{loading ? 'Carregando registros…' : `${filtered.length} registro(s)`}</div>
          {filtered.length ? <div className="politician-list">{filtered.map(p => <button className="politician-card" key={p.id} onClick={() => setSelected(p)}><div className="avatar">{p.name.split(' ').slice(0,2).map(x => x[0]).join('')}</div><div className="person"><strong>{p.name}</strong><span>{p.role} · {p.jurisdiction}</span><small>{p.party || 'Partido não informado'} {p.term ? `· ${p.term}` : ''}</small></div><ChevronRight/></button>)}</div> : <div className="empty-state compact"><Users/><h3>Nenhum registro encontrado</h3><p>Não há políticos cadastrados nesta base. A busca não cria nem inventa perfis.</p></div>}
        </>}

        {tab === 'Fontes e evidências' && <>
          <div className="evidence-intro"><Info/><p>Uma fonte oficial não é automaticamente imparcial. Sempre que possível, informações devem ser confrontadas com documentos e fontes independentes.</p></div>
          {evidence.length ? <div className="evidence-list">{evidence.map(e => <article className="evidence-card" key={e.id}><div className="evidence-top"><span className={`status ${e.status}`}>{statusLabel[e.status] || e.status}</span><span>{e.source_type}</span></div><h3>{e.title}</h3><small>Coletada em {new Date(e.collected_at).toLocaleDateString('pt-BR')}</small><a href={e.source_url} target="_blank" rel="noreferrer">Consultar fonte original <ChevronRight size={14}/></a></article>)}</div> : <div className="empty-state compact"><FileCheck2/><h3>Nenhuma evidência cadastrada</h3><p>Quando houver registros, cada item mostrará sua fonte original e o estado da verificação.</p></div>}
        </>}

        {tab === 'Como funciona' && <div className="method-grid">
          <article><span>01</span><h3>Origem visível</h3><p>Todo registro deve apontar para a fonte original, com data de publicação e coleta.</p></article>
          <article><span>02</span><h3>Cruzamento</h3><p>Buscamos evidências independentes. Ser oficial não torna uma fonte automaticamente conclusiva.</p></article>
          <article><span>03</span><h3>Incerteza explícita</h3><p>Quando faltam provas ou há divergências, isso aparece claramente. Ausência de prova não é prova de ausência.</p></article>
          <article><span>04</span><h3>Contestação</h3><p>Cidadãos e representantes podem apresentar documentos e solicitar correções, com histórico público.</p></article>
          <article><span>05</span><h3>Separação</h3><p>Fatos documentados, análises e opiniões dos cidadãos são áreas distintas.</p></article>
          <article><span>06</span><h3>Sem recomendação</h3><p>Não produzimos ranking de bons ou maus políticos nem recomendações de voto.</p></article>
        </div>}
      </section>
      <footer><span>Régua Cidadã</span><span>Independência · Rastreabilidade · Pluralidade</span></footer>
    </main>

    {showMethod && <div className="modal-backdrop" onClick={() => setShowMethod(false)}><div className="modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setShowMethod(false)}><X/></button><div className="eyebrow">COMPROMISSO EDITORIAL</div><h2>Não pedimos confiança cega.</h2><p>O Régua Cidadã deve permitir que qualquer pessoa examine as fontes, compare evidências e questione as informações. Nenhum dado é verdadeiro apenas por ser oficial.</p><button className="primary" onClick={() => {setShowMethod(false); setTab('Como funciona')}}>Ver metodologia</button></div></div>}
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}><X/></button><div className="eyebrow">REGISTRO PÚBLICO</div><h2>{selected.name}</h2><p>{selected.role} · {selected.jurisdiction}</p><p>Partido: {selected.party || 'Não informado'}</p><p>Mandato: {selected.term || 'Não informado'}</p>{selected.source_url && <a href={selected.source_url} target="_blank" rel="noreferrer">Fonte do cadastro</a>}<p className="muted">A existência deste registro não representa avaliação ou endosso.</p></div></div>}
  </div>
}