import { useState, useMemo, useEffect } from "react";

let _n = 0;
const uid = () => ++_n;
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtCOP = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
const fmtDate = (d) =>
  d ? new Date(d + "T12:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const isOverdue = (d) => d && d < todayStr();
const PORD = { Alta: 0, Media: 1, Baja: 2 };

const PC = {
  Alta:  { bg: "var(--color-background-danger)",  text: "var(--color-text-danger)",  border: "var(--color-border-danger)" },
  Media: { bg: "var(--color-background-warning)", text: "var(--color-text-warning)", border: "var(--color-border-warning)" },
  Baja:  { bg: "var(--color-background-success)", text: "var(--color-text-success)", border: "var(--color-border-success)" },
};

const FIN_CATS = ["Salario","Freelance","Inversión","Otro ingreso","Alimentación","Transporte","Servicios","Entretenimiento","Salud","Educación","Ropa","Hogar","Restaurantes","Otros gastos"];
const SHOP_CATS = ["Lácteos","Granos","Carnes","Verduras","Frutas","Bebidas","Aseo","Limpieza","Ropa","Tecnología","Otros"];
const UNITS = ["und","kg","g","litros","ml","paq","caja","rollos","docena"];

/* ──── Icons ──────────────────────────────────────────────────── */
const PX = {
  plus:  "M12 5v14M5 12h14",
  x:     "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  dollar:"M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
  tasks: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  cart:  "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  user:  "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  store: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
};
const I = ({ p, s = 16, col }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke={col || "currentColor"} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, display: "block" }}>
    <path d={PX[p]} />
  </svg>
);

/* ──── Base styles ────────────────────────────────────────────── */
const inp = {
  width: "100%", boxSizing: "border-box", padding: "8px 10px",
  borderRadius: "var(--border-radius-md)",
  border: "0.5px solid var(--color-border-secondary)",
  background: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
  fontSize: 13, fontFamily: "inherit", outline: "none",
};

/* ──── Shared UI ──────────────────────────────────────────────── */
function Pill({ label, cfg }) {
  const c = cfg || PC[label] || { bg:"var(--color-background-secondary)", text:"var(--color-text-secondary)", border:"var(--color-border-tertiary)" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"1px 7px",
      borderRadius:20, fontSize:11, fontWeight:500, whiteSpace:"nowrap",
      background:c.bg, color:c.text, border:`0.5px solid ${c.border}` }}>
      {label}
    </span>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div style={{ background:"var(--color-background-secondary)", borderRadius:"var(--border-radius-md)", padding:14, flex:1, minWidth:0 }}>
      <p style={{ margin:"0 0 3px", fontSize:10, color:"var(--color-text-tertiary)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</p>
      <p style={{ margin:0, fontSize:18, fontWeight:700, color:color||"var(--color-text-primary)" }}>{value}</p>
    </div>
  );
}

function Card({ children, style: s = {}, faded }) {
  return (
    <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)",
      borderRadius:"var(--border-radius-lg)", padding:"12px 14px",
      opacity: faded ? 0.52 : 1, transition:"opacity 0.2s", ...s }}>
      {children}
    </div>
  );
}

function FF({ label, children, half }) {
  return (
    <div style={{ marginBottom:10, flex: half ? "0 0 calc(50% - 4px)" : "0 0 100%" }}>
      <label style={{ display:"block", fontSize:10, fontWeight:600, color:"var(--color-text-secondary)",
        marginBottom:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</label>
      {children}
    </div>
  );
}

function Btn({ onClick, children, secondary }) {
  return (
    <button onClick={onClick} style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center", gap:5,
      padding:"8px 14px", borderRadius:"var(--border-radius-md)",
      fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit",
      background: secondary ? "var(--color-background-secondary)" : "var(--color-text-primary)",
      color: secondary ? "var(--color-text-secondary)" : "var(--color-background-primary)",
      border: secondary ? "0.5px solid var(--color-border-secondary)" : "none",
      flexShrink:0,
    }}>{children}</button>
  );
}

