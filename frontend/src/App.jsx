
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  Database,
  Search,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import "./App.css";

const API = "http://localhost:8085/api/trades";

function App() {
  const [trades, setTrades] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pulling, setPulling] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(API)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load trades");
        return response.json();
      })
      .then(setTrades)
      .catch(() => setMessage("Cannot connect to backend. Check Spring Boot."))
      .finally(() => setLoading(false));

    const stream = new EventSource(`${API}/stream`);

    stream.onopen = () => setConnected(true);
    stream.onerror = () => setConnected(false);

    stream.addEventListener("trades", (event) => {
      const incoming = JSON.parse(event.data);

      setTrades((current) => {
        const ids = new Set(current.map((trade) => trade.tradeId));
        return [
          ...incoming.filter((trade) => !ids.has(trade.tradeId)),
          ...current,
        ];
      });

      setMessage(`${incoming.length} new trades received live.`);
      setPulling(false);
    });

    return () => stream.close();
  }, []);

  async function startPull() {
    setPulling(true);
    setMessage("Starting background trade pull…");

    try {
      const response = await fetch(`${API}/pull`, { method: "POST" });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Pull failed");

      setMessage("Pull started. Waiting for new trades through SSE…");
    } catch (error) {
      setPulling(false);
      setMessage(error.message);
    }
  }

  const filtered = trades.filter((trade) =>
    [trade.tradeId, trade.client, trade.symbol]
      .some((value) =>
        String(value ?? "").toLowerCase().includes(search.toLowerCase())
      )
  );

  const totalValue = trades.reduce(
    (sum, trade) =>
      sum + Number(trade.price || 0) * Number(trade.quantity || 0),
    0
  );

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="logo"><TrendingUp /> Arham<span>Trade</span></div>
        <p className="side-label">WORKSPACE</p>
        <div className="nav-active"><Activity size={18} /> Trades Overview</div>
        <p className="side-label">DATA SOURCE</p>
        <div className="source"><span className="dot" /> BSE Mock Exchange</div>
        <div className="connection">
          {connected ? <Wifi size={17} /> : <WifiOff size={17} />}
          <strong>{connected ? "Live connection" : "Connecting…"}</strong>
          <small>Server-Sent Events</small>
        </div>
      </aside>

      <section className="content">
        <header className="header">
          <div>
            <p className="breadcrumb">Workspace / Trades</p>
            <h1>Trades Overview</h1>
            <p className="muted">Monitor exchange activity and incoming trade data in real time.</p>
          </div>
          <button className="pull-button" onClick={startPull} disabled={pulling}>
            <ArrowDownToLine size={17} />
            {pulling ? "Pull in progress…" : "Pull new trades"}
          </button>
        </header>

        {message && <div className="message">{message}</div>}

        <section className="stats">
          <article className="stat">
            <span>Total trades</span>
            <Activity />
            <strong>{trades.length.toLocaleString("en-IN")}</strong>
            <small>Records in database</small>
          </article>
          <article className="stat">
            <span>Total trade value</span>
            <Database />
            <strong>₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
            <small>Quantity × price</small>
          </article>
          <article className="stat">
            <span>Exchange source</span>
            <TrendingUp />
            <strong>BSE Mock</strong>
            <small>Simulated exchange feed</small>
          </article>
          <article className="stat">
            <span>Stream status</span>
            {connected ? <Wifi /> : <WifiOff />}
            <strong>{connected ? "Connected" : "Offline"}</strong>
            <small>Live event stream</small>
          </article>
        </section>

        <section className="table-panel">
          <div className="table-header">
            <div>
              <h2>Trade activity</h2>
              <p className="muted">Existing trades and incoming live updates</p>
            </div>
            <label className="search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search trades…"
              />
            </label>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>TRADE ID</th>
                  <th>CLIENT</th>
                  <th>SYMBOL</th>
                  <th>QUANTITY</th>
                  <th>PRICE</th>
                  <th>TRADE VALUE</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7">Loading trades…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="7">No trades found.</td></tr>
                ) : (
                  filtered.slice(0, 100).map((trade) => (
                    <tr key={trade.tradeId}>
                      <td>{trade.tradeId}</td>
                      <td>{trade.client}</td>
                      <td><span className="symbol">{trade.symbol}</span></td>
                      <td>{trade.quantity}</td>
                      <td>₹{Number(trade.price).toLocaleString("en-IN")}</td>
                      <td>₹{(Number(trade.price) * Number(trade.quantity)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                      <td>{trade.timestamp ? new Date(trade.timestamp).toLocaleString() : "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <footer className="table-footer">
            Showing {Math.min(100, filtered.length)} of {filtered.length} trades
          </footer>
        </section>

        <footer className="page-footer">
          Arham Trade Dashboard · Spring Boot · React · PostgreSQL · SSE
        </footer>
      </section>
    </main>
  );
}

export default App;
``




// import { useEffect, useMemo, useState } from "react";
// import {
//   Activity,
//   ArrowDownToLine,
//   ArrowUpRight,
//   CircleDollarSign,
//   Clock3,
//   Database,
//   LoaderCircle,
//   Search,
//   TrendingUp,
//   Wifi,
//   WifiOff,
// } from "lucide-react";
// import "./App.css";

// const API = "http://localhost:8085/api/trades";

// function formatPrice(value) {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 2,
//   }).format(value ?? 0);
// }

// function App() {
//   const [trades, setTrades] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [connected, setConnected] = useState(false);
//   const [pulling, setPulling] = useState(false);
//   const [search, setSearch] = useState("");
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");

//   async function loadTrades() {
//     try {
//       const response = await fetch(API);
//       if (!response.ok) throw new Error("Could not load trades");
//       const data = await response.json();
//       setTrades(data);
//       setError("");
//     } catch {
//       setError("Cannot connect to the backend. Check that Spring Boot is running on port 8085.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadTrades();

//     const events = new EventSource(`${API}/stream`);

//     events.onopen = () => setConnected(true);
//     events.onerror = () => setConnected(false);

//     events.addEventListener("trades", (event) => {
//       try {
//         const newTrades = JSON.parse(event.data);
//         setTrades((current) => {
//           const knownIds = new Set(current.map((trade) => trade.tradeId));
//           const uniqueNew = newTrades.filter(
//             (trade) => !knownIds.has(trade.tradeId)
//           );
//           return [...uniqueNew, ...current];
//         });
//         setNotice(`${newTrades.length} new trades received live.`);
//         setPulling(false);
//       } catch {
//         setError("Received an invalid trade update.");
//       }
//     });

//     return () => events.close();
//   }, []);

//   async function startPull() {
//     setNotice("");
//     setError("");

//     try {
//       const response = await fetch(`${API}/pull`, { method: "POST" });
//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.message || "Could not start the trade pull.");
//       }

//       setPulling(true);
//       setNotice("Pull started. Waiting for the live trade update…");
//     } catch (err) {
//       setError(err.message || "Could not start the trade pull.");
//     }
//   }

//   const filteredTrades = useMemo(() => {
//     const query = search.trim().toLowerCase();
//     if (!query) return trades;

//     return trades.filter((trade) =>
//       [
//         trade.tradeId,
//         trade.client,
//         trade.symbol,
//         trade.quantity,
//         trade.price,
//       ].some((value) => String(value ?? "").toLowerCase().includes(query))
//     );
//   }, [trades, search]);

//   const totalValue = trades.reduce(
//     (sum, trade) => sum + Number(trade.price || 0) * Number(trade.quantity || 0),
//     0
//   );

//   return (
//     <main className="app-shell">
//       <aside className="sidebar">
//         <div className="brand">
//           <div className="brand-icon"><TrendingUp size={23} /></div>
//           <div>
//             <strong>Arham<span>Trade</span></strong>
//             <small>MARKET INTELLIGENCE</small>
//           </div>
//         </div>

//         <div className="side-label">WORKSPACE</div>
//         <div className="nav-item active"><Activity size={18} /> Trades Overview</div>
//         <div className="side-label sources-label">DATA SOURCES</div>
//         <div className="source-item">
//           <span className="source-dot" /> BSE Mock Exchange
//           <span className="source-status">API</span>
//         </div>

//         <div className="sidebar-bottom">
//           <div className="connection-card">
//             <div className="connection-heading">
//               {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
//               <span>{connected ? "Live connection" : "Connecting…"}</span>
//             </div>
//             <small>{connected ? "SSE stream active" : "Waiting for SSE stream"}</small>
//             <div className="connection-line"><span /></div>
//           </div>
//           <small className="version">TRADING TERMINAL · LOCAL</small>
//         </div>
//       </aside>

//       <section className="main-content">
//         <header className="topbar">
//           <div>
//             <div className="breadcrumb">Workspace <span>/</span> Trades</div>
//             <h1>Trades Overview</h1>
//             <p className="subtitle">Monitor exchange activity and incoming trade data in real time.</p>
//           </div>
//           <div className="topbar-right">
//             <span className={`live-badge ${connected ? "is-live" : ""}`}>
//               <span className="live-dot" /> {connected ? "LIVE" : "CONNECTING"}
//             </span>
//             <button className="pull-button" onClick={startPull} disabled={pulling}>
//               {pulling ? <LoaderCircle className="spin" size={17} /> : <ArrowDownToLine size={17} />}
//               {pulling ? "Pull in progress" : "Pull new trades"}
//             </button>
//           </div>
//         </header>

//         {error && <div className="alert error-alert">{error}</div>}
//         {notice && <div className="alert notice-alert">{notice}</div>}

//         <section className="stats-grid">
//           <article className="stat-card">
//             <div className="stat-top"><span>Total trades</span><div className="stat-icon blue"><Activity size={19} /></div></div>
//             <div className="stat-value">{trades.length.toLocaleString("en-IN")}</div>
//             <div className="stat-foot"><span className="foot-icon"><ArrowUpRight size={15} /></span> Records stored in database</div>
//           </article>
//           <article className="stat-card">
//             <div className="stat-top"><span>Trade notional value</span><div className="stat-icon purple"><CircleDollarSign size={19} /></div></div>
//             <div className="stat-value">{formatPrice(totalValue)}</div>
//             <div className="stat-foot">Quantity × price across loaded trades</div>
//           </article>
//           <article className="stat-card">
//             <div className="stat-top"><span>Exchange source</span><div className="stat-icon orange"><Database size={19} /></div></div>
//             <div className="stat-value">BSE Mock</div>
//             <div className="stat-foot">Simulated trade feed</div>
//           </article>
//           <article className="stat-card">
//             <div className="stat-top"><span>Stream status</span><div className="stat-icon green"><Wifi size={19} /></div></div>
//             <div className="stat-value status-value">{connected ? "Connected" : "Offline"}</div>
//             <div className="stat-foot"><Clock3 size={14} /> Server-Sent Events</div>
//           </article>
//         </section>

//         <section className="table-panel">
//           <div className="table-heading">
//             <div>
//               <h2>Trade activity</h2>
//               <p>Stored trades and live updates from the exchange</p>
//             </div>
//             <label className="search-box">
//               <Search size={17} />
//               <input
//                 value={search}
//                 onChange={(event) => setSearch(event.target.value)}
//                 placeholder="Search trades…"
//                 aria-label="Search trades"
//               />
//             </label>
//           </div>

//           <div className="table-meta">
//             <span><span className="source-dot" /> {filteredTrades.length.toLocaleString("en-IN")} records</span>
//             <span>Sorted by latest received</span>
//           </div>

//           <div className="table-scroll">
//             <table>
//               <thead>
//                 <tr>
//                   <th>TRADE ID</th>
//                   <th>CLIENT</th>
//                   <th>SYMBOL</th>
//                   <th>QUANTITY</th>
//                   <th>PRICE</th>
//                   <th>TRADE VALUE</th>
//                   <th>TIMESTAMP</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr><td colSpan="7" className="empty-state"><LoaderCircle className="spin" size={22} /> Loading trades…</td></tr>
//                 ) : filteredTrades.length === 0 ? (
//                   <tr><td colSpan="7" className="empty-state">No matching trades found.</td></tr>
//                 ) : (
//                   filteredTrades.slice(0, 100).map((trade) => (
//                     <tr key={trade.tradeId}>
//                       <td className="trade-id">{trade.tradeId}</td>
//                       <td>{trade.client}</td>
//                       <td><span className="symbol-chip">{trade.symbol}</span></td>
//                       <td>{Number(trade.quantity).toLocaleString("en-IN")}</td>
//                       <td>{formatPrice(trade.price)}</td>
//                       <td className="value-cell">{formatPrice(Number(trade.price) * Number(trade.quantity))}</td>
//                       <td className="timestamp">{trade.timestamp ? new Date(trade.timestamp).toLocaleString() : "—"}</td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//           <footer className="table-footer">
//             Showing {Math.min(100, filteredTrades.length)} of {filteredTrades.length.toLocaleString("en-IN")} matching trades
//             {filteredTrades.length > 100 && " · Search to narrow the results"}
//           </footer>
//         </section>

//         <footer className="page-footer">
//           <span>Arham Trade Dashboard</span>
//           <span>Spring Boot · React · PostgreSQL · SSE</span>
//         </footer>
//       </section>
//     </main>
//   );
// }

// export default App;
