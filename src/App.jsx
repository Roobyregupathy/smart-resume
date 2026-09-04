import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import "./global.css";
import emailjs from '@emailjs/browser';
import { createClient } from '@supabase/supabase-js';

/* ═══════════════════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════════════════ */
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
);
const EJS = {
    service: import.meta.env.VITE_EJS_SERVICE,
    template: import.meta.env.VITE_EJS_TEMPLATE,
    pubKey: import.meta.env.VITE_EJS_PUBKEY,
};
const UPI_ID = import.meta.env.VITE_UPI_ID;
const UPI_NAME = import.meta.env.VITE_UPI_NAME;
const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
/* ═══════════════════════════════════════════════════════════
   MAIL MIDDLEWARE
   Centralised — call sendMail(type, payload) anywhere
   Types: "contact" | "view_notify" | "download_notify"
═══════════════════════════════════════════════════════════ */
const sendMail = async (type, payload = {}, emailActionsEnabled = true) => {
    if (!emailActionsEnabled) return;

    const templates = {
        // Someone filled the contact form
        contact: {
            title: "📩 New Contact Message — Portfolio",
            name: payload.name || "Unknown",
            email: payload.email || "—",
            time: new Date().toLocaleString(),
            message: payload.message || "—",
        },
        // Someone viewed the resume
        view_notify: {
            title: payload.visitorEmail 
            ? `👁 Resume Viewed by ${payload.visitorEmail}` 
            : `👁 New Resume View (#${payload.count})`,
            name: payload.hrName || "System Notification",
            email: payload.visitorEmail || "roobyrmb@gmail.com",
            time: new Date().toLocaleString(),
            message: `Your resume was just viewed!
                      Total views so far: ${payload.count}
                      Visitor Email: ${payload.visitorEmail || "Organic / Public View"}
                      Visitor Name: ${payload.hrName || "Organic / Public View"}
                      Location: ${payload.location || "Unknown"}
                      IP: ${payload.ip || "—"}`,
        },
        // Someone downloaded the resume
        download_notify: {
            title: "⬇ Resume Downloaded!",
            name: "System Notification",
            email: "roobyrmb@gmail.com",
            time: new Date().toLocaleString(),
            message: `Someone downloaded your resume!\nTotal downloads so far: ${payload.count}`,
        },
    };

    try {
        await emailjs.send(EJS.service, EJS.template, templates[type], EJS.pubKey);
    } catch (err) {
        console.warn(`[sendMail] ${type} failed:`, err);
    }
};

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
        role: "Freelance AI Analyst Consultant",
        company: "Independent / Freelance",
        desc: "Building AI-powered web applications using LLMs, RAG pipelines, and vector embeddings. Prompting, Chain-of-Thought reasoning. Translating complex business needs into clean, scalable technical architectures.",
        tags: ["SAP/ABAP", "Python", "LLMs", "BigQuery", "RAG", "Vector", "Prompt"],
    },
    {
        role: "Software Engineer — MEAN Stack",
        company: "Orion Innovation",
        desc: "Built and shipped multiple client-facing software applications end-to-end. Owned database schema design, REST API development, Angular frontend, Node.js backend, Reactive Forms, and RxJS.",
        tags: ["Angular", "Node.js", "Express", "MongoDB", "RxJS"],
    },
    {
        role: "Full Stack Developer",
        company: "Osiz Technologies",
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
    "Freelancer",
    "Consultant",
    "Full Stack Developer",
    "AI Analyst",
    "Blockchain Developer",
    "Problem Solver",
    "Product Builder",
];

