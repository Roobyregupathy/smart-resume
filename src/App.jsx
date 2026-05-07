import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   GLOBAL CSS — injected into <head>
═══════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'JetBrains Mono',monospace;background:#050810;color:#cdd6f4;overflow-x:hidden;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:#050810}
::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#00d4ff,#f59e0b)}

/* ── Background ── */
.sr-gridbg{
  position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(0,212,255,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(0,212,255,.035) 1px,transparent 1px);
  background-size:72px 72px;
}
.sr-orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0;filter:blur(100px)}
.sr-orb1{width:700px;height:700px;background:rgba(0,212,255,.055);top:-250px;right:-200px}
.sr-orb2{width:500px;height:500px;background:rgba(245,158,11,.04);bottom:0;left:-150px}
.sr-orb3{width:300px;height:300px;background:rgba(139,92,246,.04);top:50%;left:40%}

/* ── Nav ── */
.sr-nav{
  position:fixed;top:0;left:0;right:0;z-index:1000;height:58px;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 2.5rem;
  background:rgba(5,8,16,.88);backdrop-filter:blur(18px) saturate(200%);
  border-bottom:1px solid rgba(0,212,255,.1);
  transition:box-shadow .3s;
}
.sr-nav.scrolled{box-shadow:0 4px 40px rgba(0,212,255,.1)}
.sr-logo{font-family:'Outfit',sans-serif;font-weight:900;font-size:1.25rem;cursor:pointer;letter-spacing:-.02em;color:#e2e8f0}
.sr-logo span{color:#00d4ff}
.sr-navlinks{display:flex;gap:1.75rem;list-style:none}
.sr-navlinks li{font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:#475569;cursor:pointer;transition:color .2s;padding:.25rem 0;position:relative}
.sr-navlinks li::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:#00d4ff;transform:scaleX(0);transition:transform .2s}
.sr-navlinks li:hover,.sr-navlinks li.active{color:#00d4ff}
.sr-navlinks li.active::after,.sr-navlinks li:hover::after{transform:scaleX(1)}
.sr-navbtn{
  font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;
  border:1px solid #00d4ff;color:#00d4ff;background:transparent;
  padding:.4rem 1.1rem;cursor:pointer;transition:all .2s;
}
.sr-navbtn:hover{background:#00d4ff;color:#050810;box-shadow:0 0 24px rgba(0,212,255,.35)}

/* ── Stats bar (bottom) ── */
.sr-statsbar{
  position:fixed;bottom:0;left:0;right:0;z-index:1000;
  height:38px;display:flex;align-items:center;
  background:rgba(5,8,16,.96);border-top:1px solid rgba(0,212,255,.08);
  font-size:.63rem;letter-spacing:.08em;overflow:hidden;
}
.sr-stat{display:flex;align-items:center;gap:.45rem;padding:0 1.25rem;border-right:1px solid rgba(0,212,255,.07);height:100%}
.sr-stat-lbl{color:#334155}
.sr-stat-val{color:#00d4ff;font-weight:500;min-width:1.2rem;transition:all .3s}
.sr-stat-val.bump{color:#f59e0b;transform:scale(1.2)}
.sr-liverow{display:flex;align-items:center;gap:.5rem;padding:0 1.25rem}
.sr-livedot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:srpulse 2s infinite;flex-shrink:0}
.sr-livelbl{color:#22c55e;font-size:.6rem;letter-spacing:.15em}
.sr-barright{margin-left:auto;padding:0 1.5rem;color:#1e293b;font-size:.58rem;letter-spacing:.06em}

@keyframes srpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.7)}}

/* ── Toasts ── */
.sr-toaststack{position:fixed;top:4.2rem;right:1.25rem;z-index:9999;display:flex;flex-direction:column;gap:.45rem;pointer-events:none;max-width:300px}
.sr-toast{
  display:flex;align-items:center;gap:.6rem;
  background:#0c1220;border:1px solid rgba(0,212,255,.18);border-left:3px solid #00d4ff;
  padding:.6rem .95rem;font-size:.68rem;color:#cdd6f4;
  animation:srtoastin .4s cubic-bezier(.22,1,.36,1);
  box-shadow:0 8px 40px rgba(0,0,0,.5);letter-spacing:.03em;
}
.sr-toast.amber{border-left-color:#f59e0b}
.sr-toast.green{border-left-color:#22c55e}
@keyframes srtoastin{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}

/* ── Page wrapper ── */
.sr-page{position:relative;z-index:1}
.sr-section{max-width:1060px;margin:0 auto;padding:5.5rem 2rem}

/* ── Scroll reveals ── */
.sr-reveal{opacity:0;transform:translateY(30px);transition:opacity .75s ease,transform .75s ease}
.sr-reveal.vis{opacity:1;transform:none}
.sr-rleft{opacity:0;transform:translateX(-30px);transition:opacity .75s ease,transform .75s ease}
.sr-rleft.vis{opacity:1;transform:none}
.sr-rright{opacity:0;transform:translateX(30px);transition:opacity .75s ease,transform .75s ease}
.sr-rright.vis{opacity:1;transform:none}

/* ── Section typography ── */
.sr-eyebrow{font-size:.63rem;letter-spacing:.2em;text-transform:uppercase;color:#00d4ff;margin-bottom:.6rem}
.sr-h2{font-family:'Outfit',sans-serif;font-size:clamp(2rem,5vw,3.4rem);font-weight:800;color:#e2e8f0;line-height:1.1;letter-spacing:-.02em;margin-bottom:.75rem}
.sr-h2 .c1{color:#00d4ff}
.sr-h2 .c2{color:#f59e0b}
.sr-rule{width:38px;height:2px;background:linear-gradient(90deg,#00d4ff,#f59e0b);margin:.6rem 0 2.25rem}

/* ══ HERO ══ */
#hero{
  min-height:100vh;display:flex;flex-direction:column;justify-content:center;
  padding:7rem 2rem 6rem;max-width:1060px;margin:0 auto;position:relative;
}
.sr-herochip{
  display:inline-flex;align-items:center;gap:.5rem;margin-bottom:1.5rem;
  border:1px solid rgba(0,212,255,.25);padding:.28rem .8rem;
  font-size:.62rem;letter-spacing:.15em;color:#00d4ff;text-transform:uppercase;
  background:rgba(0,212,255,.04);
}
.sr-heroname{
  font-family:'Outfit',sans-serif;font-size:clamp(3.2rem,11vw,7.5rem);
  font-weight:900;line-height:1;letter-spacing:-.03em;color:#e2e8f0;margin-bottom:.4rem;
}
.sr-heroname .acc{color:#00d4ff}
.sr-herorole{font-size:clamp(.8rem,2vw,1rem);color:#64748b;letter-spacing:.04em;margin-bottom:.75rem;line-height:1.6;max-width:580px}
.sr-typerow{display:flex;align-items:center;gap:.5rem;margin-bottom:2.75rem;min-height:1.8rem}
.sr-typepre{font-size:.78rem;color:#1e3a4a;user-select:none}
.sr-typetext{font-size:clamp(.88rem,2.2vw,1.1rem);color:#f59e0b;letter-spacing:.03em}
.sr-cursor{display:inline-block;width:2px;height:1em;background:#f59e0b;margin-left:2px;animation:srblink 1s step-end infinite;vertical-align:middle}
@keyframes srblink{0%,100%{opacity:1}50%{opacity:0}}
.sr-heroctas{display:flex;gap:.85rem;flex-wrap:wrap;margin-bottom:2.75rem}
.sr-btnprimary{
  font-family:'JetBrains Mono',monospace;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;
  background:#00d4ff;color:#050810;padding:.78rem 2rem;border:none;cursor:pointer;font-weight:500;
  transition:all .2s;
}
.sr-btnprimary:hover{background:#33ddff;box-shadow:0 0 32px rgba(0,212,255,.45);transform:translateY(-2px)}
.sr-btnoutline{
  font-family:'JetBrains Mono',monospace;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;
  background:transparent;color:#94a3b8;padding:.78rem 2rem;border:1px solid rgba(255,255,255,.12);cursor:pointer;
  transition:all .2s;
}
.sr-btnoutline:hover{border-color:#94a3b8;color:#e2e8f0;transform:translateY(-2px)}
.sr-herotags{display:flex;flex-wrap:wrap;gap:.4rem}
.sr-herotag{font-size:.6rem;letter-spacing:.07em;border:1px solid rgba(0,212,255,.15);padding:.2rem .55rem;color:#334155;background:rgba(0,212,255,.02)}
.sr-scrollhint{
  position:absolute;bottom:1.75rem;left:2rem;
  display:flex;align-items:center;gap:.75rem;
  font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;color:#1e293b;
}
.sr-scrollline{width:44px;height:1px;background:rgba(0,212,255,.12);position:relative;overflow:hidden}
.sr-scrollline::after{content:'';position:absolute;inset:0;background:#00d4ff;transform:translateX(-100%);animation:srscan 2.8s ease-in-out infinite}
@keyframes srscan{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}

/* ══ ABOUT ══ */
.sr-aboutgrid{display:grid;grid-template-columns:1.3fr 1fr;gap:4rem;align-items:start}
.sr-abouttext p{font-size:.8rem;line-height:2;color:#94a3b8;margin-bottom:.9rem}
.sr-abouttext strong{color:#e2e8f0;font-weight:500}
.sr-detailcard{background:rgba(0,212,255,.03);border:1px solid rgba(0,212,255,.1);padding:1.4rem}
.sr-drow{display:flex;justify-content:space-between;align-items:center;padding:.62rem 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:.7rem}
.sr-drow:last-child{border-bottom:none}
.sr-dk{color:#334155;letter-spacing:.07em}
.sr-dv{color:#e2e8f0;text-align:right}
.sr-openbadge{display:inline-flex;align-items:center;gap:.4rem;color:#22c55e;font-size:.62rem;border:1px solid rgba(34,197,94,.25);padding:.15rem .5rem}

/* ══ SKILLS ══ */
.sr-aibanner{
  background:linear-gradient(135deg,rgba(0,212,255,.06),rgba(245,158,11,.04));
  border:1px solid rgba(0,212,255,.14);padding:1.4rem 1.75rem;margin-bottom:2rem;
  display:flex;align-items:center;gap:1.4rem;
}
.sr-aiicon{font-size:2.4rem;flex-shrink:0}
.sr-aitext h3{font-family:'Outfit',sans-serif;font-size:1.05rem;font-weight:700;color:#00d4ff;margin-bottom:.25rem}
.sr-aitext p{font-size:.72rem;color:#475569;line-height:1.65}
.sr-skillsgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1.1rem}
.sr-skillcard{
  background:#0c1220;border:1px solid rgba(255,255,255,.05);
  padding:1.3rem;transition:border-color .3s,transform .3s;
}
.sr-skillcard:hover{border-color:rgba(0,212,255,.3);transform:translateY(-4px);box-shadow:0 8px 32px rgba(0,212,255,.06)}
.sr-skillcat{font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:#f59e0b;margin-bottom:.85rem}
.sr-skillchips{display:flex;flex-wrap:wrap;gap:.4rem}
.sr-chip{font-size:.63rem;padding:.2rem .55rem;background:rgba(0,212,255,.05);border:1px solid rgba(0,212,255,.13);color:#64748b;cursor:default;transition:all .2s}
.sr-chip:hover{background:rgba(0,212,255,.12);color:#00d4ff;border-color:rgba(0,212,255,.4)}

/* ══ EXPERIENCE ══ */
.sr-timeline{padding-left:0}
.sr-expitem{position:relative;padding-left:2.25rem;padding-bottom:2.75rem;border-left:1px solid rgba(0,212,255,.13);transition:border-color .3s}
.sr-expitem:last-child{padding-bottom:0}
.sr-expitem:hover{border-color:rgba(0,212,255,.35)}
.sr-expitem::before{
  content:'';position:absolute;left:-5px;top:0;
  width:9px;height:9px;border:2px solid #00d4ff;border-radius:50%;
  background:#050810;box-shadow:0 0 12px rgba(0,212,255,.5);
}
.sr-expperiod{font-size:.6rem;letter-spacing:.1em;color:#00d4ff;text-transform:uppercase;margin-bottom:.35rem}
.sr-exprole{font-family:'Outfit',sans-serif;font-size:1.25rem;font-weight:700;color:#e2e8f0;margin-bottom:.2rem;line-height:1.2}
.sr-expco{font-size:.7rem;color:#f59e0b;letter-spacing:.05em;margin-bottom:.65rem}
.sr-expdesc{font-size:.75rem;line-height:1.85;color:#64748b}
.sr-exptags{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.65rem}
.sr-exptag{font-size:.58rem;padding:.15rem .48rem;border:1px solid rgba(255,255,255,.06);color:#334155;letter-spacing:.05em}

/* ══ WHY ME ══ */
.sr-whygrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(195px,1fr));gap:1.1rem}
.sr-whycard{
  background:#0c1220;border:1px solid rgba(255,255,255,.05);
  padding:1.4rem;position:relative;overflow:hidden;transition:border-color .3s;
}
.sr-whycard::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,#00d4ff,#f59e0b);
  transform:scaleX(0);transform-origin:left;transition:transform .35s;
}
.sr-whycard:hover{border-color:rgba(0,212,255,.2)}
.sr-whycard:hover::before{transform:scaleX(1)}
.sr-whynum{font-family:'Outfit',sans-serif;font-size:3rem;font-weight:900;color:rgba(0,212,255,.07);line-height:1;margin-bottom:.35rem}
.sr-whytitle{font-family:'Outfit',sans-serif;font-size:.9rem;font-weight:700;color:#e2e8f0;margin-bottom:.4rem}
.sr-whydesc{font-size:.68rem;color:#475569;line-height:1.75}

/* ══ CONTACT ══ */
.sr-cgrid{display:grid;grid-template-columns:1fr 1.5fr;gap:4rem}
.sr-cinfo p{font-size:.78rem;color:#64748b;line-height:1.85;margin-bottom:1.75rem}
.sr-clink{
  display:flex;align-items:center;gap:.75rem;
  font-size:.72rem;color:#475569;text-decoration:none;
  margin-bottom:.85rem;cursor:pointer;transition:color .2s;
}
.sr-clink:hover{color:#00d4ff}
.sr-cicon{
  width:34px;height:34px;border:1px solid rgba(0,212,255,.13);
  display:flex;align-items:center;justify-content:center;
  font-size:.85rem;flex-shrink:0;background:rgba(0,212,255,.03);
  transition:border-color .2s,background .2s;
}
.sr-clink:hover .sr-cicon{border-color:rgba(0,212,255,.4);background:rgba(0,212,255,.07)}
.sr-flabel{display:block;font-size:.6rem;letter-spacing:.13em;text-transform:uppercase;color:#334155;margin-bottom:.4rem}
.sr-finput,.sr-ftextarea{
  width:100%;background:#0c1220;border:1px solid rgba(255,255,255,.07);
  color:#e2e8f0;font-family:'JetBrains Mono',monospace;font-size:.76rem;
  padding:.68rem .9rem;outline:none;transition:border-color .2s,box-shadow .2s;
  margin-bottom:1rem;
}
.sr-finput:focus,.sr-ftextarea:focus{border-color:rgba(0,212,255,.4);box-shadow:0 0 0 1px rgba(0,212,255,.12)}
.sr-ftextarea{resize:none;height:105px}
.sr-btnsend{
  width:100%;font-family:'JetBrains Mono',monospace;font-size:.7rem;letter-spacing:.12em;
  text-transform:uppercase;background:linear-gradient(90deg,#00d4ff,#0099bb);
  color:#050810;padding:.85rem;border:none;cursor:pointer;font-weight:500;
  transition:all .25s;
}
.sr-btnsend:hover:not(:disabled){box-shadow:0 0 32px rgba(0,212,255,.35);transform:translateY(-2px)}
.sr-btnsend:disabled{opacity:.5;cursor:not-allowed;transform:none}
.sr-sentmsg{
  padding:.9rem;border:1px solid rgba(34,197,94,.25);color:#22c55e;
  font-size:.7rem;letter-spacing:.07em;text-align:center;
  background:rgba(34,197,94,.04);line-height:1.6;
}

/* ══ DEPLOY ══ */
.sr-deployintro{font-size:.78rem;color:#64748b;line-height:1.85;max-width:600px;margin-bottom:2.25rem}
.sr-deploygrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(195px,1fr));gap:1.1rem;margin-bottom:2.25rem}
.sr-deploycard{background:#0c1220;border:1px solid rgba(255,255,255,.05);padding:1.3rem;position:relative}
.sr-deploynum{font-family:'Outfit',sans-serif;font-size:2.5rem;font-weight:900;color:rgba(0,212,255,.08);line-height:1}
.sr-deploytitle{font-size:.82rem;font-family:'Outfit',sans-serif;font-weight:700;color:#e2e8f0;margin:.4rem 0 .35rem}
.sr-deploydesc{font-size:.65rem;color:#475569;line-height:1.7}
.sr-deploycmd{background:#050810;border:1px solid rgba(0,212,255,.1);padding:.7rem .9rem;margin-top:.6rem;font-size:.62rem;color:#00d4ff;font-family:'JetBrains Mono',monospace;overflow:auto;white-space:nowrap}
.sr-deploycmd .dim{color:#1e3a4a}
.sr-techpills{display:flex;flex-wrap:wrap;gap:.45rem}
.sr-techpill{font-size:.6rem;padding:.25rem .7rem;border:1px solid rgba(245,158,11,.18);color:#92400e;background:rgba(245,158,11,.04);letter-spacing:.06em}

/* ══ FOOTER ══ */
.sr-footer{
  border-top:1px solid rgba(255,255,255,.05);
  max-width:1060px;margin:0 auto;
  display:flex;justify-content:space-between;align-items:center;
  padding:1.75rem 2rem 5rem;font-size:.62rem;color:#1e293b;letter-spacing:.08em;
}
.sr-flinks{display:flex;gap:1.5rem}
.sr-flinks a,.sr-flinks span{color:#1e293b;text-decoration:none;cursor:pointer;transition:color .2s}
.sr-flinks a:hover,.sr-flinks span:hover{color:#00d4ff}

/* ══ RESPONSIVE ══ */
@media(max-width:800px){
  .sr-navlinks{display:none}
  .sr-aboutgrid{grid-template-columns:1fr;gap:2rem}
  .sr-cgrid{grid-template-columns:1fr;gap:2rem}
  .sr-heroname{font-size:clamp(2.5rem,13vw,5rem)}
  .sr-stat:nth-child(n+4){display:none}
  .sr-footer{flex-direction:column;gap:.75rem;text-align:center;padding-bottom:4rem}
}
@media(max-width:480px){
  .sr-nav{padding:0 1rem}
  #hero{padding-left:1rem;padding-right:1rem}
  .sr-section{padding:4rem 1rem}
}
`;

/* ═══════════════════════════════════════════════════════════
   RESUME DATA
═══════════════════════════════════════════════════════════ */
const SKILLS = [
  { cat: "AI / LLM Stack", items: ["LLM Integration", "RAG Systems", "Prompt Engineering", "Embeddings", "Agent Orchestration", "LangChain", "Vector DBs"] },
  { cat: "Frontend", items: ["React.js", "Angular", "TypeScript", "GraphQL", "HTML5", "CSS3", "Responsive UI"] },
  { cat: "Backend", items: ["Node.js", "Express.js", "PHP", "REST APIs", "JWT Auth", "WebSockets", "Microservices"] },
  { cat: "Databases", items: ["MongoDB", "MySQL", "PostgreSQL", "Redis", "NoSQL Design", "Schema Design"] },
  { cat: "Blockchain", items: ["Smart Contracts", "Solidity", "Web3.js", "DApps", "Ethereum", "Token Standards"] },
  { cat: "DevOps & Tools", items: ["Git / GitHub", "Docker", "Vercel", "Nginx", "Linux", "CI/CD", "Postman"] },
];

const EXPERIENCE = [
  {
    role: "AI Analyst & Full Stack Developer",
    company: "Independent / Freelance",
    period: "2026 – Present",
    desc: "Building AI-powered web applications using LLMs, RAG pipelines, and vector embeddings. Prompting, Chain-of-Thought reasoning. Translating complex business needs into clean, scalable technical architectures.",
    tags: ["SAP/ABAP", "Python", "LLMs", "BigQuery", "RAG", "Vector", "Prompt"],
  },
  {
    role: "Software Engineer — MEAN Stack",
    company: "Orion Innovation",
    period: "2025",
    desc: "Built and shipped multiple client-facing software applications end-to-end. Owned database schema design, REST API development, Angular frontend, Node.js backend, Reactive Forms, and RxJS.",
    tags: ["Angular", "Node.js", "Express", "MongoDB", "RxJS"],
  },
  {
    role: "Full Stack Developer",
    company: "Osiz Technologies",
    period: "2022 – 2024",
    desc: "Developed responsive web applications with TypeScript and JavaScript. Deep dive into blockchain tech, Git workflows, and collaborative cross-team development practices.",
    tags: ["TypeScript", "JavaScript", "Git", "Angular", "Node.js", "Express", "MongoDB", "Bootstrap"],
  },
];

const WHY_ME = [
  { n: "01", t: "AI-Forward Builder", d: "Actively shipping with LLMs, RAG, and orchestration — not just studying, but building real AI products." },
  { n: "02", t: "Full Stack Ownership", d: "From React UI to Node APIs to MongoDB — I own the whole stack and reduce handoff friction." },
  { n: "03", t: "Blockchain Edge", d: "2+ years of Web3/Solidity development gives rare architectural insight into decentralized systems." },
  { n: "04", t: "Rapid Learner", d: "New stack? Give me a week. I embrace new tech with structured enthusiasm and self-directed initiative." },
  { n: "05", t: "Collaborative Spirit", d: "Thrives in team environments. Fosters open communication, knowledge sharing, and positive culture." },
  { n: "06", t: "Code Quality First", d: "Strong problem-solving with meticulous attention to performance, maintainability, and clean architecture." },
];

const TYPEWRITER = [
  "Full Stack Developer (MEAN)",
  "AI / LLM Engineer",
  "Blockchain Developer",
  "Problem Solver",
  "Product Builder",
];

/* ═══════════════════════════════════════════════════════════
   SMART RESUME COMPONENT
═══════════════════════════════════════════════════════════ */
export default function SmartResume() {
  /* ── State ── */
  const [stats, setStats] = useState({ views: 1, downloads: 0, contacts: 0 });
  const [bumping, setBumping] = useState({});
  const [toasts, setToasts] = useState([]);
  const [activeSection, setActiveSection] = useState("hero");
  const [scrolled, setScrolled] = useState(false);
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cMsg, setCMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const toastId = useRef(0);

  /* ── Inject CSS + Fonts ── */
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);
    return () => { try { document.head.removeChild(link); document.head.removeChild(style); } catch {} };
  }, []);

  /* ── Welcome toast ── */
  useEffect(() => {
    const t = setTimeout(() => pushToast("Glad you clicked 😊 it’s worth your time 👋 let`s connect if something catches your eye 😉", "✦", "default"), 1600);
    return () => clearTimeout(t);
  }, []);

  /* ── Typewriter effect ── */
  useEffect(() => {
    const role = TYPEWRITER[roleIdx];
    let timer;
    if (isTyping) {
      if (displayed.length < role.length) {
        timer = setTimeout(() => setDisplayed(role.slice(0, displayed.length + 1)), 52);
      } else {
        timer = setTimeout(() => setIsTyping(false), 1800);
      }
    } else {
      if (displayed.length > 0) {
        timer = setTimeout(() => setDisplayed(d => d.slice(0, -1)), 28);
      } else {
        setRoleIdx(i => (i + 1) % TYPEWRITER.length);
        setIsTyping(true);
      }
    }
    return () => clearTimeout(timer);
  }, [displayed, isTyping, roleIdx]);

  /* ── Scroll tracking ── */
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 30);
      const secs = ["hero","about","skills","experience","why","contact","deploy"];
      for (const id of [...secs].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 130) { setActiveSection(id); break; }
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* ── Intersection observer for scroll reveals ── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("vis"); }),
      { threshold: 0.1 }
    );
    const els = document.querySelectorAll(".sr-reveal,.sr-rleft,.sr-rright");
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });

  /* ── Helpers ── */
  const pushToast = useCallback((msg, icon = "✦", type = "default") => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, msg, icon, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }, []);

  const bumpStat = (key) => {
    setBumping(b => ({ ...b, [key]: true }));
    setTimeout(() => setBumping(b => ({ ...b, [key]: false })), 600);
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleDownload = () => {
    setStats(s => {
      const next = s.downloads + 1;
      pushToast(`Resume downloaded — ${next} total download${next > 1 ? "s" : ""}`, "⬇", "amber");
      bumpStat("downloads");
      return { ...s, downloads: next };
    });
    // Swap the comment below with your actual PDF in production:
    // window.open('/rooby-regupathy-resume.pdf', '_blank');
  };

  const handleContact = async () => {
    if (!cName || !cEmail || !cMsg) { pushToast("Please fill all fields.", "⚠", "amber"); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1400));
    setStats(s => {
      const next = s.contacts + 1;
      pushToast(`Message from ${cName} received! I'll reply soon ✓`, "✉", "green");
      bumpStat("contacts");
      return { ...s, contacts: next };
    });
    setSent(true); setSending(false);
    setCName(""); setCEmail(""); setCMsg("");
    setTimeout(() => setSent(false), 6000);
  };

  const navItems = [
    { id: "hero", label: "Home" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Exp" },
    { id: "why", label: "Why Me" },
    { id: "contact", label: "Contact" },
    { id: "deploy", label: "Deploy" },
  ];

  /* ══════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Backgrounds ── */}
      <div className="sr-gridbg" />
      <div className="sr-orb sr-orb1" />
      <div className="sr-orb sr-orb2" />
      <div className="sr-orb sr-orb3" />

      {/* ── Toast Stack ── */}
      <div className="sr-toaststack">
        {toasts.map(t => (
          <div key={t.id} className={`sr-toast ${t.type}`}>
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>{t.icon}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* ── Nav ── */}
      <nav className={`sr-nav${scrolled ? " scrolled" : ""}`}>
        <div className="sr-logo" onClick={() => scrollTo("hero")}>
          Rooby<span>.</span>
        </div>
        <ul className="sr-navlinks">
          {navItems.map(n => (
            <li key={n.id} className={activeSection === n.id ? "active" : ""} onClick={() => scrollTo(n.id)}>
              {n.label}
            </li>
          ))}
        </ul>
        <button className="sr-navbtn" onClick={handleDownload}>↓ Resume</button>
      </nav>

      {/* ══════════════════════════════════════════════════════
          PAGE CONTENT
      ══════════════════════════════════════════════════════ */}
      <div className="sr-page">

        {/* ╔══ HERO ══════════════════════════════════════════╗ */}
        <section id="hero">
          <div className="sr-herochip">
            <span className="sr-livedot" />
            Open to opportunities
          </div>
          <h1 className="sr-heroname">
            Rooby <span className="acc">Regupathy</span>
          </h1>
          <p className="sr-herorole">
            AI Analyst &amp; Full Stack Engineer — MEAN Stack · Blockchain · LLMs
          </p>
          <div className="sr-typerow">
            <span className="sr-typepre">&gt;_</span>
            <span className="sr-typetext">{displayed}</span>
            <span className="sr-cursor" />
          </div>
          <div className="sr-heroctas">
            <button className="sr-btnprimary" onClick={() => scrollTo("contact")}>Let's Talk →</button>
            <button className="sr-btnoutline" onClick={handleDownload}>↓ Resume PDF</button>
            <button className="sr-btnoutline" onClick={() => scrollTo("skills")}>View Skills</button>
          </div>
          <div className="sr-herotags">
            {["React","Node.js","MongoDB","LLMs","RAG","Blockchain","GraphQL","Angular","Solidity","Docker"].map(t => (
              <span key={t} className="sr-herotag">{t}</span>
            ))}
          </div>
          <div className="sr-scrollhint">
            <div className="sr-scrollline" />
            Scroll to explore
          </div>
        </section>

        {/* ╔══ ABOUT ═════════════════════════════════════════╗ */}
        <section id="about" className="sr-section">
          <div className="sr-reveal">
            <div className="sr-eyebrow">01 — About</div>
            <h2 className="sr-h2">Experienced <span className="c1">Developer</span>,<br />Evolving <span className="c2">AI Engineer</span></h2>
            <div className="sr-rule" />
          </div>
          <div className="sr-aboutgrid">
            <div className="sr-rleft">
              <div className="sr-abouttext">
                <p>I'm an <strong>AI Analyst and Full Stack Developer</strong> with a proven track record in building innovative and scalable web applications. Currently deep in the AI space — working hands-on with <strong>LLMs, RAG pipelines, prompt engineering, and orchestration frameworks</strong>.</p>
                <p>With <strong>2–3 years of MEAN stack experience</strong>, I've shipped real products across blockchain, web apps, and APIs. I'm a rare bridge between traditional full-stack engineering and modern AI capabilities — able to architect systems that are both technically sound and intelligently augmented.</p>
                <p>I analyze business needs, translate them into technical requirements, and deliver <strong>high-quality, efficient code</strong>. I thrive in collaborative environments and bring genuine enthusiasm to every new stack or challenge.</p>
              </div>
            </div>
            <div className="sr-rright">
              <div className="sr-detailcard">
                {[
                  ["Focus", "AI + Full Stack"],
                  ["Experience", "2–3 Years"],
                  ["Stack", "MEAN + AI/LLMs"],
                  ["Blockchain", "2+ Years"],
                  ["Location", "India"],
                  ["Languages", "JS · TS · PHP"],
                  ["Status", <span key="s" className="sr-openbadge"><span style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block"}} />Open to Work</span>],
                ].map(([k, v]) => (
                  <div key={k} className="sr-drow">
                    <span className="sr-dk">{k}</span>
                    <span className="sr-dv">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ╔══ SKILLS ════════════════════════════════════════╗ */}
        <section id="skills" className="sr-section">
          <div className="sr-reveal">
            <div className="sr-eyebrow">02 — Technical Skills</div>
            <h2 className="sr-h2">My <span className="c1">Stack</span></h2>
            <div className="sr-rule" />
          </div>
          <div className="sr-reveal">
            <div className="sr-aibanner">
              <div className="sr-aiicon">🤖</div>
              <div className="sr-aitext">
                <h3>Currently Evolving into AI Engineering</h3>
                <p>Hands-on with LLMs, RAG pipelines, vector embeddings, prompt engineering, and agent orchestration. Building real AI-powered products — not just studying theory.</p>
              </div>
            </div>
          </div>
          <div className="sr-skillsgrid">
            {SKILLS.map((s, i) => (
              <div key={s.cat} className="sr-skillcard sr-reveal" style={{ transitionDelay: `${i * 0.07}s` }}>
                <div className="sr-skillcat">{s.cat}</div>
                <div className="sr-skillchips">
                  {s.items.map(item => <span key={item} className="sr-chip">{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ╔══ EXPERIENCE ════════════════════════════════════╗ */}
        <section id="experience" className="sr-section">
          <div className="sr-reveal">
            <div className="sr-eyebrow">03 — Experience</div>
            <h2 className="sr-h2">Work <span className="c1">Timeline</span></h2>
            <div className="sr-rule" />
          </div>
          <div className="sr-timeline">
            {EXPERIENCE.map((e, i) => (
              <div key={e.role} className="sr-expitem sr-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="sr-expperiod">{e.period}</div>
                <div className="sr-exprole">{e.role}</div>
                <div className="sr-expco">{e.company}</div>
                <div className="sr-expdesc">{e.desc}</div>
                <div className="sr-exptags">
                  {e.tags.map(t => <span key={t} className="sr-exptag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ╔══ WHY ME ════════════════════════════════════════╗ */}
        <section id="why" className="sr-section">
          <div className="sr-reveal">
            <div className="sr-eyebrow">04 — Why Choose Me</div>
            <h2 className="sr-h2">What I <span className="c2">Bring</span></h2>
            <div className="sr-rule" />
          </div>
          <div className="sr-whygrid">
            {WHY_ME.map((w, i) => (
              <div key={w.n} className="sr-whycard sr-reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="sr-whynum">{w.n}</div>
                <div className="sr-whytitle">{w.t}</div>
                <div className="sr-whydesc">{w.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ╔══ CONTACT ═══════════════════════════════════════╗ */}
        <section id="contact" className="sr-section">
          <div className="sr-reveal">
            <div className="sr-eyebrow">05 — Get in Touch</div>
            <h2 className="sr-h2">Let's <span className="c1">Work</span> Together</h2>
            <div className="sr-rule" />
          </div>
          <div className="sr-cgrid">
            {/* Left: info */}
            <div className="sr-rleft">
              <div className="sr-cinfo">
                <p>Open to full-time roles, freelance projects, and AI/blockchain collaborations. I typically respond within 24 hours. Looking forward to hearing from you.</p>
              </div>
              <a href="mailto:rooby.dev22@gmail.com" className="sr-clink" target="_blank" rel="noreferrer">
                <div className="sr-cicon">✉</div>
                rooby.dev22@gmail.com
              </a>
              <a href="https://www.linkedin.com/in/roobyregupathy" className="sr-clink" target="_blank" rel="noreferrer">
                <div className="sr-cicon" style={{fontSize:".7rem",fontWeight:700}}>in</div>
                linkedin.com/in/roobyregupathy
              </a>
              <div className="sr-clink">
                <div className="sr-cicon">📞</div>
                +91 8610669798
              </div>
              <div style={{marginTop:"1.5rem",padding:"1rem 1.1rem",background:"rgba(0,212,255,.03)",border:"1px solid rgba(0,212,255,.1)",fontSize:".68rem",color:"#334155",lineHeight:1.7}}>
                <span style={{color:"#00d4ff",letterSpacing:".1em",textTransform:"uppercase",fontSize:".58rem"}}>Note for Production</span><br/>
                Wire up a real email via <span style={{color:"#f59e0b"}}>Formspree</span> or <span style={{color:"#f59e0b"}}>EmailJS</span> (both free). Replace the handleContact function with a fetch POST to your endpoint.
              </div>
            </div>

            {/* Right: form */}
            <div className="sr-rright">
              {sent ? (
                <div className="sr-sentmsg">
                  ✓ Message sent successfully!<br/>
                  I'll reply to you within 24 hours.<br/>
                  Looking forward to connecting, {cName || "friend"}!
                </div>
              ) : (
                <>
                  <div className="sr-form-group">
                    <label className="sr-flabel">Your Name</label>
                    <input className="sr-finput" value={cName} onChange={e => setCName(e.target.value)} placeholder="Jane Smith" />
                  </div>
                  <div className="sr-form-group">
                    <label className="sr-flabel">Email Address</label>
                    <input className="sr-finput" type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} placeholder="jane@company.com" />
                  </div>
                  <div className="sr-form-group">
                    <label className="sr-flabel">Message</label>
                    <textarea className="sr-ftextarea" value={cMsg} onChange={e => setCMsg(e.target.value)} placeholder="Tell me about the role or project…" />
                  </div>
                  <button className="sr-btnsend" onClick={handleContact} disabled={sending}>
                    {sending ? "Sending…" : "Send Message →"}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ╔══ DEPLOY GUIDE ══════════════════════════════════╗ */}
        <section id="deploy" className="sr-section">
          <div className="sr-reveal">
            <div className="sr-eyebrow">06 — Ship It Live</div>
            <h2 className="sr-h2">Deploy <span className="c1">Guide</span></h2>
            <div className="sr-rule" />
            <p className="sr-deployintro">
              Take this Smart Resume from demo to a live site with your own domain in under 30 minutes — using entirely free tools. Here's the exact path.
            </p>
          </div>
          <div className="sr-deploygrid">
            {[
              { n:"01", t:"Export & Setup", d:"Download this React source. Add your real resume PDF at /public/resume.pdf. Customize name, data, and colors.", cmd:"npm create vite@latest smart-resume -- --template react" },
              { n:"02", t:"Push to GitHub", d:"Initialize git, commit everything, push to a new GitHub repo. This becomes your source of truth.", cmd:"git init && git add . && git push origin main" },
              { n:"03", t:"Deploy on Vercel", d:"Connect your GitHub repo at vercel.com. Every git push auto-deploys. Free forever on the Hobby plan.", cmd:"npx vercel --prod" },
              { n:"04", t:"Custom Domain", d:"Buy a .dev or .io domain (~₹800/yr on Namecheap). Add it in Vercel dashboard. HTTPS is automatic.", cmd:"vercel domains add yourname.dev" },
              { n:"05", t:"Real Contact Form", d:"Sign up at formspree.io (free, 50 msgs/mo). Replace handleContact with a fetch POST to your endpoint.", cmd:"fetch('https://formspree.io/f/YOUR_ID', {method:'POST'})" },
              { n:"06", t:"Persistent Analytics", d:"Add Supabase free tier for real view/download counters that persist across all visitors — not just per session.", cmd:"npm install @supabase/supabase-js" },
            ].map(s => (
              <div key={s.n} className="sr-deploycard sr-reveal">
                <div className="sr-deploynum">{s.n}</div>
                <div className="sr-deploytitle">{s.t}</div>
                <div className="sr-deploydesc">{s.d}</div>
                <div className="sr-deploycmd"><span className="dim">$ </span>{s.cmd}</div>
              </div>
            ))}
          </div>
          <div className="sr-reveal">
            <div style={{fontSize:".6rem",color:"#334155",letterSpacing:".14em",textTransform:"uppercase",marginBottom:".75rem"}}>
              Full Production Tech Stack
            </div>
            <div className="sr-techpills">
              {["React + Vite","Express.js","MongoDB Atlas","Vercel (Frontend)","Render (Backend)","Formspree (Email)","Supabase (Analytics)","Namecheap (Domain)","OneSignal (Notifications)","GitHub Actions (CI/CD)"].map(t => (
                <span key={t} className="sr-techpill">{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="sr-footer">
          <div>© 2025 Rooby Regupathy · portfolio </div>
          <div className="sr-flinks">
            <a href="mailto:rooby.dev22@gmail.com">Email</a>
            <a href="https://www.linkedin.com/in/roobyregupathy" target="_blank" rel="noreferrer">LinkedIn</a>
            <span onClick={handleDownload}>Resume PDF</span>
          </div>
        </footer>

      </div>{/* end sr-page */}

      {/* ╔══ STATS BAR (fixed bottom) ══════════════════════╗ */}
      <div className="sr-statsbar">
        <div className="sr-stat">
          <span>👁</span>
          <span className="sr-stat-lbl">Views</span>
          <span className={`sr-stat-val${bumping.views ? " bump" : ""}`}>{stats.views}</span>
        </div>
        <div className="sr-stat">
          <span>⬇</span>
          <span className="sr-stat-lbl">Downloads</span>
          <span className={`sr-stat-val${bumping.downloads ? " bump" : ""}`}>{stats.downloads}</span>
        </div>
        <div className="sr-stat">
          <span>✉</span>
          <span className="sr-stat-lbl">Messages</span>
          <span className={`sr-stat-val${bumping.contacts ? " bump" : ""}`}>{stats.contacts}</span>
        </div>
        <div className="sr-liverow">
          <div className="sr-livedot" />
          <span className="sr-livelbl">LIVE</span>
        </div>
        <div className="sr-barright">rooby.dev22@gmail.com · linkedin.com/in/roobyregupathy</div>
      </div>
    </>
  );
}