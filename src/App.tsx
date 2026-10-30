import { FormEvent, useEffect, useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import {
  ArrowRight, BedDouble, Bot, BriefcaseBusiness, Calculator, Check, ChevronDown,
  CircleDollarSign, CloudSun, Compass, Download, ExternalLink, Heart, Hotel,
  Luggage, MapPin, Menu, MessageCircle, Moon, Plane, Plus, Save, ShieldCheck,
  Sparkles, Sun, Ticket, TrainFront, Trash2, Umbrella, Users, X, Zap,
} from 'lucide-react'
import {
  type BudgetPlan, type Expense, type Flight, type Hotel as HotelType, type SavedTrip,
  type Train, type TransportMode, type TripForm, type TripPlan, assistantReply, buildTrip,
  defaultForm, guideFor, liveLinks, money, packingItems, refreshBudget,
} from './core'

type View = 'home' | 'planner' | 'saved' | 'surprise' | 'companion' | 'tools'
type FlightFilter = 'best' | 'cheapest' | 'fastest' | 'nonstop'
type TrainSort = 'recommended' | 'cheapest' | 'fastest'

const savedKey = 'tripgenius-saved-trips-v1'
const expenseKey = 'tripgenius-expenses-v1'

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch { return fallback }
}

function App() {
  const [view, setView] = useState<View>('home')
  const [form, setForm] = useState<TripForm>(defaultForm)
  const [plan, setPlan] = useState<TripPlan | null>(null)
  const [saved, setSaved] = useState<SavedTrip[]>(() => readStored(savedKey, []))
  const [expenses, setExpenses] = useState<Expense[]>(() => readStored(expenseKey, []))
  const [dark, setDark] = useState(() => localStorage.getItem('tripgenius-theme') === 'dark')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { localStorage.setItem(savedKey, JSON.stringify(saved)) }, [saved])
  useEffect(() => { localStorage.setItem(expenseKey, JSON.stringify(expenses)) }, [expenses])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('tripgenius-theme', dark ? 'dark' : 'light')
  }, [dark])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 3800)
    return () => window.clearTimeout(timer)
  }, [notice])

  const updateForm = <K extends keyof TripForm>(key: K, value: TripForm[K]) => setForm((current) => ({ ...current, [key]: value }))

  const planTrip = (event?: FormEvent, submitted = form) => {
    event?.preventDefault()
    if (!submitted.from.trim() || !submitted.to.trim()) { setError('Please enter both a starting city and a destination.'); return }
    if (submitted.from.trim().toLowerCase() === submitted.to.trim().toLowerCase()) { setError('Choose a different destination from your starting city.'); return }
    if (new Date(submitted.returnDate) < new Date(submitted.departure)) { setError('Your return date must be on or after your departure date.'); return }
    setError('')
    const generated = buildTrip(submitted)
    setPlan(generated)
    setView('planner')
    setNotice(`Your ${generated.days}-day ${generated.guide.city} plan is ready. All prices are transparent estimates.`)
  }

  const changePlan = (changes: Partial<TripPlan>) => setPlan((current) => current ? refreshBudget({ ...current, ...changes }) : current)

  const savePlan = () => {
    if (!plan) return
    const record: SavedTrip = { ...plan, savedAt: new Date().toISOString() }
    setSaved((current) => [record, ...current.filter((trip) => trip.id !== record.id)])
    setNotice('Trip saved locally in this browser.')
  }

  const loadTrip = (trip: SavedTrip) => {
    setForm(trip.form); setPlan(trip); setView('planner'); setNotice('Saved trip loaded. You can edit it and regenerate anytime.')
  }

  const deleteTrip = (id: string) => {
    setSaved((current) => current.filter((trip) => trip.id !== id))
    setNotice('Saved trip removed from this browser.')
  }

  const nav = (next: View) => { setView(next); setMenuOpen(false) }

  return <div className="min-h-screen bg-[#f6f8fb] text-ink transition-colors dark:bg-[#0b1422] dark:text-slate-100">
    <Header view={view} nav={nav} dark={dark} setDark={setDark} savedCount={saved.length} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    {notice && <div className="toast" role="status"><Check size={17} />{notice}</div>}
    <main>
      {view === 'home' && <Home form={form} updateForm={updateForm} planTrip={planTrip} nav={nav} />}
      {view === 'planner' && <Planner form={form} updateForm={updateForm} planTrip={planTrip} error={error} plan={plan} changePlan={changePlan} savePlan={savePlan} />}
      {view === 'saved' && <SavedTrips saved={saved} loadTrip={loadTrip} deleteTrip={deleteTrip} nav={nav} />}
      {view === 'surprise' && <Surprise form={form} setForm={setForm} planTrip={planTrip} />}
      {view === 'companion' && <Companion guide={plan?.guide ?? guideFor(form.to)} />}
      {view === 'tools' && <Tools plan={plan} expenses={expenses} setExpenses={setExpenses} />}
    </main>
    <footer className="border-t border-slate-200 bg-white py-9 dark:border-slate-800 dark:bg-[#0f1b2c]">
      <div className="page-shell flex flex-col gap-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between dark:text-slate-400">
        <div><span className="font-bold text-ocean">TripGenius AI</span> · Designed for thoughtful, transparent travel planning.</div>
        <div className="flex items-center gap-2"><ShieldCheck size={16} /> Local-first: saved trips and preferences stay in this browser.</div>
      </div>
    </footer>
  </div>
}