/* ═══════════════════════════════════════════════════════════
   SMART RESUME COMPONENT
═══════════════════════════════════════════════════════════ */
export default function SmartResume() {
    /* ── State ── */
    const [stats, setStats] = useState({ views: 0, downloads: 0, contacts: 0 });
    const [emailActionsEnabled, setEmailActionsEnabled] = useState(() => {
        if (!isLocalhost) return true;
        return window.localStorage.getItem("smart-resume-email-actions") === "true";
    });
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
    const [showCoffee, setShowCoffee] = useState(false);
    const [coffeeAmt, setCoffeeAmt] = useState(99);     // ← add
    const [coffeeCustom, setCoffeeCustom] = useState(false);  // ← add
    const [coffeeNote, setCoffeeNote] = useState("");      // ← add
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState([
        { role: "assistant", text: "Hi! I'm Rooby's AI Assistant. Ask me anything about her experience, projects, skills, or how to get in touch." }
    ]);
    const [chatTyping, setChatTyping] = useState(false);
    const chatRef = useRef(null);
    const toastId = useRef(0);
    const upiLink = (amt) => `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amt}&cu=INR&tn=${encodeURIComponent(coffeeNote ? `${coffeeNote} | Support Rooby ☕` : "Support Rooby ☕")}`;
    const gpayLink = (amt) => `tez://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amt}&cu=INR&tn=${encodeURIComponent(coffeeNote ? `${coffeeNote} | Support Rooby ☕` : "Support Rooby ☕")}`;
    const phonepeLink = (amt) => `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amt}&cu=INR&tn=${encodeURIComponent(coffeeNote ? `${coffeeNote} | Support Rooby ☕` : "Support Rooby ☕")}`;
    /* ── Load fonts before paint ── */
    useLayoutEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap";
        document.head.appendChild(link);
        return () => { try { document.head.removeChild(link); } catch { } };
    }, []);

    /* ── Disable Inspect Element & Image Open in New Tab ── */
    useEffect(() => {
        // Disable right-click context menu
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+C
        const handleKeyDown = (e) => {
            if (
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && e.key === "I") ||
                (e.ctrlKey && e.shiftKey && e.key === "C") ||
                (e.ctrlKey && e.shiftKey && e.key === "K")
            ) {
                e.preventDefault();
                return false;
            }
        };

        // Prevent image dragging and context menu on images
        const handleImageEvents = (e) => {
            if (e.target.tagName === "IMG") {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("dragstart", handleImageEvents);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("dragstart", handleImageEvents);
        };
    }, []);



    /* ── Welcome toast ── */
    useEffect(() => {
        const t = setTimeout(() =>
            pushToast("Glad you clicked 😊 it's worth your time 👋 let's connect if something catches your eye 😉", "✦", "default")
            , 900); // ✅ fixed: was [',k'] — must be a number
        return () => clearTimeout(t);
    }, []);

    /* ── Track view + notify ── */
    useEffect(() => {
        const trackView = async () => {
            try {
                // 🎯 Extract URL Query Parameters safely
                const urlParams = new URLSearchParams(window.location.search);
                const visitorEmail = urlParams.get('ref_email') || null;
                const visitorName = urlParams.get('hr_name') || null;
                const { data } = await supabase
                    .from('counted').select('*').eq('id', 1).single();
                if (data) {
                    const newViews = data.views + 1;
                    await supabase.from('counted').update({ views: newViews }).eq('id', 1);
                    setStats(s => ({ ...s, views: newViews, downloads: data.downloads, contacts: data.contacts }));
                    // 🌍 Get visitor location
                    let locationStr = "Unknown";
                    let ip = "Unknown";

                    try {
                        const res = await fetch("https://ipapi.co/json/");
                        const loc = await res.json();

                        locationStr = `${loc.city}, ${loc.region}, ${loc.country_name}`;
                        ip = loc.ip;
                    } catch (locErr) {
                        console.warn("[location]", locErr);
                    }
                    // 📧 Notify you by email on every view                    
                    await sendMail("view_notify", {
                        count: newViews,
                        location: locationStr,
                        ip: ip,
                        visitorEmail: visitorEmail,
                        hrName: visitorName

                    }, emailActionsEnabled);
                    if (visitorEmail) {    
                            
                        const scriptUrl = "https://script.google.com/macros/s/AKfycbyzWhifFAOSKUlCuKwaY9CRMIx8h9CjybI4y3WUWgCEpHmlCNJZzI0ru-J_opB0dH9L/exec";
                        fetch(`${scriptUrl}?ref_email=${encodeURIComponent(visitorEmail)}&hr_name=${encodeURIComponent(visitorName)}`, {
                            mode: 'no-cors' // Allows cross-origin background execution
                        }).catch(err => console.warn("[appsScript]", err));
                    }
                }
            } catch (err) {
                console.warn("[trackView]", err);
            }
        };
        trackView();
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
            const secs = ["hero", "about", "skills", "experience", "why", "contact", "deploy"];
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

    const getChatReply = (message) => {
        const text = message.trim().toLowerCase();
        const contactTriggers = ["contact", "hiring", "hire", "freelance", "consulting", "collaboration", "resume", "how can i", "how do i", "get in touch", "freelance work", "hiring inquiries"];
        const aboutTriggers = ["tell me about rooby", "who is rooby", "about rooby", "about Her", "who are you", "what do you do"];
        const techTriggers = ["technologies", "tech stack", "works with", "stack", "tools", "languages", "frameworks", "what technologies"];
        const projectsTriggers = ["projects", "built", "what projects", "work on", "portfolio projects", "examples"];
        const aiTriggers = ["ai agents", "agents", "ai agent", "llm", "rag", "chatbot", "artificial intelligence", "ai"];
        const experienceTriggers = ["experience", "work experience", "career", "background", "show me his experience", "resume request"];
        const chatTriggers = ["hi", "hello", "helo", "hey"];

        if (contactTriggers.some(trigger => text.includes(trigger))) {
            return { type: "contact", text: "You can contact Rooby directly by" };
        }
        if (chatTriggers.some(trigger => text.includes(trigger))) {
            return "Hi! 👋. How can I help you today?" ;
        }
        if (aboutTriggers.some(trigger => text.includes(trigger))) {
            return "Rooby is an AI Analyst and Full Stack Engineer with experience building AI-powered web applications, blockchain solutions, and developer portfolios. She combines full-stack engineering with modern AI capabilities.";
        }
        if (techTriggers.some(trigger => text.includes(trigger))) {
            return "Rooby works with React, Angular, TypeScript, GraphQL, Node.js, Express, PHP, REST APIs, MongoDB, MySQL, PostgreSQL, Redis, Solidity, Ethereum, Web3, Docker, LLMs, RAG, embeddings, prompt engineering, and vector search.";
        }
        if (projectsTriggers.some(trigger => text.includes(trigger))) {
            return "She has built AI-powered web applications, blockchain applications, full-stack products, and modern developer portfolios. She also develops AI chatbots and RAG-based solutions.";
        }
        if (aiTriggers.some(trigger => text.includes(trigger))) {
            return "Yes — Rooby works with AI agents and is building AI chatbots, using Gemini/OpenAI, RAG pipelines, vector search, and agent orchestration.";
        }
        if (experienceTriggers.some(trigger => text.includes(trigger))) {
            return "Rooby has worked as a Freelance AI Analyst Consultant, a Software Engineer on the MEAN Stack at Orion Innovation, and a Full Stack Developer at Osiz Technologies.";
        }
        return "I don't see that information on Rooby's portfolio yet. You can contact her directly for more details.";
    };

    const addChatMessage = (message) => {
        setChatMessages((current) => [...current, message]);
    };

    const handleSendChat = () => {
        if (!chatInput.trim()) return;
        const userText = chatInput.trim();
        addChatMessage({ role: "user", text: userText });
        setChatInput("");
        setChatTyping(true);
        setTimeout(() => {
            addChatMessage({ role: "assistant", text: getChatReply(userText) });
            setChatTyping(false);
        }, 900);
    };

    useEffect(() => {
        if (chatOpen || chatMessages.length) {
            chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [chatMessages, chatOpen]);

    /* ── Download + notify ── */
    const handleDownload = async () => {
        try {
            const { data } = await supabase
                .from('counted').select('downloads').eq('id', 1).single();
            const newDownloads = data.downloads + 1;
            await supabase.from('counted').update({ downloads: newDownloads }).eq('id', 1);
            setStats(s => ({ ...s, downloads: newDownloads }));
            pushToast(`Resume downloaded — ${newDownloads} total download${newDownloads > 1 ? "s" : ""}`, "⬇", "amber");
            bumpStat("downloads");
            // 📧 Notify you by email on every download
            await sendMail("download_notify", { count: newDownloads }, emailActionsEnabled);
        } catch (err) {
            console.warn("[handleDownload]", err);
        }
        // Force download
        const link = document.createElement('a');
        link.href = '/Rooby_SE_26.pdf';
        link.download = 'Rooby_Regupathy_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Also open in new tab
        window.open('/Rooby_SE_26.pdf', '_blank');
    };

    /* ── Contact form + notify ── */
    const handleContact = async () => {
        if (!cName || !cEmail || !cMsg) {
            pushToast("Please fill all fields.", "⚠", "amber");
            return;
        }
        setSending(true);
        try {
            // 📧 Send contact message to you via EmailJS
            await sendMail("contact", { name: cName, email: cEmail, message: cMsg }, emailActionsEnabled);
            // Update contacts count in Supabase
            const { data } = await supabase
                .from('counted').select('contacts').eq('id', 1).single();
            const newContacts = (data?.contacts || 0) + 1;
            await supabase.from('counted').update({ contacts: newContacts }).eq('id', 1);
            setStats(s => ({ ...s, contacts: newContacts }));
            bumpStat("contacts");
            setSent(true);
            pushToast(`Message from ${cName} received! I'll reply soon ✓`, "✉", "green");
            setCName(""); setCEmail(""); setCMsg("");
            setTimeout(() => setSent(false), 6000);
        } catch (err) {
            pushToast("Failed to send. Try again.", "⚠", "amber");
            console.warn("[handleContact]", err);
        }
        setSending(false);
    }
    const handleEmailActionsToggle = (event) => {
        const enabled = event.target.checked;
        setEmailActionsEnabled(enabled);
        window.localStorage.setItem("smart-resume-email-actions", String(enabled));
    };

    const navItems = [
        { id: "hero", label: "Home" },
        { id: "about", label: "About" },
        { id: "skills", label: "Skills" },
        { id: "experience", label: "Exp" },
        { id: "why", label: "Why Me" },
        { id: "deploy", label: "Services" },
        { id: "contact", label: "Contact" },
    ];

    /* ══════════════════════════════════════════════════════ */
    return (
        <>
            {/* ── Floating Code Background ── */}
            <div className="sr-codebg">
                {[
                    { t: `const model = new LLM("gpt-4");`, l: "0%", d: "0s", dur: "28s", c: "rgba(0,212,255,.18)" },
                    { t: `await rag.query(vectorStore, prompt);`, l: "18%", d: "3s", dur: "22s", c: "rgba(0,212,255,.12)" },
                    { t: `SELECT * FROM analytics WHERE views > 0;`, l: "28%", d: "6s", dur: "20s", c: "rgba(245,158,11,.15)" },
                    { t: `git commit -m "shipped to prod 🚀"`, l: "38%", d: "1.5s", dur: "25s", c: "rgba(0,212,255,.1)" },
                    { t: `const chain = new RAGChain(embeddings);`, l: "50%", d: "9s", dur: "19s", c: "rgba(245,158,11,.12)" },
                    { t: `npm run build && vercel --prod`, l: "0%", d: "4s", dur: "23s", c: "rgba(0,212,255,.14)" },
                    { t: `web3.eth.sendTransaction({ to, value });`, l: "72%", d: "7s", dur: "21s", c: "rgba(139,92,246,.18)" },
                    { t: `if (score > 0.85) return embedding.match;`, l: "82%", d: "2s", dur: "24s", c: "rgba(0,212,255,.1)" },
                    { t: `const prompt = \`Chain-of-Thought: \${q}\``, l: "0%", d: "12s", dur: "20s", c: "rgba(245,158,11,.1)" },
                    { t: `docker build -t portfolio . && deploy`, l: "44%", d: "15s", dur: "22s", c: "rgba(0,212,255,.08)" },
                    { t: `import { RAG, LLM } from "@ai/core";`, l: "56%", d: "5s", dur: "26s", c: "rgba(139,92,246,.14)" },
                    { t: `supabase.from("counted").update(views)`, l: "90%", d: "10s", dur: "18s", c: "rgba(0,212,255,.12)" },
                    { t: `const nft = await contract.mint(address);`, l: "33%", d: "8s", dur: "24s", c: "rgba(245,158,11,.14)" },
                    { t: `embeddings.similarity(v1, v2) > threshold`, l: "76%", d: "13s", dur: "21s", c: "rgba(0,212,255,.1)" },
                ].map((line, i) => (
                    <div
                      key={i}
                      className="sr-codeline"
                      style={{
                        "--line-left": line.l,
                        "--line-delay": line.d,
                        "--line-duration": line.dur,
                        "--line-color": line.c,
                      }}
                    >
                        {line.t}
                    </div>
                ))}
            </div>

            {/* ── Toast Stack ── */}
            <div className="sr-toaststack">
                {toasts.map(t => (
                    <div key={t.id} className={`sr-toast ${t.type}`}>
                        <span className="sr-toast-icon">{t.icon}</span>
                        <span>{t.msg}</span>
                    </div>
                ))}
            </div>
            {/* ☕ UPI PAYMENT POPUP */}
            {showCoffee && (
                <div className="sr-coffee-backdrop" onClick={() => setShowCoffee(false)}>
                    <div className="sr-coffee-modal" onClick={e => e.stopPropagation()}>

                        {/* ── Close ── */}
                        <button className="sr-coffee-close" onClick={() => setShowCoffee(false)}>✕</button>

                        {/* ── Title ── */}
                        <div className="sr-coffee-emoji">☕</div>
                        <div className="sr-coffee-title">
                            Pay Rooby Regupathy
                        </div>

                        {/* ── UPI ID row ── */}
                        <div className="sr-coffee-upirow">
                            <span className="sr-coffee-upi">{UPI_ID}</span>
                            <button className="sr-coffee-copybtn" onClick={() => { navigator.clipboard.writeText(UPI_ID); pushToast("UPI ID copied!", "📋", "default"); }}>Copy ID</button>
                        </div>

                        {/* ── QR Code (live from UPI amount) ── */}
                        <div className="sr-coffee-qrwrap">
                            <img
                                className="sr-coffee-qr"
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink(coffeeAmt || 99))}`}
                                alt="UPI QR"
                                width={180} height={180}
                            />
                        </div>

                        {/* ── Quick amount buttons ── */}
                        <div className="sr-coffee-amounts">
                            {[99, 299, 499, "Custom"].map((a) => (
                                <button key={a} className={`sr-coffee-amount-btn${coffeeAmt === a ? " active" : ""}`} onClick={() => {
                                    if (a === "Custom") { setCoffeeAmt(""); setCoffeeCustom(true); }
                                    else { setCoffeeAmt(a); setCoffeeCustom(false); }
                                }}>
                                    {a === "Custom" ? "Custom\nAmount" : `₹${a}`}
                                </button>
                            ))}
                        </div>

                        {/* ── Custom amount input ── */}
                        {coffeeCustom && (
                            <input
                                className="sr-coffee-custom-input"
                                type="number"
                                placeholder="Enter amount in ₹ (min ₹50)"
                                value={coffeeAmt}
                                onChange={e => {
                                    const val = Number(e.target.value);
                                    if (val < 50 && e.target.value !== "") {
                                        pushToast("Minimum amount is ₹50", "⚠", "amber");
                                        setCoffeeAmt(50);
                                    } else {
                                        setCoffeeAmt(val);
                                    }
                                }}
                                onBlur={e => {
                                    if (e.target.value && Number(e.target.value) < 50) {
                                        setCoffeeAmt(50);
                                    }
                                }}
                            />
                        )}

                        {/* ── Leave a note ── */}
                        <input
                            className="sr-coffee-note"
                            type="text"
                            placeholder="Leave a note (optional)"
                            value={coffeeNote}
                            onChange={e => setCoffeeNote(e.target.value)}
                        />

                        {/* ── Pay button / app links ── */}
                        <div className="sr-coffee-links">
                            {[
                                { name: "GPay", href: gpayLink(coffeeAmt || 99), color: "#4285F4" },
                                { name: "PhonePe", href: phonepeLink(coffeeAmt || 99), color: "#5f259f" },
                                { name: "Any UPI", href: upiLink(coffeeAmt || 99), color: "#f59e0b" },
                            ].map(btn => (
                                <a key={btn.name} href={btn.href} className="sr-coffee-link" style={{ "--sr-link-color": btn.color, "--sr-link-border": `${btn.color}40` }}>{btn.name}</a>
                            ))}
                        </div>

                        <div className="sr-coffee-secure">
                            Secure UPI · No fees · Instant transfer
                        </div>
                    </div>
                </div>
            )}
            {/* ── Nav ── */}
            <nav className={`sr-nav${scrolled ? " scrolled" : ""}`}>
                <div className="sr-logo" onClick={() => scrollTo("hero")}>
                    Rooby<span>.</span>
                </div>
                <ul className="sr-navlinks">
                    {navItems.map(n => (
                        <li
                            key={n.id}
                            className={activeSection === n.id ? "active" : ""}
                            onClick={() => (n.id !== "contact" ? scrollTo(n.id) : scrollTo(n.id))}
                        >
                            {n.id === "contact" ? (
                                <div className="sr-navcontact-wrap">
                                    <span className="sr-navcontact-label">{n.label}</span>
                                    <div className="sr-navcontact-pop" aria-label="Contact options">
                                        <a href="mailto:rooby.dev22@gmail.com" className="sr-navcontact-link email" aria-label="Email">
                                            ✉
                                        </a>
                                        <a href="https://www.linkedin.com/in/roobyregupathy" target="_blank" rel="noreferrer" className="sr-navcontact-link linkedin" aria-label="LinkedIn">
                                            in
                                        </a>
                                        <a href="https://wa.me/918610669798" target="_blank" rel="noreferrer" className="sr-navcontact-link whatsapp" aria-label="WhatsApp">
                                            WA
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                n.label
                            )}
                        </li>
                    ))}
                </ul>
                <div className="sr-navactions">
                    {isLocalhost && (
                        <label className="sr-email-switch" title="Enable or disable outgoing email actions">
                            <input
                                type="checkbox"
                                checked={emailActionsEnabled}
                                onChange={handleEmailActionsToggle}
                            />
                            <span className="sr-switch-track" aria-hidden="true"><span /></span>
                            <span>Email</span>
                        </label>
                    )}
                    <button className="sr-navbtn" onClick={handleDownload}>↓ Resume</button>
                </div>
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
                        AI Analyst &amp; Full Stack Engineer · Blockchain · LLMs
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
                        {["React", "Node.js", "MongoDB", "LLMs", "RAG", "Blockchain", "GraphQL", "Angular", "Solidity", "Docker"].map(t => (
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
                        <div className="sr-eyebrow">About</div>
                        <h2 className="sr-h2">Experienced <span className="c1">Developer</span>,<br />Evolving <span className="c2">AI Engineer</span></h2>
                        <div className="sr-rule" />
                    </div>
                    <div className="sr-aboutgrid">
                        <div className="sr-rleft">
                            <div className="sr-abouttext">
                                <p>I'm an <strong>AI Analyst and Full Stack Developer</strong> with a proven track record in building innovative and scalable web applications. Currently deep in the AI space — working hands-on with <strong>LLMs, RAG pipelines, prompt engineering, and orchestration frameworks</strong>.</p>
                                <p>With <strong>2–3 years of Full stack experience</strong>, I've shipped real products across blockchain, web apps, and APIs. I'm a rare bridge between traditional full-stack engineering and modern AI capabilities — able to architect systems that are both technically sound and intelligently augmented.</p>
                                <p>I analyze business needs, translate them into technical requirements, and deliver <strong>high-quality, efficient code</strong>. I thrive in collaborative environments and bring genuine enthusiasm to every new stack or challenge.</p>
                            </div>
                        </div>
                        <div className="sr-rright">
                            <div className="sr-detailcard">
                                {[
                                    ["Focus", "AI & Full Stack Engineering"],
                                    ["Experience", "3 Years"],
                                    ["Stack", "LLMs • SAP/ABAP • Python • SQL • MEAN/MERN"],
                                    ["Additional", "Blockchain"],
                                    ["Location", "Remote • Worldwide"],
                                    ["Status", <span key="s" className="sr-openbadge"><span className="sr-status-dot" />Available for Freelance & Consulting Projects</span>],
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
                        <div className="sr-eyebrow">Technical Skills</div>
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
                            <div key={s.cat} className="sr-skillcard sr-reveal" style={{ "--delay": `${i * 0.07}s` }}>
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
                        <div className="sr-eyebrow">Career</div>
                        <h2 className="sr-h2">Work <span className="c1">Experience</span></h2>
                        <div className="sr-rule" />
                    </div>
                    <div className="sr-timeline">
                        {EXPERIENCE.map((e, i) => (
                            <div key={e.role} className="sr-expitem sr-reveal" style={{ "--delay": `${i * 0.1}s` }}>
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
                        <div className="sr-eyebrow">Why Choose Me</div>
                        <h2 className="sr-h2">What I <span className="c2">Bring</span></h2>
                        <div className="sr-rule" />
                    </div>
                    <div className="sr-whygrid">
                        {WHY_ME.map((w, i) => (
                            <div key={w.n} className="sr-whycard sr-reveal" style={{ "--delay": `${i * 0.08}s` }}>
                                <div className="sr-whynum">{w.n}</div>
                                <div className="sr-whytitle">{w.t}</div>
                                <div className="sr-whydesc">{w.d}</div>
                            </div>
                        ))}
                    </div>
                </section>
                {/* ╔══ DEPLOY GUIDE ══════════════════════════════════╗ */}
                <section id="deploy" className="sr-section">
                    <div className="sr-reveal">
                        <div className="sr-eyebrow">Bring Your Ideas to Life</div>
                        <h2 className="sr-h2">What I <span className="c1">Build</span></h2>
                        <div className="sr-rule" />
                        <p className="sr-deployintro">
                            This entire portfolio is fully functional 😉.
                        </p>
                    </div>
                    <div className="sr-deploygrid">
                        {[
                            {
                                n: "01",
                                t: "Need a Modern Developer Portfolio Like This?",
                                d: "I build premium portfolio websites with responsive UI, smooth animations, resume integration, and deployment support.",
                                cmd: "Create Your Presence"
                            },

                            {
                                n: "02",
                                t: "AI Chatbots & Agents",
                                d: "I develop custom AI chatbots using Gemini, OpenAI, RAG pipelines, vector search, and intelligent automation workflows.",
                                cmd: "Scale with AI"
                            },

                            {
                                n: "03",
                                t: "Launching Brands on the Web",
                                d: "Helping startups, creators, and businesses build a powerful digital presence with modern full stack applications, responsive websites, dashboards, authentication systems, and cloud deployment.",
                                cmd: "Launch Your Brand"
                            },

                        ].map(s => (
                            <div key={s.n} className="sr-deploycard sr-reveal">
                                <div className="sr-deploynum">{s.n}</div>
                                <div className="sr-deploytitle">{s.t}</div>
                                <div className="sr-deploydesc">{s.d}</div>
                                <div className="sr-deploycmd"><span className="dim"># </span>{s.cmd}</div>
                            </div>
                        ))}
                    </div>

                </section>

                {/* ╔══ CONTACT ═══════════════════════════════════════╗ */}
                <section id="contact" className="sr-section">
                    <div className="sr-reveal">
                        <div className="sr-eyebrow">Get in Touch</div>
                        <h2 className="sr-h2">Let's <span className="c1">Work</span> Together</h2>
                        <div className="sr-rule" />
                    </div>
                    <div className="sr-cgrid">
                        {/* Left: info */}
                        <div className="sr-rleft">
                            <div className="sr-contactrow">
                                <a href="mailto:rooby.dev22@gmail.com" className="sr-contactcircle" aria-label="Email">
                                    <div className="sr-circleicon email">
                                    <svg width="127px" height="127px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#4061e2"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M44 35V9H24H4V23V37H26" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path> <circle cx="35" cy="35" r="9" fill="#4791e1" stroke="#ffffff" stroke-width="4"></circle> <path d="M37 33L33 37" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4 9L24 22L44 9" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                    </div>
                                    
                                </a>
                                <a href="https://www.linkedin.com/in/roobyregupathy" target="_blank" rel="noreferrer" className="sr-contactcircle" aria-label="LinkedIn">
                                    <div className="sr-circleicon linkedin sr-contact-linkedin">in</div>
                                    
                                </a>
                                <a href="https://wa.me/918610669798" target="_blank" rel="noreferrer" className="sr-contactcircle" aria-label="WhatsApp">
                                    <div className="sr-circleicon whatsapp">
                                        
                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                                            <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path><path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"></path><path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"></path><path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path><path fill="#fff" fill-rule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clip-rule="evenodd"></path>
                                        </svg>
                                    </div>
                                    
                                </a>
                            </div>

                            <div className="sr-cinfo">
                                <p>Open to full-time roles, freelance and AI. I typically respond within 24 hours. Looking forward to Collab.</p>
                            </div>
                            {/* <a href="mailto:rooby.dev22@gmail.com" className="sr-clink" target="_blank" rel="noreferrer">
                                <div className="sr-cicon">✉</div>
                                rooby.dev22@gmail.com
                            </a>
                            <a href="https://www.linkedin.com/in/roobyregupathy" className="sr-clink" target="_blank" rel="noreferrer">
                                <div className="sr-cicon" style={{ fontSize: ".7rem", fontWeight: 700 }}>in</div>
                                linkedin.com/in/roobyregupathy
                            </a> */}
                            
                            <div className="sr-support-block">
                                <span className="sr-support-kicker">
                                    Support My Work
                                </span>
                                <br />
                                Enjoyed this portfolio ? <br />
                                You can support my journey with a coffee,
                                Every contribution helps me build more creative projects.
                                <br />
                                <a href="#" className="sr-support-link" onClick={e => { e.preventDefault(); setShowCoffee(true); }}>
                                    → ☕ Buy Me a Coffee 
                                </a>
                            </div>
                            {/* <div style={{marginTop:"1.5rem",padding:"1rem 1.1rem",background:"rgba(0,212,255,.03)",border:"1px solid rgba(0,212,255,.1)",fontSize:".68rem",color:"#334155",lineHeight:1.7}}>
                <span style={{color:"#00d4ff",letterSpacing:".1em",textTransform:"uppercase",fontSize:".58rem"}}>Note for Production</span><br/>
                Wire up a real email via <span style={{color:"#f59e0b"}}>Formspree</span> or <span style={{color:"#f59e0b"}}>EmailJS</span> (both free). Replace the handleContact function with a fetch POST to your endpoint.
              </div> */}
                        </div>

                        {/* Right: form */}
                        <div className="sr-rright">
                            {sent ? (
                                <div className="sr-sentmsg">
                                    ✓ Message sent successfully!<br />
                                    I'll reply to you within 24 hours.<br />
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


                {/* ── Footer ── */}
                <footer className="sr-footer">
                    <div>© 2025 Rooby Regupathy · portfolio </div>
                    <div className="sr-flinks">
                        <a href="mailto:rooby.dev22@gmail.com">Email</a>
                        <a href="https://www.linkedin.com/in/roobyregupathy" target="_blank" rel="noreferrer">LinkedIn</a>
                        <a href="https://wa.me/918610669798" target="_blank" rel="noreferrer">WhatsApp</a>
                        <span onClick={handleDownload}>Resume</span>
                    </div>
                </footer>

            </div>{/* end sr-page */}

            <div className="chat-widget">
                <button className="chat-float-btn" onClick={() => setChatOpen(open => !open)} aria-label="Open chat with Rooby's assistant">
                    <img src="/rooby_dp.jpg" alt="Rooby avatar" className="chat-float-avatar" />
                </button>
                <div className={`chat-panel${chatOpen ? " open" : ""}`}>
                    <div className="chat-header">
                        <img src="/rooby_dp.jpg" alt="Rooby avatar" className="chat-avatar" />
                        <div className="chat-title">
                            <strong>Rooby's AI Assistant</strong>
                            <span>Ask about experience, skills, or contact info.</span>
                        </div>
                        <button className="chat-close" onClick={() => setChatOpen(false)}>✕</button>
                    </div>
                    <div className="chat-body" ref={chatRef}>
                        {chatMessages.map((msg, idx) => (
                            <div key={`${msg.role}-${idx}`} className={`chat-message ${msg.role}`}>
                                {typeof msg.text === "string" ? (
                                    msg.text.split("\n").map((line, i) => <div key={i}>{line}</div>)
                                ) : msg.text.type === "contact" ? (
                                    <div>
                                        <div className="sr-chat-contact-text">{msg.text.text}</div>
                                        <div className="sr-chat-contact-row">
                                            <a href="mailto:rooby.dev22@gmail.com" className="sr-chat-contact-btn email">
                                                <span>✉</span> Email
                                            </a>
                                            <a href="https://www.linkedin.com/in/roobyregupathy" target="_blank" rel="noreferrer" className="sr-chat-contact-btn linkedin">
                                                <span>in</span> LinkedIn
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        ))}
                        {chatTyping && (
                            <div className="chat-typing">
                                <div className="chat-dots"><span /><span /><span /></div>
                                Typing...
                            </div>
                        )}
                    </div>
                    <div className="chat-input-row">
                        <input
                            className="chat-input"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                            placeholder="Ask about Rooby's work, skills, or contact options..."
                        />
                        <button className="chat-send" onClick={handleSendChat}>Send</button>
                    </div>
                </div>
            </div>

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