function SegControl({ options, value, onChange }) {
  return (
    <div style={{ display:"flex", gap:3, background:"var(--color-background-secondary)",
      borderRadius:"var(--border-radius-md)", padding:3, border:"0.5px solid var(--color-border-tertiary)", flex:1 }}>
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} style={{
          flex:1, padding:"5px 4px", fontSize:12, fontWeight:500, cursor:"pointer",
          border:"none", borderRadius:"var(--border-radius-md)", fontFamily:"inherit",
          background: value===v ? "var(--color-background-primary)" : "transparent",
          color: value===v ? "var(--color-text-primary)" : "var(--color-text-secondary)",
          boxShadow: value===v ? "0 0.5px 2px rgba(0,0,0,0.1)" : "none", transition:"all 0.15s",
        }}>{l}</button>
      ))}
    </div>
  );
}

function PrioSelector({ value, onChange }) {
  return (
    <div style={{ display:"flex", gap:6 }}>
      {["Alta","Media","Baja"].map(p => {
        const c = PC[p], active = value === p;
        return (
          <button key={p} onClick={() => onChange(p)} style={{
            flex:1, padding:7, borderRadius:"var(--border-radius-md)", cursor:"pointer",
            border: active ? `1.5px solid ${c.border}` : "0.5px solid var(--color-border-tertiary)",
            background: active ? c.bg : "var(--color-background-secondary)",
            color: active ? c.text : "var(--color-text-secondary)",
            fontSize:12, fontWeight:500, fontFamily:"inherit", transition:"all 0.15s",
          }}>{p}</button>
        );
      })}
    </div>
  );
}

function InlineForm({ show, title, onClose, children }) {
  if (!show) return null;
  return (
    <Card style={{ marginBottom:12, padding:"1.25rem", border:"0.5px solid var(--color-border-secondary)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <p style={{ margin:0, fontSize:15, fontWeight:600 }}>{title}</p>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer",
          color:"var(--color-text-tertiary)", padding:2, display:"flex" }}>
          <I p="x" s={16}/>
        </button>
      </div>
      {children}
    </Card>
  );
}

function TypeSwitch({ value, onChange }) {
  return (
    <div style={{ display:"flex", gap:6 }}>
      {[["gasto","Gasto"],["ingreso","Ingreso"]].map(([v,l]) => (
        <button key={v} onClick={() => onChange(v)} style={{
          flex:1, padding:7, borderRadius:"var(--border-radius-md)", cursor:"pointer",
          border: value===v ? "1.5px solid var(--color-border-info)" : "0.5px solid var(--color-border-tertiary)",
          background: value===v ? "var(--color-background-info)" : "var(--color-background-secondary)",
          color: value===v ? "var(--color-text-info)" : "var(--color-text-secondary)",
          fontSize:12, fontWeight:500, fontFamily:"inherit",
        }}>{l}</button>
      ))}
    </div>
  );
}

function CheckBtn({ done, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width:20, height:20, borderRadius:6, flexShrink:0, marginTop:2,
      border: done ? "none" : "1.5px solid var(--color-border-secondary)",
      background: done ? "var(--color-background-success)" : "transparent",
      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
      color:"var(--color-text-success)", padding:0,
    }}>{done && <I p="check" s={11}/>}</button>
  );
}

function DeleteBtn({ onDelete }) {
  return (
    <button onClick={onDelete} style={{ background:"none", border:"none", cursor:"pointer",
      color:"var(--color-text-tertiary)", padding:3, display:"flex", flexShrink:0 }}>
      <I p="trash" s={13}/>
    </button>
  );
}

/* ──── Finance Tab ────────────────────────────────────────────── */
const INIT_TRX = [
  { id:uid(), type:"ingreso", category:"Salario",      amount:3500000, description:"Salario mayo",        date:"2026-05-01" },
  { id:uid(), type:"gasto",   category:"Alimentación", amount:250000,  description:"Supermercado Éxito",  date:"2026-05-02" },
  { id:uid(), type:"gasto",   category:"Transporte",   amount:80000,   description:"Gasolina",            date:"2026-05-03" },
  { id:uid(), type:"gasto",   category:"Servicios",    amount:120000,  description:"Internet + servicios",date:"2026-05-04" },
  { id:uid(), type:"ingreso", category:"Freelance",    amount:800000,  description:"Proyecto diseño web", date:"2026-05-05" },
  { id:uid(), type:"gasto",   category:"Restaurantes", amount:65000,   description:"Almuerzo con familia",date:"2026-05-05" },
];

