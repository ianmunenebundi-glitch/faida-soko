import { useState, useEffect, useRef } from "react";

const KES = (amount) => `KES ${Number(amount).toLocaleString()}`;
const USD = (amount) => `$${(amount / 130).toFixed(2)}`;

const PACKAGES = [
  { id: 1, name: "Social Media Starter", price: 15000, type: "Monthly", rating: 4.5, reviews: 34, features: ["3 Platforms Managed", "12 Posts/Month", "Basic Analytics", "Community Management"], badge: null },
  { id: 2, name: "Digital Marketing Pro", price: 35000, type: "Monthly", rating: 4.9, reviews: 87, features: ["All Platforms", "30 Posts/Month", "Advanced Analytics", "Google Ads", "SEO Included", "Monthly Report"], badge: "Most Popular" },
  { id: 3, name: "E-commerce Website Setup", price: 75000, type: "One-time", rating: 4.8, reviews: 52, features: ["Custom Design", "M-Pesa Integration", "Up to 200 Products", "Mobile Optimised", "1 Year Support"] },
  { id: 4, name: "SEO Optimisation", price: 25000, type: "Monthly", rating: 4.6, reviews: 41, features: ["Keyword Research", "On-page SEO", "Link Building", "Monthly Report", "Google Search Console"] },
  { id: 5, name: "Complete Brand Identity", price: 50000, type: "One-time", rating: 4.7, reviews: 29, features: ["Logo Design", "Brand Guide", "Business Cards", "Social Templates", "Unlimited Revisions"] },
  { id: 6, name: "Digital Marketing Consultation", price: 5000, type: "One-time", rating: 5.0, reviews: 118, features: ["90-min Session", "Strategy Roadmap", "Competitor Analysis", "Action Plan PDF"] },
];

const SERVICES = [
  { icon: "📱", title: "Social Media Marketing", desc: "Grow your brand across Facebook, Instagram, TikTok & LinkedIn with data-driven content strategies tailored for Kenyan audiences." },
  { icon: "🔍", title: "SEO Optimisation", desc: "Rank higher on Google Kenya. We optimise your website to attract organic traffic that converts to real customers." },
  { icon: "💻", title: "Web Development", desc: "Beautiful, fast, mobile-first websites with M-Pesa integration, built for Kenya's digital economy." },
  { icon: "📣", title: "Google Ads / PPC", desc: "Targeted pay-per-click campaigns that reach Kenyan consumers at the right moment with maximum ROI." },
  { icon: "✍️", title: "Content Creation", desc: "Compelling copy, graphics, and video content that tells your brand story in Swahili and English." },
  { icon: "🎨", title: "Branding & Design", desc: "Complete brand identity packages — from logo to guidelines — that position your business for success." },
];

const TESTIMONIALS = [
  { name: "Amina Wanjiku", company: "Wanjiku Boutique, Westlands", text: "FAIDA SOKO transformed our Instagram presence. We went from 200 to 8,000 followers in 4 months and sales doubled!", stars: 5 },
  { name: "Peter Kamau", company: "Kamau Agro Supplies, Nakuru", text: "Their Google Ads campaign brought us clients from as far as Mombasa. Best marketing investment we've ever made.", stars: 5 },
  { name: "Grace Otieno", company: "Otieno Law Associates, CBD", text: "Professional, responsive, and results-driven. Our website now generates 30+ leads per month through SEO.", stars: 5 },
];

const HOSTING_PLANS = [
  { name: "Starter", price: 999, features: ["1 Website", "5GB Storage", "Free SSL", "Daily Backups", "Anti-Malware"] },
  { name: "Basic", price: 1999, features: ["3 Websites", "15GB Storage", "Free SSL", "Daily Backups", "Anti-Malware", "Email Hosting"], popular: true },
  { name: "Power", price: 3499, features: ["10 Websites", "50GB Storage", "Free SSL", "Daily Backups", "Anti-Malware", "Email Hosting", "Priority Support"] },
  { name: "Business", price: 6999, features: ["Unlimited Websites", "200GB Storage", "Free SSL", "Daily Backups", "Anti-Malware", "Email Hosting", "24/7 Support", "Free Domain"] },
];

const DOMAIN_EXTS = [".co.ke", ".ke", ".com", ".africa", ".org"];