function Header({ view, nav, dark, setDark, savedCount, menuOpen, setMenuOpen }: {
  view: View; nav: (view: View) => void; dark: boolean; setDark: (value: boolean) => void; savedCount: number; menuOpen: boolean; setMenuOpen: (value: boolean) => void
}) {
  const links: Array<[View, string, React.ReactNode]> = [
    ['planner', 'Plan a trip', <Compass size={16} />], ['surprise', 'Surprise me', <Sparkles size={16} />],
    ['companion', 'Travel companion', <Bot size={16} />], ['tools', 'Travel tools', <BriefcaseBusiness size={16} />],
  ]
  return <header className="sticky top-0 z-40 border-b border-white/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0b1422]/90">
    <div className="page-shell flex h-[72px] items-center justify-between gap-3">
      <button onClick={() => nav('home')} className="brand" aria-label="Go to TripGenius AI home"><span className="brand-mark"><Compass size={21} /></span><span>TripGenius <i>AI</i></span></button>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
        {links.map(([target, label, icon]) => <button key={target} className={`nav-link ${view === target ? 'active' : ''}`} onClick={() => nav(target)}>{icon}{label}</button>)}
      </nav>
      <div className="flex items-center gap-2">
        <button className="icon-button" onClick={() => setDark(!dark)} title="Toggle colour mode" aria-label="Toggle colour mode">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        <button className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-teal-50 md:flex dark:bg-slate-800 dark:text-white" onClick={() => nav('saved')}><Heart size={16} className="text-rose-500" /> Saved {savedCount > 0 && <span className="rounded-full bg-white px-1.5 text-xs dark:bg-slate-700">{savedCount}</span>}</button>
        <button className="icon-button lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open navigation">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </div>
    {menuOpen && <nav className="page-shell mobile-menu lg:hidden">{links.map(([target, label, icon]) => <button key={target} onClick={() => nav(target)}>{icon}{label}</button>)}<button onClick={() => nav('saved')}><Heart size={16} />Saved trips ({savedCount})</button></nav>}
  </header>
}

function Home({ form, updateForm, planTrip, nav }: { form: TripForm; updateForm: <K extends keyof TripForm>(key: K, value: TripForm[K]) => void; planTrip: (event?: FormEvent) => void; nav: (view: View) => void }) {
  return <>
    <section className="hero-section">
      <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
      <div className="page-shell relative grid items-center gap-12 py-16 lg:grid-cols-[1.06fr_.94fr] lg:py-24">
        <div className="max-w-2xl">
          <div className="eyebrow"><Sparkles size={15} /> Personal travel intelligence, without the guesswork</div>
          <h1 className="hero-title">Every great journey begins with a <em>better plan.</em></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">Build a practical trip in minutes: transparent price estimates, room-aware stays, and a day-by-day itinerary made for your pace.</p>
          <div className="mt-8 flex flex-wrap gap-3"><button className="primary-button" onClick={() => nav('planner')}>Start planning <ArrowRight size={18} /></button><button className="secondary-button" onClick={() => nav('surprise')}><Sparkles size={17} /> Surprise me</button></div>
          <div className="mt-10 flex flex-wrap gap-5 text-sm font-medium text-slate-600 dark:text-slate-300"><span className="inline-flex items-center gap-2"><Check className="text-ocean" size={17} /> No account needed</span><span className="inline-flex items-center gap-2"><Check className="text-ocean" size={17} /> Estimates clearly labelled</span><span className="inline-flex items-center gap-2"><Check className="text-ocean" size={17} /> Saved locally</span></div>
        </div>
        <div className="route-visual" aria-label="Stylised travel route">
          <div className="route-card route-card-top"><span className="mini-label">YOUR JOURNEY</span><b>{form.from || 'Mumbai'} <ArrowRight size={16} /> {form.to || 'Goa'}</b><small>thoughtfully designed</small></div>
          <div className="globe"><span className="continent c-one"/><span className="continent c-two"/><span className="continent c-three"/><MapPin className="pin pin-one"/><MapPin className="pin pin-two"/></div>
          <div className="route-line"><Plane size={17} /></div>
          <div className="route-card route-card-bottom"><span className="mini-label">SMARTER STAYS</span><b>Right room, right budget</b><div className="mini-bars"><i/><i/><i/></div></div>
        </div>
      </div>
    </section>
    <section className="relative -mt-4 pb-14"><div className="page-shell"><div className="planner-card shadow-soft"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-700"><div><p className="section-kicker">YOUR NEXT ESCAPE</p><h2 className="text-xl font-bold">Start with the essentials</h2></div><span className="estimate-pill"><CircleDollarSign size={15} /> Transparent estimates</span></div><form className="grid gap-4 p-5 lg:grid-cols-12" onSubmit={planTrip}>
      <Field label="From" icon={<MapPin size={17} />} className="lg:col-span-3"><input value={form.from} onChange={(e) => updateForm('from', e.target.value)} placeholder="Starting city" /></Field>
      <Field label="To" icon={<MapPin size={17} />} className="lg:col-span-3"><input value={form.to} onChange={(e) => updateForm('to', e.target.value)} placeholder="Destination city" /></Field>
      <Field label="Departure" className="lg:col-span-2"><input type="date" value={form.departure} onChange={(e) => updateForm('departure', e.target.value)} /></Field>
      <Field label="Return" className="lg:col-span-2"><input type="date" value={form.returnDate} onChange={(e) => updateForm('returnDate', e.target.value)} /></Field>
      <Field label="Travellers" icon={<Users size={17} />} className="lg:col-span-2"><span className="field-static">{form.adults + form.children} guests · {form.requestedRooms} room</span></Field>
      <div className="lg:col-span-12 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700"><p className="text-sm text-slate-500 dark:text-slate-400">Choose preferences, dates, transport and hotel details in the full planner.</p><button className="primary-button w-full sm:w-auto" type="submit">Plan my trip <Sparkles size={18} /></button></div>
    </form></div></div></section>
    <section className="page-shell py-12"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="section-kicker">A MORE CONSIDERED WAY TO TRAVEL</p><h2 className="section-title">Useful decisions, all in one place.</h2></div><button className="text-link" onClick={() => nav('planner')}>Explore the planner <ArrowRight size={16}/></button></div><div className="grid gap-5 md:grid-cols-3"><Feature icon={<Calculator />} title="Budgets that add up" text="Transport, rooms, food, local travel, activities, shopping, and a buffer—calculated together." /><Feature icon={<BedDouble />} title="Room logic that fits" text="Family and group recommendations never intentionally exceed the room’s stated occupancy." /><Feature icon={<Bot />} title="A local travel companion" text="Get practical, offline answers about packing, safety, food, and moving around." /></div></section>
    <section className="page-shell pb-16"><div className="tips-band"><div><p className="section-kicker text-teal-100">OFFLINE, WITH HONESTY</p><h2 className="text-2xl font-bold text-white">Planning data should be useful, not misleading.</h2><p>TripGenius uses illustrative sample fares offline. When you are ready to book, jump to a live search provider to verify prices and availability.</p></div><CloudSun size={82} className="hidden opacity-80 md:block" /></div></section>
  </>
}