function FinanceTab() {
  const [trx, setTrx] = useState(INIT_TRX);
  const [showForm, setShowForm] = useState(false);
  const [fType, setFType] = useState("all");
  const [fCat, setFCat] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [form, setForm] = useState({ type:"gasto", category:"Alimentación", amount:"", description:"", date:todayStr() });
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const filtered = useMemo(() => trx.filter(t => {
    if (fType !== "all" && t.type !== fType) return false;
    if (fCat  !== "all" && t.category !== fCat) return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo   && t.date > dateTo)   return false;
    return true;
  }).sort((a,b) => b.date.localeCompare(a.date)), [trx, fType, fCat, dateFrom, dateTo]);

  const totals = useMemo(() => {
    const ing = trx.filter(t=>t.type==="ingreso").reduce((s,t)=>s+t.amount,0);
    const gas = trx.filter(t=>t.type==="gasto").reduce((s,t)=>s+t.amount,0);
    return { ing, gas, balance: ing-gas };
  }, [trx]);

  const save = () => {
    if (!form.amount || !form.date) return;
    setTrx(p => [{ ...form, id:uid(), amount:Number(form.amount) }, ...p]);
    setForm({ type:"gasto", category:"Alimentación", amount:"", description:"", date:todayStr() });
    setShowForm(false);
  };

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <MetricCard label="Ingresos"  value={fmtCOP(totals.ing)}     color="var(--color-text-success)" />
        <MetricCard label="Gastos"    value={fmtCOP(totals.gas)}     color="var(--color-text-danger)" />
        <MetricCard label="Balance"   value={fmtCOP(totals.balance)} color={totals.balance>=0?"var(--color-text-success)":"var(--color-text-danger)"} />
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap", alignItems:"center" }}>
        <select value={fType} onChange={e=>setFType(e.target.value)} style={{...inp,width:"auto",flex:"0 0 auto",padding:"7px 10px"}}>
          <option value="all">Todo</option>
          <option value="ingreso">Ingresos</option>
          <option value="gasto">Gastos</option>
        </select>
        <select value={fCat} onChange={e=>setFCat(e.target.value)} style={{...inp,width:"auto",flex:1,minWidth:140,padding:"7px 10px"}}>
          <option value="all">Categoría</option>
          {FIN_CATS.map(c=><option key={c}>{c}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
          title="Desde" placeholder="Desde"
          style={{...inp,width:"auto",flex:"0 0 auto",fontSize:12,padding:"7px 10px"}}/>
        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
          title="Hasta" placeholder="Hasta"
          style={{...inp,width:"auto",flex:"0 0 auto",fontSize:12,padding:"7px 10px"}}/>
        <Btn onClick={()=>setShowForm(s=>!s)}><I p="plus" s={13}/> Agregar</Btn>
      </div>

      {/* Add form */}
      <InlineForm show={showForm} title="Nueva transacción" onClose={()=>setShowForm(false)}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          <FF label="Tipo" half><TypeSwitch value={form.type} onChange={v=>upd("type",v)}/></FF>
          <FF label="Categoría" half>
            <select value={form.category} onChange={e=>upd("category",e.target.value)} style={{...inp,padding:"7px 10px"}}>
              {FIN_CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </FF>
          <FF label="Monto" half>
            <input type="number" placeholder="0" value={form.amount} onChange={e=>upd("amount",e.target.value)} style={inp}/>
          </FF>
          <FF label="Fecha" half>
            <input type="date" value={form.date} onChange={e=>upd("date",e.target.value)} style={inp}/>
          </FF>
          <FF label="Descripción">
            <input type="text" placeholder="Descripción (opcional)" value={form.description} onChange={e=>upd("description",e.target.value)} style={inp}/>
          </FF>
        </div>
        <Btn onClick={save}><I p="check" s={13}/> Guardar</Btn>
      </InlineForm>

      {/* List */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {filtered.length===0 && <p style={{textAlign:"center",color:"var(--color-text-tertiary)",padding:"2rem 0",margin:0}}>Sin registros para los filtros seleccionados</p>}
        {filtered.map(t => (
          <Card key={t.id}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8,height:8,borderRadius:"50%",flexShrink:0,
                background: t.type==="ingreso"?"var(--color-text-success)":"var(--color-text-danger)" }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:5, marginBottom:2 }}>
                  <span style={{ fontSize:13, fontWeight:500 }}>{t.description || t.category}</span>
                  <Pill label={t.type==="ingreso"?"Ingreso":"Gasto"}
                    cfg={t.type==="ingreso"
                      ?{bg:"var(--color-background-success)",text:"var(--color-text-success)",border:"var(--color-border-success)"}
                      :{bg:"var(--color-background-danger)", text:"var(--color-text-danger)", border:"var(--color-border-danger)"}}/>
                  <Pill label={t.category}/>
                </div>
                <span style={{ fontSize:11, color:"var(--color-text-tertiary)" }}>{fmtDate(t.date)}</span>
              </div>
              <span style={{ fontSize:14,fontWeight:700,flexShrink:0,
                color: t.type==="ingreso"?"var(--color-text-success)":"var(--color-text-danger)" }}>
                {t.type==="ingreso"?"+":"−"}{fmtCOP(t.amount)}
              </span>
              <DeleteBtn onDelete={()=>setTrx(p=>p.filter(x=>x.id!==t.id))}/>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ──── Tasks Tab ──────────────────────────────────────────────── */
const INIT_TASKS = [
  { id:uid(), title:"Pagar arriendo",            description:"Transferencia antes del día 10", priority:"Alta",  deadline:"2026-05-10", assignee:"Juan",   done:false },
  { id:uid(), title:"Revisar extractos bancarios",description:"",                               priority:"Media", deadline:"2026-05-15", assignee:"María",  done:false },
  { id:uid(), title:"Llamar al plomero",          description:"Gotera en el baño principal",    priority:"Alta",  deadline:"2026-05-04", assignee:"Juan",   done:false },
  { id:uid(), title:"Limpiar garaje",             description:"Organizar herramientas y cajas", priority:"Baja",  deadline:"2026-05-20", assignee:"Carlos", done:true  },
];

function TasksTab() {
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [sortBy, setSortBy] = useState("priority");
  const [form, setForm] = useState({ title:"", description:"", priority:"Media", deadline:"", assignee:"" });
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const list = useMemo(() => {
    let r = tasks.filter(t => filter==="all"?true : filter==="pending"?!t.done:t.done);
    if (sortBy==="priority") r = [...r].sort((a,b)=>PORD[a.priority]-PORD[b.priority]);
    else r = [...r].sort((a,b)=>(a.deadline||"9999").localeCompare(b.deadline||"9999"));
    return r;
  }, [tasks, filter, sortBy]);

  const save = () => {
    if (!form.title.trim()) return;
    setTasks(p=>[{...form,id:uid(),done:false},...p]);
    setForm({ title:"", description:"", priority:"Media", deadline:"", assignee:"" });
    setShowForm(false);
  };

  const counts = useMemo(()=>({
    pending: tasks.filter(t=>!t.done).length,
    done:    tasks.filter(t=>t.done).length,
    overdue: tasks.filter(t=>!t.done&&isOverdue(t.deadline)).length,
  }),[tasks]);

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <MetricCard label="Pendientes"  value={counts.pending} />
        <MetricCard label="Completadas" value={counts.done}    color="var(--color-text-success)" />
        <MetricCard label="Vencidas"    value={counts.overdue} color="var(--color-text-danger)" />
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap", alignItems:"center" }}>
        <SegControl options={[["all","Todas"],["pending","Pendientes"],["done","Completadas"]]}
          value={filter} onChange={setFilter}/>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{...inp,width:"auto",padding:"7px 10px",flex:"0 0 auto"}}>
          <option value="priority">Por prioridad</option>
          <option value="deadline">Por fecha límite</option>
        </select>
        <Btn onClick={()=>setShowForm(s=>!s)}><I p="plus" s={13}/> Nueva tarea</Btn>
      </div>

      <InlineForm show={showForm} title="Nueva tarea" onClose={()=>setShowForm(false)}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          <FF label="Título">
            <input type="text" placeholder="¿Qué hay que hacer?" value={form.title} onChange={e=>upd("title",e.target.value)} style={inp}/>
          </FF>
          <FF label="Descripción">
            <input type="text" placeholder="Detalles opcionales" value={form.description} onChange={e=>upd("description",e.target.value)} style={inp}/>
          </FF>
          <FF label="Prioridad">
            <PrioSelector value={form.priority} onChange={v=>upd("priority",v)}/>
          </FF>
          <FF label="Fecha límite" half>
            <input type="date" value={form.deadline} onChange={e=>upd("deadline",e.target.value)} style={inp}/>
          </FF>
          <FF label="Asignado a" half>
            <input type="text" placeholder="Responsable" value={form.assignee} onChange={e=>upd("assignee",e.target.value)} style={inp}/>
          </FF>
        </div>
        <Btn onClick={save}><I p="check" s={13}/> Guardar tarea</Btn>
      </InlineForm>

      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {list.length===0 && <p style={{textAlign:"center",color:"var(--color-text-tertiary)",padding:"2rem 0",margin:0}}>Sin tareas</p>}
        {list.map(t => {
          const over = !t.done && isOverdue(t.deadline);
          return (
            <Card key={t.id} faded={t.done}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <CheckBtn done={t.done} onToggle={()=>setTasks(p=>p.map(x=>x.id===t.id?{...x,done:!x.done}:x))}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:5, marginBottom:t.description?3:5 }}>
                    <span style={{ fontSize:13, fontWeight:500, textDecoration:t.done?"line-through":"none" }}>{t.title}</span>
                    <Pill label={t.priority}/>
                    {over && <Pill label="Vencida" cfg={{bg:"var(--color-background-danger)",text:"var(--color-text-danger)",border:"var(--color-border-danger)"}}/>}
                  </div>
                  {t.description && <p style={{ margin:"0 0 5px", fontSize:12, color:"var(--color-text-secondary)" }}>{t.description}</p>}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:10, fontSize:11, color:"var(--color-text-tertiary)" }}>
                    {t.deadline && <span>{fmtDate(t.deadline)}</span>}
                    {t.assignee && <span>· {t.assignee}</span>}
                  </div>
                </div>
                <DeleteBtn onDelete={()=>setTasks(p=>p.filter(x=>x.id!==t.id))}/>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ──── Shopping Tab ───────────────────────────────────────────── */
const INIT_SHOP = [
  { id:uid(), name:"Leche",           qty:4,  unit:"litros", priority:"Alta",  requester:"María", store:"Éxito",    category:"Lácteos", done:false },
  { id:uid(), name:"Arroz",           qty:2,  unit:"kg",     priority:"Alta",  requester:"Juan",  store:"Jumbo",    category:"Granos",  done:false },
  { id:uid(), name:"Shampoo",         qty:1,  unit:"und",    priority:"Media", requester:"Ana",   store:"Farmacia", category:"Aseo",    done:false },
  { id:uid(), name:"Papel higiénico", qty:12, unit:"rollos", priority:"Alta",  requester:"Juan",  store:"Éxito",    category:"Aseo",    done:true  },
  { id:uid(), name:"Aguacates",       qty:4,  unit:"und",    priority:"Baja",  requester:"María", store:"",         category:"Frutas",  done:false },
];

function ShoppingTab() {
  const [items, setItems] = useState(INIT_SHOP);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [form, setForm] = useState({ name:"", qty:1, unit:"und", priority:"Media", requester:"", store:"", category:"Otros" });
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const list = useMemo(() => {
    let r = items.filter(it => filter==="all"?true : filter==="pending"?!it.done:it.done);
    return [...r].sort((a,b)=>PORD[a.priority]-PORD[b.priority]);
  }, [items, filter]);

  const save = () => {
    if (!form.name.trim()) return;
    setItems(p=>[{...form,id:uid(),done:false,qty:Number(form.qty)||1},...p]);
    setForm({ name:"", qty:1, unit:"und", priority:"Media", requester:"", store:"", category:"Otros" });
    setShowForm(false);
  };

  const counts = useMemo(()=>({
    pending: items.filter(it=>!it.done).length,
    alta:    items.filter(it=>!it.done&&it.priority==="Alta").length,
    done:    items.filter(it=>it.done).length,
  }),[items]);

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <MetricCard label="Por comprar"     value={counts.pending} />
        <MetricCard label="Alta prioridad"  value={counts.alta}   color="var(--color-text-danger)" />
        <MetricCard label="Comprados"       value={counts.done}   color="var(--color-text-success)" />
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap", alignItems:"center" }}>
        <SegControl options={[["all","Todos"],["pending","Pendientes"],["done","Comprados"]]}
          value={filter} onChange={setFilter}/>
        <Btn onClick={()=>setShowForm(s=>!s)}><I p="plus" s={13}/> Agregar</Btn>
      </div>

      <InlineForm show={showForm} title="Agregar artículo" onClose={()=>setShowForm(false)}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          <FF label="Artículo">
            <input type="text" placeholder="¿Qué hay que comprar?" value={form.name} onChange={e=>upd("name",e.target.value)} style={inp}/>
          </FF>
          <FF label="Cantidad" half>
            <input type="number" min="1" value={form.qty} onChange={e=>upd("qty",e.target.value)} style={inp}/>
          </FF>
          <FF label="Unidad" half>
            <select value={form.unit} onChange={e=>upd("unit",e.target.value)} style={{...inp,padding:"7px 10px"}}>
              {UNITS.map(u=><option key={u}>{u}</option>)}
            </select>
          </FF>
          <FF label="Categoría" half>
            <select value={form.category} onChange={e=>upd("category",e.target.value)} style={{...inp,padding:"7px 10px"}}>
              {SHOP_CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </FF>
          <FF label="Prioridad" half>
            <PrioSelector value={form.priority} onChange={v=>upd("priority",v)}/>
          </FF>
          <FF label="Solicitado por" half>
            <input type="text" placeholder="Nombre" value={form.requester} onChange={e=>upd("requester",e.target.value)} style={inp}/>
          </FF>
          <FF label="Dónde comprar" half>
            <input type="text" placeholder="Tienda o lugar" value={form.store} onChange={e=>upd("store",e.target.value)} style={inp}/>
          </FF>
        </div>
        <Btn onClick={save}><I p="check" s={13}/> Guardar artículo</Btn>
      </InlineForm>

      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {list.length===0 && <p style={{textAlign:"center",color:"var(--color-text-tertiary)",padding:"2rem 0",margin:0}}>Sin artículos</p>}
        {list.map(it => (
          <Card key={it.id} faded={it.done}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <CheckBtn done={it.done} onToggle={()=>setItems(p=>p.map(x=>x.id===it.id?{...x,done:!x.done}:x))}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:5, marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:500, textDecoration:it.done?"line-through":"none" }}>{it.name}</span>
                  <span style={{ fontSize:12, color:"var(--color-text-secondary)" }}>×{it.qty} {it.unit}</span>
                  <Pill label={it.priority}/>
                  <Pill label={it.category}/>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, fontSize:11, color:"var(--color-text-tertiary)" }}>
                  {it.requester && <span>Solicitado por {it.requester}</span>}
                  {it.store     && <span>· {it.store}</span>}
                </div>
              </div>
              <DeleteBtn onDelete={()=>setItems(p=>p.filter(x=>x.id!==it.id))}/>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ──── App Shell ──────────────────────────────────────────────── */
const TABS = [
  { id:"finance",  label:"Finanzas", icon:"dollar" },
  { id:"tasks",    label:"Tareas",   icon:"tasks"  },
  { id:"shopping", label:"Compras",  icon:"cart"   },
];

export default function App() {
  const [tab, setTab] = useState("finance");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ fontFamily:"'DM Sans', var(--font-sans)", maxWidth:680, margin:"0 auto", padding:"1.5rem 1rem 3rem" }}>
      {/* Header */}
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:700, fontFamily:"'Syne', var(--font-sans)", letterSpacing:"-0.02em" }}>
          Control del Hogar
        </h1>
        <p style={{ margin:"2px 0 0", fontSize:12, color:"var(--color-text-tertiary)" }}>
          {new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:3, background:"var(--color-background-secondary)",
        borderRadius:"var(--border-radius-lg)", padding:4, marginBottom:"1.5rem",
        border:"0.5px solid var(--color-border-tertiary)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1, padding:"10px 6px", fontSize:13, fontWeight: tab===t.id?600:400,
            cursor:"pointer", border:"none", borderRadius:"var(--border-radius-md)",
            background: tab===t.id?"var(--color-background-primary)":"transparent",
            color: tab===t.id?"var(--color-text-primary)":"var(--color-text-secondary)",
            fontFamily:"'Syne', inherit",
            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            boxShadow: tab===t.id?"0 0.5px 3px rgba(0,0,0,0.12)":"none",
            transition:"all 0.15s",
          }}>
            <I p={t.icon} s={14}/>{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab==="finance"  && <FinanceTab/>}
      {tab==="tasks"    && <TasksTab/>}
      {tab==="shopping" && <ShoppingTab/>}
    </div>
  );
}