function Stars({ n }) {
  return <span style={{ color: "#f59e0b", fontSize: 14 }}>{"★".repeat(Math.floor(n))}{"☆".repeat(5 - Math.floor(n))}</span>;
}

function Nav({ page, setPage, cart, currency, setCurrency, lang, setLang }) {
  const [cartOpen, setCartOpen] = useState(false);
  const links = [
    { id: "home", label: lang === "sw" ? "Nyumbani" : "Home" },
    { id: "services", label: lang === "sw" ? "Huduma" : "Services" },
    { id: "shop", label: lang === "sw" ? "Duka" : "Shop" },
    { id: "agrisoko", label: "AgriSoko" },
    { id: "hosting", label: "Hosting" },
    { id: "domains", label: "Domains" },
    { id: "contact", label: lang === "sw" ? "Wasiliana" : "Contact" },
  ];
  const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(2,62,45,0.97)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", height: 64, gap: 16 }}>
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#22c55e,#15803d)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 16 }}>FS</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>FAIDA SOKO</span>
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {links.map(l => (
            <button key={l.id} onClick={() => setPage(l.id)}
              style={{ background: page === l.id ? "rgba(34,197,94,0.15)" : "none", border: "none", color: page === l.id ? "#22c55e" : "rgba(255,255,255,0.75)", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s" }}>
              {l.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setCurrency(c => c === "KES" ? "USD" : "KES")}
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            {currency}
          </button>
          <button onClick={() => setLang(l => l === "en" ? "sw" : "en")}
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
            🌍 {lang === "en" ? "EN" : "SW"}
          </button>
          <button onClick={() => setCartOpen(true)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 20, position: "relative", padding: 4 }}>
            🛒
            {cart.length > 0 && <span style={{ position: "absolute", top: -2, right: -2, background: "#22c55e", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{cart.length}</span>}
          </button>
          <button onClick={() => setPage("account")}
            style={{ background: "#22c55e", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Sign In
          </button>
        </div>
      </div>
      {cartOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.5)" }} onClick={() => setCartOpen(false)}>
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 360, background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.15)", padding: "2rem 1.5rem", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Your Cart</h2>
              <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>
            {cart.length === 0 ? <p style={{ color: "#888" }}>Your cart is empty.</p> :
              cart.map((item, i) => (
                <div key={i} style={{ borderBottom: "1px solid #eee", padding: "12px 0", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{item.type}</p>
                  </div>
                  <p style={{ margin: 0, fontWeight: 700, color: "#15803d" }}>{currency === "KES" ? KES(item.price) : USD(item.price)}</p>
                </div>
              ))}
            {cart.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span>Subtotal</span><span style={{ fontWeight: 700 }}>{currency === "KES" ? KES(total) : USD(total)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, color: "#888", fontSize: 13 }}>
                  <span>VAT (16%)</span><span>{currency === "KES" ? KES(total * 0.16) : USD(total * 0.16)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18, borderTop: "2px solid #eee", paddingTop: 12 }}>
                  <span>Total</span><span style={{ color: "#15803d" }}>{currency === "KES" ? KES(total * 1.16) : USD(total * 1.16)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function HomePage({ setPage, currency, lang }) {
  const hero = lang === "sw"
    ? { h: "Kukua Kidijitali Kenya", sub: "Tunasaidia biashara za Kenya kukua mtandaoni na mikakati ya kisasa ya masoko ya kidijitali.", cta: "Anza Sasa" }
    : { h: "Kenya's Premier Digital Marketing Agency", sub: "We help Kenyan businesses grow online with data-driven strategies, M-Pesa integrations, and locally crafted campaigns that convert.", cta: "Get Started" };

  return (
    <div>
      <section style={{ minHeight: "100vh", background: "linear-gradient(135deg,#022c22 0%,#052e16 40%,#14532d 100%)", display: "flex", alignItems: "center", padding: "6rem 1.5rem 4rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(34,197,94,0.12) 0%,transparent 70%)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", padding: "6px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: "1.5rem" }}>🇰🇪 Built for Kenya's Digital Future</div>
            <h1 style={{ color: "#fff", fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 1.5rem", letterSpacing: "-1px" }}>{hero.h}</h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, lineHeight: 1.7, marginBottom: "2rem" }}>{hero.sub}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => setPage("shop")} style={{ background: "#22c55e", color: "#fff", border: "none", padding: "14px 28px", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>{hero.cta} →</button>
              <button onClick={() => setPage("contact")} style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "14px 28px", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Book Consultation</button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "6rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 900, margin: "0 0 3rem", color: "#111" }}>Services Designed for Kenyan Businesses</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
            {SERVICES.map(s => (
              <div key={s.title} style={{ padding: "2rem", border: "1px solid #e5e7eb", borderRadius: 16 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <h3 style={{ margin: "0 0 8px", fontWeight: 700, color: "#111" }}>{s.title}</h3>
                <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.6, fontSize: 15 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "6rem 1.5rem", background: "#f0fdf4" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 900, margin: "0 0 3rem", color: "#111" }}>Real Results from Real Kenyan Businesses</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: "#fff", borderRadius: 16, padding: "2rem" }}>
                <Stars n={t.stars} />
                <p style={{ color: "#374151", lineHeight: 1.7, margin: "12px 0 20px", fontSize: 15 }}>\'{t.text}\'</p>
                <p style={{ margin: 0, fontWeight: 700, color: "#111" }}>{t.name}</p>
                <p style={{ margin: 0, color: "#15803d", fontSize: 13 }}>{t.company}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ShopPage({ addToCart, currency }) {
  return (
    <div style={{ padding: "8rem 1.5rem 5rem", background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, margin: "0 0 0.5rem", color: "#111" }}>Service Packages</h1>
        <p style={{ color: "#6b7280", marginBottom: "3rem", fontSize: 18 }}>Choose the right package to grow your Kenyan business online.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 24 }}>
          {PACKAGES.map(pkg => (
            <div key={pkg.id} style={{ background: "#fff", borderRadius: 16, padding: "2rem", border: pkg.badge ? "2px solid #22c55e" : "1px solid #e5e7eb" }}>
              {pkg.badge && <div style={{ position: "absolute", top: -12, left: 24, background: "#22c55e", color: "#fff", padding: "3px 16px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>⭐ {pkg.badge}</div>}
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: 17, color: "#111" }}>{pkg.name}</h3>
              <p style={{ margin: "12px 0", fontSize: 28, fontWeight: 900, color: "#15803d" }}>{currency === "KES" ? KES(pkg.price) : USD(pkg.price)}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => addToCart(pkg)} style={{ flex: 1, padding: "10px", border: "2px solid #22c55e", borderRadius: 8, background: "#fff", color: "#15803d", fontWeight: 700, cursor: "pointer" }}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgriSokoPage({ currency }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#052e16,#14532d)", padding: "8rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ color: "#fff", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, margin: "0 0 1rem" }}>AgriSoko — Connect Farmers to Global Markets</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 18 }}>Smart digital marketing solutions for Kenyan farmers and agricultural businesses.</p>
      </div>
    </div>
  );
}

function HostingPage({ currency }) {
  return (
    <div style={{ minHeight: "100vh", padding: "8rem 1.5rem", background: "#f9fafb" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, margin: "0 0 0.5rem", color: "#111" }}>Fast, Reliable Kenyan Hosting</h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>DirectAdmin-powered hosting with 99.9% uptime, free SSL, and Kenyan support.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
          {HOSTING_PLANS.map(plan => (
            <div key={plan.name} style={{ background: "#fff", borderRadius: 16, padding: "2rem", border: "1px solid #e5e7eb" }}>
              <h3 style={{ margin: "0 0 8px", fontWeight: 800, color: "#111" }}>{plan.name}</h3>
              <p style={{ margin: "0 0 16px", fontSize: 26, fontWeight: 900, color: "#15803d" }}>{currency === "KES" ? KES(plan.price) : USD(plan.price)}</p>
              {plan.features.map(f => <p key={f} style={{ margin: "6px 0", fontSize: 14, color: "#374151" }}>✅ {f}</p>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DomainsPage() {
  const [query, setQuery] = useState("");
  return (
    <div style={{ minHeight: "100vh", padding: "8rem 1.5rem", background: "#f9fafb" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, margin: "0 0 0.5rem", color: "#111" }}>Find Your Perfect Domain</h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>Register .co.ke, .ke, .com, .africa and more.</p>
        <div style={{ display: "flex", gap: 8, marginBottom: "2rem" }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter domain name"
            style={{ flex: 1, padding: "16px 20px", border: "2px solid #e5e7eb", borderRadius: 12, fontSize: 16 }} />
          <button style={{ background: "#22c55e", color: "#fff", border: "none", padding: "16px 28px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Search</button>
        </div>
      </div>
    </div>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email) return;
    
    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (response.ok) {
        setSent(true);
        setTimeout(() => setSent(false), 3000);
        setForm({ name: "", email: "", phone: "", message: "" });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "8rem 1.5rem", background: "#f9fafb" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 900, margin: "0 0 1rem", color: "#111" }}>Let's Grow Your Business</h1>
          <p style={{ color: "#6b7280", lineHeight: 1.7 }}>Our Kenyan digital marketing experts are ready to help.</p>
        </div>
        
        <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem" }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
              <h2 style={{ color: "#15803d" }}>Message Received!</h2>
            </div>
          ) : (
            <div>
              <h2 style={{ margin: "0 0 1.5rem", fontWeight: 800 }}>Send Us a Message</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[["name", "Full Name"], ["email", "Email"], ["phone", "Phone"]].map(([field, ph]) => (
                  <input key={field} placeholder={ph} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{ padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 15 }} />
                ))}
                <textarea placeholder="Message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={5} style={{ padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 10 }} />
                <button onClick={submit} style={{ background: "#22c55e", color: "#fff", border: "none", padding: "14px", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Send Message →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AccountPage() {
  return (
    <div style={{ minHeight: "100vh", padding: "8rem 1.5rem", background: "#f9fafb" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontWeight: 900, color: "#111", fontSize: 26 }}>Account</h1>
        <p style={{ color: "#6b7280" }}>Welcome to your FAIDA SOKO account dashboard.</p>
      </div>
    </div>
  );
}

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ from: "bot", text: "Hi! I'm FAIDA Bot 🤖. How can I help?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs(m => [...m, { from: "user", text: userMsg }]);
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("authToken") || ""}` },
        body: JSON.stringify({ message: userMsg, conversationHistory: msgs }),
      });
      
      const data = await response.json();
      setMsgs(m => [...m, { from: "bot", text: data.reply || "Sorry, I couldn't process that." }]);
    } catch {
      setMsgs(m => [...m, { from: "bot", text: "Connection issue. Try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(o => !o)}
        style={{ position: "fixed", bottom: 24, left: 24, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#15803d)", border: "none", color: "#fff", fontSize: 26, cursor: "pointer", zIndex: 999 }}>
        {open ? "✕" : "🤖"}
      </button>
      {open && (
        <div style={{ position: "fixed", bottom: 92, left: 24, width: 340, height: 480, background: "#fff", borderRadius: 20, boxShadow: "0 16px 48px rgba(0,0,0,0.15)", zIndex: 999, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg,#022c22,#15803d)", padding: "16px 20px" }}>
            <p style={{ margin: 0, color: "#fff", fontWeight: 700 }}>FAIDA Bot</p>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: "16px", background: m.from === "user" ? "#22c55e" : "#f3f4f6", color: m.from === "user" ? "#fff" : "#111" }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div style={{ padding: "10px" }}>Typing...</div>}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask..."
              style={{ flex: 1, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10 }} />
            <button onClick={send} style={{ background: "#22c55e", color: "#fff", border: "none", width: 40, borderRadius: 10, cursor: "pointer" }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function FaidaSoko() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart") || "[]"));
  const [page, setPage] = useState("home");
  const [currency, setCurrency] = useState("KES");
  const [lang, setLang] = useState("en");

  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);

  const addToCart = (item) => { setCart(c => [...c, item]); };

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage setPage={setPage} currency={currency} lang={lang} />;
      case "shop": return <ShopPage addToCart={addToCart} currency={currency} />;
      case "agrisoko": return <AgriSokoPage currency={currency} />;
      case "hosting": return <HostingPage currency={currency} />;
      case "domains": return <DomainsPage />;
      case "contact": return <ContactPage />;
      case "account": return <AccountPage />;
      default: return <HomePage setPage={setPage} currency={currency} lang={lang} />;
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: "100vh" }}>
      <Nav page={page} setPage={setPage} cart={cart} currency={currency} setCurrency={setCurrency} lang={lang} setLang={setLang} />
      <main style={{ paddingTop: 64 }}>
        {renderPage()}
      </main>
      <a href="https://wa.me/254723032756" target="_blank" rel="noreferrer"
        style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, zIndex: 999, textDecoration: "none" }}>
        💬
      </a>
      <Chatbot />
    </div>
  );
}