function Planner({ form, updateForm, planTrip, error, plan, changePlan, savePlan }: { form: TripForm; updateForm: <K extends keyof TripForm>(key: K, value: TripForm[K]) => void; planTrip: (event?: FormEvent) => void; error: string; plan: TripPlan | null; changePlan: (changes: Partial<TripPlan>) => void; savePlan: () => void }) {
  return <>
    <section className="page-shell pt-10"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="section-kicker">TRIP WORKSPACE</p><h1 className="section-title">Design your best route.</h1><p className="mt-2 text-slate-500 dark:text-slate-400">A complete offline planning workspace. Sample prices are estimates—not live booking inventory.</p></div>{plan && <button onClick={savePlan} className="secondary-button"><Save size={17} /> Save this trip</button>}</div><form className="planner-form" onSubmit={planTrip}><div className="form-grid">
      <Field label="Starting city" icon={<MapPin size={17} />}><input value={form.from} onChange={(e) => updateForm('from', e.target.value)} required /></Field><Field label="Destination city" icon={<MapPin size={17} />}><input value={form.to} onChange={(e) => updateForm('to', e.target.value)} required /></Field>
      <Field label="Departure date"><input type="date" value={form.departure} onChange={(e) => updateForm('departure', e.target.value)} required /></Field><Field label="Return date"><input type="date" value={form.returnDate} min={form.departure} onChange={(e) => updateForm('returnDate', e.target.value)} required /></Field>
      <Field label="Adults"><select value={form.adults} onChange={(e) => updateForm('adults', Number(e.target.value))}>{[1,2,3,4,5,6,7,8].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Children"><select value={form.children} onChange={(e) => updateForm('children', Number(e.target.value))}>{[0,1,2,3,4,5,6].map((x) => <option key={x}>{x}</option>)}</select></Field>
      {form.children > 0 && <Field label="Children’s ages (for your reference)"><input value={form.childAges} onChange={(e) => updateForm('childAges', e.target.value)} placeholder="e.g. 4, 9" /></Field>}
      <Field label="Rooms requested"><select value={form.requestedRooms} onChange={(e) => updateForm('requestedRooms', Number(e.target.value))}>{[1,2,3,4,5,6].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Total budget (₹)"><input type="number" min="0" value={form.budget} onChange={(e) => updateForm('budget', Number(e.target.value))} /></Field>
      <Field label="Preferred departure"><select value={form.departureTime} onChange={(e) => updateForm('departureTime', e.target.value)}>{['Any time','Morning (05–11)','Afternoon (12–16)','Evening (17–21)'].map((x)=><option key={x}>{x}</option>)}</select></Field><Field label="Preferred arrival"><select value={form.arrivalTime} onChange={(e) => updateForm('arrivalTime', e.target.value)}>{['Any time','Morning (05–11)','Afternoon (12–16)','Evening (17–21)'].map((x)=><option key={x}>{x}</option>)}</select></Field>
      <Field label="Travel preference"><select value={form.preference} onChange={(e) => updateForm('preference', e.target.value as TripForm['preference'])}>{['Beach','Culture','Nature','Food','Adventure','Relaxed'].map((x)=><option key={x}>{x}</option>)}</select></Field><Field label="Hotel category"><select value={form.hotelCategory} onChange={(e) => updateForm('hotelCategory', e.target.value as TripForm['hotelCategory'])}>{['Any','Budget','Comfort','Premium'].map((x)=><option key={x}>{x}</option>)}</select></Field><Field label="Meal preference"><select value={form.mealPreference} onChange={(e) => updateForm('mealPreference', e.target.value)}>{['Vegetarian & local','Non-vegetarian & local','Vegan-friendly','No preference'].map((x)=><option key={x}>{x}</option>)}</select></Field>
    </div>{error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}<div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">Offline mode uses illustrative supplier names, routes, prices, ratings and facilities to make the planning tools work. It does not claim live availability or booking confirmation.</p><button className="primary-button" type="submit"><Sparkles size={18} /> Plan my trip</button></div></form></section>
    {plan ? <TripResults plan={plan} changePlan={changePlan} savePlan={savePlan} /> : <section className="page-shell py-12"><div className="empty-state"><Compass size={36}/><h2>Ready when you are.</h2><p>Enter your details above and select “Plan my trip” to generate options, a budget, and a daily itinerary.</p></div></section>}
  </>
}

function TripResults({ plan, changePlan, savePlan }: { plan: TripPlan; changePlan: (changes: Partial<TripPlan>) => void; savePlan: () => void }) {
  const [section, setSection] = useState<'transport' | 'hotels' | 'itinerary' | 'budget'>('transport')
  const links = liveLinks(plan.form)
  return <section className="page-shell pb-16 pt-9"><div className="destination-banner" style={{ background: plan.guide.color }}><div><span className="banner-pill"><Sparkles size={14} /> Your tailored trip</span><h2>{plan.form.from} <ArrowRight size={25} /> {plan.guide.city}</h2><p>{plan.days} days · {plan.nights} nights · {plan.form.adults + plan.form.children} travellers · {plan.roomPlan.rooms} room{plan.roomPlan.rooms === 1 ? '' : 's'}</p></div><div className="hidden text-right sm:block"><span className="text-xs uppercase tracking-[.15em] text-white/70">Estimated trip total</span><strong>{money(plan.budget.total)}</strong><span className="text-sm text-white/85">{money(plan.budget.perPerson)} per person</span></div></div>
    <div className="results-tabs">{([['transport','Transport'],['hotels','Hotel finder'],['itinerary','Itinerary'],['budget','Budget']] as const).map(([key,label]) => <button key={key} onClick={() => setSection(key)} className={section === key ? 'selected' : ''}>{key === 'transport' ? <Plane size={16}/> : key === 'hotels' ? <Hotel size={16}/> : key === 'itinerary' ? <Compass size={16}/> : <Calculator size={16}/>} {label}</button>)}</div>
    {section === 'transport' && <TransportPanel plan={plan} changePlan={changePlan} links={links} />}
    {section === 'hotels' && <HotelsPanel plan={plan} changePlan={changePlan} links={links} />}
    {section === 'itinerary' && <ItineraryPanel plan={plan} links={links} />}
    {section === 'budget' && <BudgetPanel plan={plan} links={links} savePlan={savePlan} />}
  </section>
}

function TransportPanel({ plan, changePlan, links }: { plan: TripPlan; changePlan: (changes: Partial<TripPlan>) => void; links: ReturnType<typeof liveLinks> }) {
  const [mode, setMode] = useState<TransportMode>(plan.transportMode)
  const [flightFilter, setFlightFilter] = useState<FlightFilter>('best')
  const [trainSort, setTrainSort] = useState<TrainSort>('recommended')
  useEffect(() => setMode(plan.transportMode), [plan.transportMode])
  const timeMatches = (time: string, filter: string) => { const hour = Number(time.split(':')[0]); return filter === 'Any time' || (filter.startsWith('Morning') && hour >= 5 && hour < 12) || (filter.startsWith('Afternoon') && hour >= 12 && hour < 17) || (filter.startsWith('Evening') && hour >= 17 && hour < 22) }
  const flightItems = useMemo(() => plan.flights.filter((item) => (flightFilter !== 'nonstop' || item.stops === 0) && timeMatches(item.departure, plan.form.departureTime) && timeMatches(item.arrival, plan.form.arrivalTime)).sort((a,b) => flightFilter === 'cheapest' ? a.fare - b.fare : flightFilter === 'fastest' ? a.minutes-b.minutes : 0), [plan, flightFilter])
  const trainItems = useMemo(() => [...plan.trains].sort((a,b) => trainSort === 'cheapest' ? a.fare-b.fare : trainSort === 'fastest' ? a.minutes-b.minutes : 0), [plan, trainSort])
  const selectMode = (next: TransportMode) => { setMode(next); changePlan({ transportMode: next }) }
  return <div className="result-panel"><div className="panel-heading"><div><p className="section-kicker">ROUTE OPTIONS</p><h3>Choose how you would like to travel</h3><p>All fares below are illustrative round-trip estimates per traveller. Verify live prices before booking.</p></div><div className="live-links"><a href={links.flights} target="_blank" rel="noreferrer">Check live flights <ExternalLink size={14}/></a><a href={links.trains} target="_blank" rel="noreferrer">Search train schedules <ExternalLink size={14}/></a></div></div><div className="transport-toggle"><button className={mode === 'flight' ? 'active' : ''} onClick={() => selectMode('flight')}><Plane size={18}/> Flights</button><button className={mode === 'train' ? 'active' : ''} onClick={() => selectMode('train')}><TrainFront size={18}/> Trains</button></div>
    {mode === 'flight' ? <><div className="filter-row"><span>Filter flights:</span>{(['best','cheapest','fastest','nonstop'] as FlightFilter[]).map((item) => <button key={item} onClick={() => setFlightFilter(item)} className={flightFilter === item ? 'on' : ''}>{item === 'best' ? 'Best overall' : item === 'nonstop' ? 'Non-stop' : item[0].toUpperCase()+item.slice(1)}</button>)}</div><div className="space-y-3">{flightItems.length ? flightItems.map((flight) => <FlightCard key={flight.id} item={flight} selected={plan.selectedFlight === flight.id} onSelect={() => changePlan({ selectedFlight: flight.id })}/>) : <p className="no-match">No illustrated option matches both time preferences. Change the form preferences to see every sample route.</p>}</div></> : <><div className="filter-row"><span>Sort trains:</span>{(['recommended','cheapest','fastest'] as TrainSort[]).map((item) => <button key={item} onClick={() => setTrainSort(item)} className={trainSort === item ? 'on' : ''}>{item[0].toUpperCase()+item.slice(1)}</button>)}</div><p className="small-disclaimer"><TrainFront size={15}/> Schedules, fares, classes, and seats are sample planning data—not live railway availability.</p><div className="space-y-3">{trainItems.map((train) => <TrainCard key={train.id} item={train} selected={plan.selectedTrain === train.id} onSelect={() => changePlan({ selectedTrain: train.id })}/>)}</div></>}
  </div>
}

function FlightCard({ item, selected, onSelect }: { item: Flight; selected: boolean; onSelect: () => void }) { return <article className={`option-card ${selected ? 'chosen' : ''}`}><div className="option-brand"><span className="transport-icon"><Plane size={18}/></span><div><b>{item.airline}</b><small>{item.number}</small></div></div><div className="journey-times"><b>{item.departure}</b><span>{item.duration}<i>{item.stops === 0 ? 'Non-stop' : `${item.stops} stop`}</i></span><b>{item.arrival}</b></div><div className="option-detail"><small>{item.baggage}</small><strong>{money(item.fare)}</strong><em>per traveller · estimate</em></div><button onClick={onSelect} className={selected ? 'selected-button' : 'choose-button'}>{selected ? <><Check size={16}/> Selected</> : 'Select'}</button></article> }
function TrainCard({ item, selected, onSelect }: { item: Train; selected: boolean; onSelect: () => void }) { return <article className={`option-card train-option ${selected ? 'chosen' : ''}`}><div className="option-brand"><span className="transport-icon train"><TrainFront size={18}/></span><div><b>{item.name}</b><small>{item.number} · {item.fromStation} → {item.toStation}</small></div></div><div className="journey-times"><b>{item.departure}</b><span>{item.duration}<i>Illustrative schedule</i></span><b>{item.arrival}</b></div><div className="option-detail"><small>{item.classes.map((x)=>x.label).join(' · ')}</small><strong>from {money(Math.min(...item.classes.map((x)=>x.fare)))}</strong><em>per traveller · estimate</em></div><button onClick={onSelect} className={selected ? 'selected-button' : 'choose-button'}>{selected ? <><Check size={16}/> Selected</> : 'Select'}</button></article> }

function HotelsPanel({ plan, changePlan, links }: { plan: TripPlan; changePlan: (changes: Partial<TripPlan>) => void; links: ReturnType<typeof liveLinks> }) {
  const [category, setCategory] = useState<'Any' | 'Budget' | 'Comfort' | 'Premium'>('Any')
  const [rating, setRating] = useState(0)
  const [amenity, setAmenity] = useState('Any')
  const [sort, setSort] = useState<'recommended'|'lowest'>('recommended')
  const hotels = useMemo(() => plan.hotels.filter((hotel) => (category === 'Any' || hotel.category === category) && hotel.rating >= rating && (amenity === 'Any' || hotel.facilities.some((item) => item.toLowerCase().includes(amenity.toLowerCase())))).sort((a,b) => sort === 'lowest' ? a.total-b.total : 0), [plan.hotels, category, rating, amenity, sort])
  return <div className="result-panel"><div className="panel-heading"><div><p className="section-kicker">SMART HOTEL FINDER</p><h3>Comfort that actually fits your group</h3><p>{plan.roomPlan.note} {plan.nights} night{plan.nights === 1 ? '' : 's'} · no room is suggested above its stated maximum occupancy.</p></div><a className="external-button" href={links.hotels} target="_blank" rel="noreferrer">Compare live hotels <ExternalLink size={15}/></a></div><div className="hotel-filters"><label>Category<select value={category} onChange={(e)=>setCategory(e.target.value as typeof category)}>{['Any','Budget','Comfort','Premium'].map((x)=><option key={x}>{x}</option>)}</select></label><label>Rating<select value={rating} onChange={(e)=>setRating(Number(e.target.value))}><option value={0}>Any rating</option><option value={4}>4.0+ sample rating</option><option value={4.5}>4.5+ sample rating</option></select></label><label>Amenity<select value={amenity} onChange={(e)=>setAmenity(e.target.value)}><option>Any</option><option>Wi-Fi</option><option>Breakfast</option><option>Pool</option></select></label><label>Sort<select value={sort} onChange={(e)=>setSort(e.target.value as typeof sort)}><option value="recommended">Recommended</option><option value="lowest">Lowest total</option></select></label></div><p className="small-disclaimer"><Hotel size={15}/> Hotel names, guest ratings, room rates and facilities are illustrative data. Confirm all details with a live provider before you book.</p><div className="grid gap-4 lg:grid-cols-3">{hotels.map((hotel)=><HotelCard key={hotel.id} item={hotel} selected={hotel.id===plan.selectedHotel} onSelect={() => changePlan({ selectedHotel: hotel.id })}/>)}</div>{!hotels.length && <p className="no-match">No sample hotel meets all filters. Adjust rating, amenities, or category.</p>}</div>
}

function HotelCard({ item, selected, onSelect }: { item: HotelType; selected: boolean; onSelect: () => void }) { return <article className={`hotel-card ${selected ? 'chosen' : ''}`}><div className="hotel-cover"><span>{item.category}</span><Hotel size={26}/></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h4>{item.name}</h4><p className="mt-1 text-sm text-slate-500 dark:text-slate-400"><MapPin size={14}/>{item.area}</p></div><b className="rating">★ {item.rating}</b></div><div className="hotel-details"><p><BedDouble size={15}/><span><b>{item.roomType}</b><small>Max {item.maxOccupancy} per room · {item.rooms} room{item.rooms === 1 ? '' : 's'}</small></span></p><p><MapPin size={15}/>{item.attractionDistance}</p><p><Umbrella size={15}/>{item.facilities.slice(0,3).join(' · ')}</p></div><div className="mt-4 flex items-end justify-between"><div><small className="text-slate-500 dark:text-slate-400">{money(item.rate)} / room / night</small><strong className="block text-lg">{money(item.total)}</strong><em className="text-xs text-slate-500 dark:text-slate-400">{item.checkIn} check-in · {item.checkOut} checkout</em></div><button className={selected ? 'selected-button' : 'choose-button'} onClick={onSelect}>{selected ? <Check size={16}/> : 'Select'}</button></div></div></article> }

function ItineraryPanel({ plan, links }: { plan: TripPlan; links: ReturnType<typeof liveLinks> }) { return <div className="result-panel"><div className="panel-heading"><div><p className="section-kicker">DAY-BY-DAY PLAN</p><h3>{plan.days} days that leave room to breathe</h3><p>Distances, opening hours and weather are not live in this offline edition. Confirm them before setting out.</p></div><a className="external-button" href={links.maps} target="_blank" rel="noreferrer">Open destination map <ExternalLink size={15}/></a></div><div className="itinerary-grid">{plan.itinerary.map((day) => <article className="day-card" key={day.day}><div className="day-badge"><span>DAY</span><b>{day.day}</b><small>{day.date}</small></div><div className="day-items"><ItineraryItem icon={<Sun size={16}/>} title="Morning" text={day.morning}/><ItineraryItem icon={<Compass size={16}/>} title="Afternoon" text={day.afternoon}/><ItineraryItem icon={<Moon size={16}/>} title="Evening" text={day.evening}/><ItineraryItem icon={<Luggage size={16}/>} title="Food" text={day.food}/><ItineraryItem icon={<TrainFront size={16}/>} title="Getting around" text={day.transport}/></div><div className="day-cost">Around <b>{money(day.estimated)}</b><span>for all travellers</span></div></article>)}</div><div className="safety-box"><ShieldCheck size={20}/><div><b>Local note for {plan.guide.city}</b><p>{plan.guide.safety} Keep your documents, transfer details, and emergency contacts available offline.</p></div></div></div> }
function ItineraryItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="itinerary-item"><span>{icon}</span><div><b>{title}</b><p>{text}</p></div></div> }

function BudgetPanel({ plan, links, savePlan }: { plan: TripPlan; links: ReturnType<typeof liveLinks>; savePlan: () => void }) { const exportPdf = () => exportTripPDF(plan); const budget = plan.budget; const selectedFlight = plan.flights.find((x)=>x.id===plan.selectedFlight); const selectedTrain = plan.trains.find((x)=>x.id===plan.selectedTrain); return <div className="result-panel"><div className="panel-heading"><div><p className="section-kicker">COMPLETE TRIP BUDGET</p><h3>Every estimated cost, in context</h3><p>Transport uses your selected {plan.transportMode} option. All values are planning estimates in INR.</p></div><div className="flex flex-wrap gap-2"><button className="secondary-button" onClick={savePlan}><Save size={16}/> Save</button><button className="primary-button" onClick={exportPdf}><Download size={16}/> Download PDF</button></div></div><div className="budget-layout"><div className="budget-lines"><BudgetLine name={`Selected ${plan.transportMode} (${plan.transportMode==='flight' ? selectedFlight?.airline : selectedTrain?.name})`} value={budget.transport}/><BudgetLine name={`Hotel · ${plan.nights} night${plan.nights===1?'':'s'}`} value={budget.hotel}/><BudgetLine name="Food" value={budget.food}/><BudgetLine name="Local transportation" value={budget.local}/><BudgetLine name="Activities" value={budget.activities}/><BudgetLine name="Shopping allowance" value={budget.shopping}/><BudgetLine name="Emergency reserve (8%)" value={budget.emergency}/></div><div className="budget-total"><span>TOTAL TRIP ESTIMATE</span><strong>{money(budget.total)}</strong><p>{money(budget.perPerson)} per traveller</p><div className={budget.remaining >= 0 ? 'remaining positive' : 'remaining negative'}>{budget.remaining >= 0 ? 'Within budget' : 'Over budget'}<b>{money(Math.abs(budget.remaining))}</b></div><small>Budget provided: {money(plan.form.budget)}</small></div></div><div className="comparison-strip"><div><Zap size={18}/><span><b>Cheapest transport</b><small>{money(Math.min(...plan.flights.map(x=>x.fare)))} flight estimate / traveller</small></span></div><div><Plane size={18}/><span><b>Fastest sample flight</b><small>{Math.min(...plan.flights.map(x=>x.minutes))} minutes listed duration</small></span></div><div><Sparkles size={18}/><span><b>Best overall</b><small>Selected based on your preferences and editable choices</small></span></div></div><div className="external-note"><ExternalLink size={18}/><p>Ready to verify? Use live providers for live prices, hotel availability and actual bookings. <a href={links.flights} target="_blank" rel="noreferrer">Flights</a> · <a href={links.hotels} target="_blank" rel="noreferrer">Hotels</a> · <a href={links.maps} target="_blank" rel="noreferrer">Maps</a></p></div></div> }
function BudgetLine({ name, value }: { name: string; value: number }) { return <div><span>{name}</span><b>{money(value)}</b></div> }

function SavedTrips({ saved, loadTrip, deleteTrip, nav }: { saved: SavedTrip[]; loadTrip: (trip: SavedTrip)=>void; deleteTrip: (id:string)=>void; nav:(view:View)=>void }) { return <section className="page-shell min-h-[70vh] py-12"><div className="mb-8"><p className="section-kicker">LOCAL TRIP LIBRARY</p><h1 className="section-title">Saved trips</h1><p className="mt-2 text-slate-500 dark:text-slate-400">Stored only in this browser. Clearing browser data will remove them.</p></div>{saved.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{saved.map((trip)=><article className="saved-card" key={trip.id} style={{ '--trip-color': trip.guide.color } as React.CSSProperties}><div className="saved-card-cover"><span>{trip.days} days</span><Compass size={26}/></div><div className="p-5"><p className="section-kicker">{new Date(trip.savedAt).toLocaleDateString('en-IN')}</p><h2>{trip.form.from} <ArrowRight size={18}/> {trip.guide.city}</h2><p>{trip.form.adults + trip.form.children} travellers · {trip.nights} nights · {money(trip.budget.total)} estimate</p><div className="mt-5 flex gap-2"><button className="choose-button flex-1" onClick={()=>loadTrip(trip)}>Open / edit</button><button className="icon-button danger" title="Delete saved trip" onClick={()=>deleteTrip(trip.id)}><Trash2 size={17}/></button></div></div></article>)}</div> : <div className="empty-state"><Heart size={36}/><h2>No saved trips yet.</h2><p>Plan a trip and choose “Save this trip” to keep it here.</p><button className="primary-button" onClick={()=>nav('planner')}>Plan a trip <ArrowRight size={17}/></button></div>}</section> }

function Surprise({ form, setForm, planTrip }: { form: TripForm; setForm: (form: TripForm)=>void; planTrip: (event?:FormEvent, submitted?:TripForm)=>void }) { const [start,setStart]=useState(form.from); const [budget,setBudget]=useState(form.budget); const [days,setDays]=useState(4); const [travellers,setTravellers]=useState(form.adults+form.children); const [preference,setPreference]=useState(form.preference); const options = useMemo(() => [{ city:'Goa', appeal:'Beach days and breezy evenings', start:38000, tag:'Beach' },{city:'Jaipur', appeal:'Palaces, crafts and memorable food', start:30000,tag:'Culture'},{city:'Kerala',appeal:'Backwaters and slow nature',start:42000,tag:'Nature'},{city:'Manali',appeal:'Highland air and adventure',start:44000,tag:'Adventure'},{city:'Delhi',appeal:'History and a food-fuelled city break',start:32000,tag:'Food'}].map((x)=>({...x, estimate: Math.round(x.start*(days/4)*(travellers/2))})).filter((x)=>x.estimate<=budget*1.12).sort((a,b)=>(a.tag===preference? -1:0)-(b.tag===preference? -1:0) || a.estimate-b.estimate),[budget,days,travellers,preference]); const choose=(city:string)=>{ const departure=form.departure; const date=new Date(`${departure}T12:00:00`); date.setDate(date.getDate()+days-1); const next={...form,from:start,to:city,budget,adults:travellers,children:0,preference,departure,returnDate:date.toISOString().slice(0,10)};setForm(next);planTrip(undefined,next)}; return <section className="page-shell py-12"><div className="surprise-hero"><Sparkles size={31}/><div><p className="section-kicker text-teal-100">DESTINATION DISCOVERY</p><h1>Let a little chance plan the next chapter.</h1><p>Tell us your boundaries. We’ll surface transparent, illustrative ideas that sit in them.</p></div></div><div className="surprise-controls"><Field label="Starting location"><input value={start} onChange={(e)=>setStart(e.target.value)} /></Field><Field label="Total budget (₹)"><input type="number" value={budget} onChange={(e)=>setBudget(Number(e.target.value))}/></Field><Field label="Number of days"><select value={days} onChange={(e)=>setDays(Number(e.target.value))}>{[2,3,4,5,6,7].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Travellers"><select value={travellers} onChange={(e)=>setTravellers(Number(e.target.value))}>{[1,2,3,4,5,6].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Travel preference"><select value={preference} onChange={(e)=>setPreference(e.target.value as TripForm['preference'])}>{['Beach','Culture','Nature','Food','Adventure','Relaxed'].map(x=><option key={x}>{x}</option>)}</select></Field></div><p className="small-disclaimer mb-5"><Sparkles size={15}/> Suggestions are based on offline sample budgets. Costs are not live quotes.</p><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{options.map((option)=>{const guide=guideFor(option.city);return <article className="surprise-card" key={option.city}><div style={{background:guide.color}}><span>{option.tag}</span><MapPin size={28}/></div><div className="p-5"><h2>{option.city}</h2><p>{option.appeal}</p><div className="mt-5 flex items-end justify-between"><span><small>Illustrative total</small><b>{money(option.estimate)}</b></span><button className="choose-button" onClick={()=>choose(option.city)}>Plan this <ArrowRight size={15}/></button></div></div></article>})}</div>{!options.length&&<div className="empty-state"><CircleDollarSign size={36}/><h2>Nothing quite fits yet.</h2><p>Try a longer budget or fewer travellers to see our offline sample ideas.</p></div>}</section> }

function Companion({ guide }: { guide: ReturnType<typeof guideFor> }) { const [messages,setMessages]=useState([{role:'bot',text:`Hello! I’m your local TripGenius assistant for ${guide.city}. I run on practical offline travel guidance—not a live AI or booking system. What would you like to know?`}]); const [question,setQuestion]=useState(''); const ask=(event:FormEvent)=>{event.preventDefault();const q=question.trim();if(!q)return;setMessages((current)=>[...current,{role:'user',text:q},{role:'bot',text:assistantReply(q,guide)}]);setQuestion('')}; const prompts=['What should I pack?','How can I travel safely?','How do I save money?','What food should I try?'];return <section className="page-shell min-h-[72vh] py-12"><div className="companion-layout"><div className="companion-aside"><span className="assistant-avatar"><Bot size={30}/></span><p className="section-kicker">LOCAL GUIDE ASSISTANT</p><h1>Practical answers for the road.</h1><p>Rule-based, local travel knowledge with no fake API connection. It can help with packing, safety, food, local transport, sightseeing and budgets.</p><div className="prompt-list">{prompts.map((prompt)=><button key={prompt} onClick={()=>{setQuestion(prompt)}}>{prompt}<ArrowRight size={15}/></button>)}</div></div><div className="chat-window"><div className="chat-header"><span className="assistant-avatar small"><Bot size={18}/></span><div><b>TripGenius local guide</b><small><i/> Offline and ready</small></div></div><div className="messages">{messages.map((message,index)=><div key={index} className={`message ${message.role}`}><p>{message.text}</p></div>)}</div><form onSubmit={ask} className="chat-form"><input value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="Ask about packing, food, safety..."/><button className="primary-button" aria-label="Send question"><ArrowRight size={18}/></button></form></div></div></section> }

function Tools({ plan, expenses, setExpenses }: { plan: TripPlan | null; expenses: Expense[]; setExpenses: (items: Expense[])=>void }) { const [checked,setChecked]=useState<string[]>(()=>readStored('tripgenius-packing-v1',[])); const [item,setItem]=useState(''); const [amount,setAmount]=useState(''); const [category,setCategory]=useState('Food'); useEffect(()=>localStorage.setItem('tripgenius-packing-v1',JSON.stringify(checked)),[checked]); const toggle=(value:string)=>setChecked(current=>current.includes(value)?current.filter(x=>x!==value):[...current,value]); const addExpense=(e:FormEvent)=>{e.preventDefault();if(!item.trim()||!Number(amount))return;setExpenses([{id:crypto.randomUUID(),item:item.trim(),amount:Number(amount),category,date:new Date().toLocaleDateString('en-IN')},...expenses]);setItem('');setAmount('')}; const total=expenses.reduce((sum,x)=>sum+x.amount,0); const comparisons=[['Goa','Beach',38000],['Jaipur','Culture',30000],['Kerala','Nature',42000]]; return <section className="page-shell py-12"><div className="mb-8"><p className="section-kicker">TRAVEL TOOLKIT</p><h1 className="section-title">Keep the practical details close.</h1><p className="mt-2 text-slate-500 dark:text-slate-400">Checklists and expenses are saved locally in this browser.</p></div><div className="tools-grid"><article className="tool-card"><div className="tool-heading"><span><Luggage size={19}/></span><div><h2>Packing checklist</h2><p>{checked.length}/{packingItems.length} packed</p></div></div><div className="packing-list">{packingItems.map((packing)=><label key={packing}><input type="checkbox" checked={checked.includes(packing)} onChange={()=>toggle(packing)}/><span><Check size={14}/></span>{packing}</label>)}</div></article><article className="tool-card"><div className="tool-heading"><span><CircleDollarSign size={19}/></span><div><h2>Expense tracker</h2><p>{money(total)} recorded</p></div></div><form onSubmit={addExpense} className="expense-form"><input value={item} onChange={(e)=>setItem(e.target.value)} placeholder="Expense name"/><input value={amount} onChange={(e)=>setAmount(e.target.value)} type="number" min="1" placeholder="₹ Amount"/><select value={category} onChange={(e)=>setCategory(e.target.value)}>{['Food','Transport','Stay','Activities','Shopping','Other'].map(x=><option key={x}>{x}</option>)}</select><button className="choose-button"><Plus size={16}/> Add</button></form><div className="expense-list">{expenses.length?expenses.map((expense)=><div key={expense.id}><span><b>{expense.item}</b><small>{expense.category} · {expense.date}</small></span><strong>{money(expense.amount)}</strong><button onClick={()=>setExpenses(expenses.filter(x=>x.id!==expense.id))} aria-label={`Remove ${expense.item}`}><X size={15}/></button></div>):<p className="text-sm text-slate-500 dark:text-slate-400">Your recorded expenses will appear here.</p>}</div></article><article className="tool-card"><div className="tool-heading"><span><Compass size={19}/></span><div><h2>Destination comparison</h2><p>Illustrative 4-day trip budgets for 2</p></div></div><div className="compare-table"><div className="compare-head"><span>Place</span><span>Style</span><span>Estimate</span></div>{comparisons.map(([city,style,cost])=><div key={city}><b>{city}</b><span>{style}</span><strong>{money(cost as number)}</strong></div>)}</div><p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">Compare personal preferences in the Surprise Me planner; these are sample estimates, not live prices.</p></article><article className="tool-card emergency"><div className="tool-heading"><span><ShieldCheck size={19}/></span><div><h2>Emergency information</h2><p>Save before you need it</p></div></div><div className="emergency-items"><p><b>112</b><span>India integrated emergency number</span></p><p><b>108</b><span>Ambulance / medical response where available</span></p><p><b>Local embassy</b><span>Save contact details before international travel</span></p></div><p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Emergency numbers can change by location. Check official local guidance in advance.</p></article></div>{plan && <div className="mt-7 safety-box"><MapPin size={20}/><div><b>Currently planning {plan.guide.city}</b><p>{plan.guide.safety} Use the itinerary’s map link to plan individual routes before you leave.</p></div></div>}</section> }

function Field({ label, icon, children, className = '' }: { label: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) { return <label className={`field ${className}`}><span>{icon}{label}</span>{children}</label> }
function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <article className="feature-card"><span>{icon}</span><h3>{title}</h3><p>{text}</p></article> }

function exportTripPDF(plan: TripPlan) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 44
  let y = 52
  const line = (text: string, size = 10, bold = false) => { doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); const lines = doc.splitTextToSize(text, 510); if (y + lines.length * (size + 4) > 790) { doc.addPage(); y = 48 } doc.text(lines, margin, y); y += lines.length * (size + 4) + 8 }
  doc.setFillColor(14,165,164); doc.rect(0,0,595,92,'F'); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(24); doc.text('TripGenius AI',margin,43); doc.setFontSize(11); doc.text('Your transparent travel plan',margin,66); doc.setTextColor(20,35,58)
  y=124; line(`${plan.form.from} to ${plan.guide.city} · ${plan.days} days · ${plan.nights} nights`, 17, true); line('Planning notice: All transport, hotel, rating and price information in this document is illustrative offline sample data. Verify live prices, hours, availability and booking conditions with providers before paying.',9)
  line('Trip summary',13,true); line(`${plan.form.adults + plan.form.children} travellers · ${plan.roomPlan.rooms} room(s) · Room recommendation: ${plan.roomPlan.type}.`); line(`Estimated total: ${money(plan.budget.total)} · ${money(plan.budget.perPerson)} per traveller · Budget remaining: ${money(plan.budget.remaining)}`)
  line('Daily itinerary',13,true); plan.itinerary.forEach((day)=>line(`Day ${day.day} — ${day.date}: Morning: ${day.morning} Afternoon: ${day.afternoon} Evening: ${day.evening} Food: ${day.food} Local transport: ${day.transport} Estimated daily spend: ${money(day.estimated)}`,10))
  line('Budget breakdown',13,true); ;[['Transport',plan.budget.transport],['Hotel',plan.budget.hotel],['Food',plan.budget.food],['Local transport',plan.budget.local],['Activities',plan.budget.activities],['Shopping',plan.budget.shopping],['Emergency reserve',plan.budget.emergency]].forEach(([name,value])=>line(`${name}: ${money(value as number)}`))
  doc.save(`TripGenius-${plan.guide.city.replace(/\s+/g,'-')}-itinerary.pdf`)
}

export default App
