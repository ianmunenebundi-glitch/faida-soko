import { useEffect, useRef, useState } from "react";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "./src/firebase.js";
import { useAuth } from "./src/AuthContext.jsx";
import AuthModal from "./src/AuthModal.jsx";

const KES = (amount) => `KES ${Number(amount).toLocaleString()}`;
const USD = (amount) => `$${(amount / 130).toFixed(2)}`;

const BLUE = "#1d4ed8";
const NAVY = "#0f172a";
const GOLD = "#f59e0b";
const GREEN = "#16a34a";
const RED = "#dc2626";

const PACKAGES = [
  { id: 1, name: "Social Media Starter", price: 15000, type: "Monthly", rating: 4.5, reviews: 34, features: ["3 Platforms Managed", "12 Posts/Month", "Basic Analytics", "Community Management"], badge: null },
  { id: 2, name: "Digital Marketing Pro", price: 35000, type: "Monthly", rating: 4.9, reviews: 87, features: ["All Platforms", "30 Posts/Month", "Advanced Analytics", "Google Ads", "SEO Included", "Monthly Report"], badge: "Most Popular" },
  { id: 3, name: "E-commerce Website Setup", price: 75000, type: "One-time", rating: 4.8, reviews: 52, features: ["Custom Design", "M-Pesa Integration", "Up to 200 Products", "Mobile Optimised", "1 Year Support"] },
  { id: 4, name: "SEO Optimisation", price: 25000, type: "Monthly", rating: 4.6, reviews: 41, features: ["Keyword Research", "On-page SEO", "Link Building", "Monthly Report", "Google Search Console"] },
  { id: 5, name: "Complete Brand Identity", price: 50000, type: "One-time", rating: 4.7, reviews: 29, features: ["Logo Design", "Brand Guide", "Business Cards", "Social Templates", "Unlimited Revisions"] },
  { id: 6, name: "Digital Marketing Consultation", price: 5000, type: "One-time", rating: 5.0, reviews: 118, features: ["90-min Session", "Strategy Roadmap", "Competitor Analysis", "Action Plan PDF"] },
  { id: 7, name: "Custom Software Development", price: 150000, type: "One-time", rating: 5.0, reviews: 21, features: ["Requirements Analysis", "Custom Build", "M-Pesa Integration", "Testing & QA", "12 Months Support"] },
  { id: 8, name: "Mobile App Development", price: 200000, type: "One-time", rating: 4.9, reviews: 14, features: ["Android & iOS", "Custom UI/UX Design", "M-Pesa & Push Notifications", "App Store Submission", "6 Months Support"] },
];

const SERVICES = [
  { icon: "💻", title: "Software Development", subtitle: "Custom Business Software Built for Kenya", desc: "We build powerful, scalable software solutions tailored to your exact business needs.", details: ["Business Management Systems", "M-Pesa & Payment Integration", "Inventory & POS Systems", "Custom ERP & CRM Solutions"], category: "tech" },
  { icon: "📱", title: "Mobile App Development", subtitle: "Android & iOS Apps That Work for Your Business", desc: "From idea to App Store — we design and develop mobile apps that your customers will love.", details: ["Android & iOS Development", "M-Pesa & USSD Integration", "Offline-First PWA Apps", "App Store Submission & Support"], category: "tech" },
  { icon: "🌐", title: "Web Development", subtitle: "Fast, Secure, High-Converting Websites", desc: "Modern websites and web applications that convert visitors into paying customers.", details: ["WordPress & Custom Sites", "E-commerce with M-Pesa", "Web Apps & Dashboards", "SEO-Friendly & Mobile-First"], category: "tech" },
  { icon: "🔍", title: "Search Engine Optimization (SEO)", subtitle: "Rank #1 on Google – Drive Organic Traffic", desc: "Dominate local search results and reach more Kenyan customers.", details: ["Keyword Research & Strategy", "On-Page & Technical SEO", "Local SEO & Google Business", "Monthly Performance Reports"], category: "marketing" },
  { icon: "📱", title: "Social Media Marketing (SMM)", subtitle: "Dominate Facebook, Instagram, TikTok & LinkedIn", desc: "Build a strong social presence and engage your audience.", details: ["Custom Content Strategy", "Ads Management & Growth Hacking", "Influencer Collaborations", "Analytics & Engagement Reports"], category: "marketing" },
  { icon: "📣", title: "Digital Advertising (PPC & Meta Ads)", subtitle: "Convert Scrollers into Buyers", desc: "High-converting ad campaigns that deliver measurable ROI.", details: ["Google Ads", "Facebook/Instagram Ads", "A/B Testing", "Retargeting Campaigns"], category: "marketing" },
  { icon: "✍️", title: "Content Creation", subtitle: "Engaging Content That Sells", desc: "Strategic content that drives engagement and conversions.", details: ["Blog Writing", "Video Scripts", "Infographics & eBooks", "SEO-Optimized Articles"], category: "marketing" },
  { icon: "📸", title: "Creative Photography & Videography", subtitle: "Stunning Visuals for Your Brand", desc: "Professional visual content that captures your brand essence.", details: ["Product Photography", "Promo Videos & Reels", "Drone Shots & Editing", "Branded Stock Libraries"], category: "creative" },
  { icon: "🎨", title: "Graphic Design", subtitle: "Logos, Banners & Branding That Stand Out", desc: "Professional designs that make your brand memorable.", details: ["Logo & Brand Identity", "Social Media Graphics", "Print & Packaging Design", "Animated Ads"], category: "creative" },
  { icon: "🌍", title: "Domain Registration", subtitle: "Secure Your Perfect Domain Name", desc: "Register .co.ke, .com, .africa and more with instant setup.", details: ["13+ Domain Extensions", "Pricing from KSh 1,500", "FREE .ke Domain Transfers", "Instant Domain Activation"], category: "hosting" },
  { icon: "🖥️", title: "Web Hosting", subtitle: "Reliable Hosting with Free SSL", desc: "Fast, secure hosting with free .co.ke domain support.", details: ["Free SSL", "99.9% Uptime", "DirectAdmin Control Panel", "24/7 Expert Support"], category: "hosting" },
];

const TESTIMONIALS = [
  { name: "Amina Wanjiku", company: "Wanjiku Boutique, Westlands", text: "FAIDA SOKO transformed our Instagram presence. We gained more visibility and stronger customer engagement.", stars: 5 },
  { name: "Peter Kamau", company: "Kamau Agro Supplies, Nakuru", text: "Their digital strategy helped us reach more customers and improve our online sales pipeline.", stars: 5 },
  { name: "Grace Otieno", company: "Otieno Law Associates, CBD", text: "Professional, responsive and results-driven. Our website now generates better business inquiries.", stars: 5 },
];

const HOSTING_PLANS = [
  { name: "Starter", price: 999, features: ["1 Website", "5GB Storage", "Free SSL", "Daily Backups", "Anti-Malware"] },
  { name: "Basic", price: 1999, features: ["3 Websites", "15GB Storage", "Free SSL", "Daily Backups", "Anti-Malware", "Email Hosting"], popular: true },
  { name: "Power", price: 3499, features: ["10 Websites", "50GB Storage", "Free SSL", "Daily Backups", "Anti-Malware", "Email Hosting", "Priority Support"] },
  { name: "Business", price: 6999, features: ["Unlimited Websites", "200GB Storage", "Free SSL", "Daily Backups", "Anti-Malware", "Email Hosting", "24/7 Support", "Free Domain"] },
];

function Stars({ n }) {
  return <span style={{ color: GOLD, fontSize: 14 }}>{"★".repeat(Math.floor(n))}{"☆".repeat(5 - Math.floor(n))}</span>;
}

async function saveOrderToFirestore(user, order) {
  if (!user) throw new Error("Please sign in first.");
  const payload = {
    ...order,
    userId: user.uid,
    email: user.email,
    status: "Processing",
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, "orders"), payload);
  return { id: docRef.id, ...payload };
}

function PaymentModal({ item, currency, onClose }) {
  const { currentUser } = useAuth();
  const [method, setMethod] = useState("mpesa");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const total = item.price * 1.16;

  const completePayment = async () => {
    if (!currentUser) {
      setError("Please sign in before checkout.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const order = await saveOrderToFirestore(currentUser, {
        name: item.name,
        type: item.type,
        price: total,
        paymentMethod: method,
        phone,
      });
      setSuccess(order);
    } catch (err) {
      setError(err.message || "Could not save order. Please try again.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={modalOverlay}>
        <div style={{ ...modalBox, textAlign: "center" }}>
          <div style={{ fontSize: 58 }}>✅</div>
          <h2 style={{ color: GREEN, marginBottom: 8 }}>Order Created</h2>
          <p style={{ color: "#64748b" }}>Your order has been saved to Firestore.</p>
          <div style={{ background: "#f8fafc", borderRadius: 14, padding: 16, textAlign: "left", margin: "1rem 0" }}>
            <p><b>Order ID:</b> {success.id}</p>
            <p><b>Service:</b> {success.name}</p>
            <p><b>Amount:</b> {currency === "KES" ? KES(total) : USD(total)}</p>
            <p><b>Status:</b> Processing</p>
          </div>
          <button onClick={onClose} style={primaryBtn}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ margin: 0, color: NAVY }}>Checkout</h2>
          <button onClick={onClose} style={{ background: "none", border: 0, fontSize: 24, cursor: "pointer" }}>×</button>
        </div>

        {error && <div style={{ background: "#fef2f2", color: RED, borderRadius: 12, padding: 12, marginBottom: 12 }}>{error}</div>}

        <div style={{ background: "#eff6ff", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <b>{item.name}</b>
          <p style={{ margin: "8px 0 0", color: BLUE, fontSize: 26, fontWeight: 950 }}>{currency === "KES" ? KES(total) : USD(total)}</p>
          <small>Includes 16% VAT</small>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
          {["mpesa", "card", "bank", "cash"].map((m) => (
            <button key={m} onClick={() => setMethod(m)} style={{ padding: 10, borderRadius: 10, border: method === m ? `2px solid ${BLUE}` : "1px solid #e5e7eb", background: method === m ? "#eff6ff" : "#fff", cursor: "pointer", textTransform: "capitalize", fontWeight: 800 }}>{m}</button>
          ))}
        </div>

        {method === "mpesa" && (
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="M-Pesa phone number" style={inputStyle} />
        )}

        {method === "bank" && (
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, color: "#475569" }}>
            <b>Bank Transfer Details</b><br />
            Account Name: FAIDA SOKO LTD<br />
            Account No: 1234567890<br />
            Reference: FAIDA-{currentUser?.uid?.slice(0, 6)}
          </div>
        )}

        {method === "cash" && (
          <div style={{ background: "#fffbeb", borderRadius: 12, padding: 14, color: "#78350f" }}>
            Visit our Nairobi office to complete payment.
          </div>
        )}

        <button onClick={completePayment} disabled={loading} style={{ ...primaryBtn, width: "100%", marginTop: 18 }}>
          {loading ? "Processing..." : method === "mpesa" ? "Send STK Push" : "Complete Order"}
        </button>
      </div>
    </div>
  );
}

const modalOverlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 5000,
  display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
};
const modalBox = { background: "#fff", width: "100%", maxWidth: 480, borderRadius: 24, padding: "2rem", boxShadow: "0 30px 80px rgba(0,0,0,0.25)" };
const inputStyle = { width: "100%", padding: 14, border: "1px solid #e5e7eb", borderRadius: 12, boxSizing: "border-box" };
const primaryBtn = { background: BLUE, color: "#fff", border: 0, padding: "14px 24px", borderRadius: 12, fontWeight: 900, cursor: "pointer" };

function Nav({ page, setPage, cart, currency, setCurrency, lang, setLang, onCheckout }) {
  const { currentUser, logout } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const links = [
    { id: "home", label: "Home" },
    { id: "services", label: lang === "sw" ? "Huduma" : "Services" },
    { id: "shop", label: lang === "sw" ? "Duka" : "Shop" },
    { id: "agrisoko", label: "SokoPlus ↗" },
    { id: "hosting", label: "Hosting" },
    { id: "domains", label: "Domains" },
    { id: "contact", label: lang === "sw" ? "Wasiliana" : "Contact" },
  ];
  const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);

  const handleNavClick = (id) => {
    if (id === "agrisoko") {
      window.open("https://sokoplus.africa", "_blank");
      return;
    }
    setPage(id);
  };

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(15,23,42,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", height: 70, gap: 16 }}>
          <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${BLUE},${GOLD})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 16 }}>FS</div>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 19 }}>FAIDA SOKO</span>
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
            {links.map(l => (
              <button key={l.id} onClick={() => handleNavClick(l.id)} style={{ background: page === l.id ? "rgba(245,158,11,0.18)" : "none", border: "none", color: page === l.id ? GOLD : "rgba(255,255,255,0.82)", padding: "7px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                {l.label}
              </button>
            ))}
          </div>
          <button onClick={() => setCurrency(c => c === "KES" ? "USD" : "KES")} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "5px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{currency}</button>
          <button onClick={() => setLang(l => l === "en" ? "sw" : "en")} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "5px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>🌍 {lang === "en" ? "EN" : "SW"}</button>
          <button onClick={() => setCartOpen(true)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 20, position: "relative", padding: 4 }}>🛒{cart.length > 0 && <span style={{ position: "absolute", top: -2, right: -2, background: GOLD, color: NAVY, borderRadius: "50%", width: 17, height: 17, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{cart.length}</span>}</button>

          {currentUser ? (
            <>
              <button onClick={() => setPage("account")} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "8px 12px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 800 }}>{currentUser.email?.split("@")[0]}</button>
              <button onClick={logout} style={{ background: GOLD, border: "none", color: NAVY, padding: "8px 12px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 900 }}>Logout</button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{ background: GOLD, border: "none", color: NAVY, padding: "8px 14px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 900 }}>Sign In</button>
          )}
        </div>

        {cartOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.5)" }} onClick={() => setCartOpen(false)}>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 360, background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.15)", padding: "2rem 1.5rem", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Your Cart</h2>
                <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>✕</button>
              </div>
              {cart.length === 0 ? <p style={{ color: "#888" }}>Your cart is empty.</p> : cart.map((item, i) => (
                <div key={i} style={{ borderBottom: "1px solid #eee", padding: "12px 0", display: "flex", justifyContent: "space-between" }}>
                  <div><p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{item.name}</p><p style={{ margin: 0, fontSize: 12, color: "#888" }}>{item.type}</p></div>
                  <p style={{ margin: 0, fontWeight: 900, color: BLUE }}>{currency === "KES" ? KES(item.price) : USD(item.price)}</p>
                </div>
              ))}
              {cart.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span>Subtotal</span><span style={{ fontWeight: 800 }}>{currency === "KES" ? KES(total) : USD(total)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, color: "#888", fontSize: 13 }}><span>VAT (16%)</span><span>{currency === "KES" ? KES(total * 0.16) : USD(total * 0.16)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 18, borderTop: "2px solid #eee", paddingTop: 12 }}><span>Total</span><span style={{ color: BLUE }}>{currency === "KES" ? KES(total * 1.16) : USD(total * 1.16)}</span></div>
                  <button onClick={() => { setCartOpen(false); if (!currentUser) setShowAuth(true); else onCheckout({ name: "Cart Checkout", price: total, type: "Mixed" }); }} style={{ ...primaryBtn, width: "100%", marginTop: 16 }}>{currentUser ? "Checkout" : "Sign In & Checkout"}</button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

function HomePage({ setPage, lang }) {
  const hero = lang === "sw"
    ? { h: "Soko la Kidijitali kwa Ukuaji wa Biashara", sub: "Tunasaidia biashara za Kenya kukua kupitia tovuti, masoko ya kidijitali, hosting, domains na teknolojia ya kilimo.", cta: "Anza Sasa" }
    : { h: "Kenya’s Digital Marketplace for Business Growth", sub: "Websites • Digital Marketing • Hosting • Domains • AgriTech. Helping Kenyan businesses grow online through technology, marketing and digital commerce.", cta: "Get Started" };

  return (
    <div>
      <section style={{ minHeight: "92vh", background: `linear-gradient(135deg,${NAVY} 0%,#1e3a8a 48%,#2563eb 100%)`, display: "flex", alignItems: "center", padding: "7rem 1.5rem 4rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 420, height: 420, borderRadius: "50%", background: "rgba(245,158,11,0.25)" }} />
        <div style={{ position: "absolute", bottom: -180, left: -100, width: 500, height: 500, borderRadius: "50%", background: "rgba(34,197,94,0.14)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "4rem", alignItems: "center", position: "relative", zIndex: 2 }}>
          <div>
            <div style={{ display: "inline-block", background: "rgba(245,158,11,0.18)", border: "1px solid rgba(245,158,11,0.45)", color: "#fde68a", padding: "8px 18px", borderRadius: 100, fontSize: 13, fontWeight: 800, marginBottom: "1.5rem" }}>🇰🇪 Built for Kenya’s Digital Future</div>
            <h1 style={{ color: "#fff", fontSize: "clamp(2.4rem,5vw,4.5rem)", fontWeight: 950, lineHeight: 1.04, margin: "0 0 1.5rem", letterSpacing: "-2px" }}>{hero.h}</h1>
            <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 20, lineHeight: 1.75, marginBottom: "2rem", maxWidth: 680 }}>{hero.sub}</p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: "2.5rem" }}>
              <button onClick={() => setPage("shop")} style={{ background: GOLD, color: NAVY, border: "none", padding: "15px 30px", borderRadius: 12, fontSize: 16, fontWeight: 950, cursor: "pointer", boxShadow: "0 12px 30px rgba(245,158,11,0.35)" }}>{hero.cta} →</button>
              <button onClick={() => setPage("contact")} style={{ background: "rgba(255,255,255,0.09)", color: "#fff", border: "1px solid rgba(255,255,255,0.28)", padding: "15px 30px", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>Book Consultation</button>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 28, padding: "2rem", boxShadow: "0 30px 80px rgba(0,0,0,0.2)", backdropFilter: "blur(14px)" }}>
            <div style={{ background: "#fff", borderRadius: 22, padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}><strong style={{ color: NAVY }}>Live Growth Dashboard</strong><span style={{ color: GREEN, fontWeight: 900 }}>● Active</span></div>
              {[["SEO Visibility", "82%", BLUE], ["Social Engagement", "74%", GOLD], ["Website Leads", "68%", GREEN], ["Ad Performance", "91%", RED]].map(([label, value, color]) => (
                <div key={label} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 13, color: "#475569" }}><span>{label}</span><strong>{value}</strong></div>
                  <div style={{ height: 9, background: "#e5e7eb", borderRadius: 20, overflow: "hidden" }}><div style={{ width: value, height: "100%", background: color, borderRadius: 20 }} /></div>
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 24 }}>{["M-Pesa Ready", "Mobile First", "SEO Built", "Fast Hosting"].map(x => <div key={x} style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, color: NAVY, fontWeight: 800 }}>✅ {x}</div>)}</div>
            </div>
          </div>
        </div>
      </section>
      <AboutSection />
      <ServicesSection />
      <SokoPlusSection />
      <TestimonialsSection />
    </div>
  );
}

function AboutSection() {
  return (
    <section style={{ padding: "6rem 1.5rem", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-block", background: "rgba(29,78,216,0.08)", color: BLUE, padding: "8px 16px", borderRadius: 100, fontWeight: 900, fontSize: 13, marginBottom: 18 }}>About FAIDA SOKO</div>
          <h2 style={{ fontSize: "clamp(2rem,3vw,3rem)", fontWeight: 950, color: NAVY, lineHeight: 1.12, margin: "0 0 1rem" }}>Helping Kenyan Businesses Grow Digitally</h2>
          <p style={{ color: "#64748b", fontSize: 17, lineHeight: 1.8, marginBottom: 18 }}>FAIDA SOKO is a digital growth platform built for Kenyan businesses that want to grow online, sell better, attract customers and operate more professionally.</p>
          <p style={{ color: "#64748b", fontSize: 17, lineHeight: 1.8, marginBottom: 24 }}>We combine digital marketing, web development, hosting, domain registration, branding and AgriTech solutions to help businesses move from offline struggle to online growth.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>{["Kenyan market expertise", "Affordable digital solutions", "Business growth focus", "Fast WhatsApp support"].map((item) => <div key={item} style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, fontWeight: 800, color: NAVY }}>✅ {item}</div>)}</div>
        </div>
        <div style={{ background: `linear-gradient(135deg,${BLUE},${NAVY})`, borderRadius: 28, padding: "2rem", color: "#fff", boxShadow: "0 25px 70px rgba(15,23,42,0.25)" }}>
          <h3 style={{ fontSize: 26, fontWeight: 950, marginTop: 0 }}>Our Mission</h3>
          <p style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.8 }}>To make digital growth simple, affordable and accessible for businesses across Kenya and Africa.</p>
          <div style={{ display: "grid", gap: 14, marginTop: 24 }}>{[["500+", "Businesses Targeted"], ["150+", "Websites & Digital Projects"], ["24/7", "Support Access"], ["Kenya", "Built for Local Growth"]].map(([num, label]) => <div key={label} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 16, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}><strong style={{ color: GOLD, fontSize: 24 }}>{num}</strong><span style={{ color: "rgba(255,255,255,0.8)" }}>{label}</span></div>)}</div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section style={{ padding: "6rem 1.5rem", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}><h2 style={{ fontSize: "clamp(2rem,3vw,3rem)", fontWeight: 950, margin: "0 0 1rem", color: NAVY }}>Our Services</h2><p style={{ color: "#64748b", fontSize: 18, maxWidth: 750, margin: "0 auto" }}>Comprehensive digital marketing solutions designed for Kenyan businesses.</p></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {SERVICES.map(s => <ServiceCard key={s.title} s={s} />)}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ s }) {
  return (
    <div style={{ padding: "2rem", border: "1px solid #e5e7eb", borderRadius: 22, background: "#fff", boxShadow: "0 16px 45px rgba(15,23,42,0.06)" }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>{s.icon}</div>
      <h3 style={{ margin: "0 0 8px", fontWeight: 900, color: NAVY, fontSize: 20 }}>{s.title}</h3>
      <p style={{ margin: "0 0 10px", color: RED, fontSize: 13, fontWeight: 800 }}>{s.subtitle}</p>
      <p style={{ margin: 0, color: "#64748b", lineHeight: 1.65, fontSize: 15 }}>{s.desc}</p>
      <div style={{ marginTop: 18, display: "grid", gap: 8 }}>{s.details.map((item) => <div key={item} style={{ color: "#334155", fontSize: 14, fontWeight: 650 }}>✅ {item}</div>)}</div>
      <button onClick={() => window.open(`https://wa.me/254723032756?text=I'm interested in ${encodeURIComponent(s.title)}`, "_blank")} style={{ marginTop: 18, width: "100%", padding: "11px", borderRadius: 10, border: `2px solid ${BLUE}`, color: BLUE, background: "#fff", fontWeight: 900, cursor: "pointer" }}>Learn More →</button>
    </div>
  );
}

function SokoPlusSection() {
  const features = ["POS Sales", "Inventory", "Farmers Directory", "Harvest Tracking", "Export Docs", "M-Pesa", "AI Analytics", "Offline Mode"];
  return (
    <section style={{ padding: "6rem 1.5rem", background: `linear-gradient(135deg,${NAVY},#172554)` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
        <div><div style={{ display: "inline-block", color: "#fde68a", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", padding: "7px 16px", borderRadius: 100, fontWeight: 900, marginBottom: 18 }}>🌱 AgriTech Product</div><h2 style={{ color: "#fff", fontSize: "clamp(2rem,3.5vw,3.2rem)", fontWeight: 950, lineHeight: 1.08, margin: "0 0 1rem" }}>SokoPlus — Smart POS & Farm Management Platform</h2><p style={{ color: "rgba(255,255,255,0.78)", fontSize: 18, lineHeight: 1.75, marginBottom: 26 }}>Built for Kenyan farmers, cooperatives, agri-exporters and fresh produce businesses. Manage sales, stock, farmers, harvests, customers, M-Pesa payments, reports and export operations from one platform.</p><button onClick={() => window.open("https://sokoplus.africa", "_blank")} style={{ background: GOLD, color: NAVY, border: 0, padding: "14px 28px", borderRadius: 12, fontWeight: 950, cursor: "pointer" }}>Launch SokoPlus →</button></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>{features.map(f => <div key={f} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 18, padding: "1.3rem", color: "#fff", fontWeight: 850 }}>✅ {f}</div>)}</div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section style={{ padding: "6rem 1.5rem", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}><h2 style={{ fontSize: "clamp(2rem,3vw,3rem)", fontWeight: 950, margin: "0 0 1rem", color: NAVY }}>Client Success Stories</h2><p style={{ color: "#64748b", fontSize: 18 }}>Trusted by local businesses that want professional digital growth.</p></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>{TESTIMONIALS.map(t => <div key={t.name} style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 22, padding: "2rem" }}><Stars n={t.stars} /><p style={{ color: "#334155", lineHeight: 1.75, margin: "12px 0 20px", fontSize: 15 }}>'{t.text}'</p><p style={{ margin: 0, fontWeight: 900, color: NAVY }}>{t.name}</p><p style={{ margin: 0, color: BLUE, fontSize: 13, fontWeight: 700 }}>{t.company}</p></div>)}</div>
      </div>
    </section>
  );
}

function ShopPage({ addToCart, currency, onBuyNow }) {
  return (
    <div style={{ padding: "8rem 1.5rem 5rem", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 950, margin: "0 0 0.5rem", color: NAVY }}>Service Packages</h1>
        <p style={{ color: "#64748b", marginBottom: "3rem", fontSize: 18 }}>Choose the right package to grow your Kenyan business online.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 24 }}>
          {PACKAGES.map(pkg => <div key={pkg.id} style={{ background: "#fff", borderRadius: 22, padding: "2rem", border: pkg.badge ? `2px solid ${GOLD}` : "1px solid #e5e7eb", position: "relative", boxShadow: "0 16px 45px rgba(15,23,42,0.06)" }}>{pkg.badge && <div style={{ position: "absolute", top: -12, left: 24, background: GOLD, color: NAVY, padding: "4px 16px", borderRadius: 100, fontSize: 12, fontWeight: 950 }}>⭐ {pkg.badge}</div>}<h3 style={{ margin: 0, fontWeight: 900, fontSize: 19, color: NAVY }}>{pkg.name}</h3><p style={{ margin: "12px 0", fontSize: 30, fontWeight: 950, color: BLUE }}>{currency === "KES" ? KES(pkg.price) : USD(pkg.price)}</p>{pkg.features.map(f => <p key={f} style={{ color: "#475569", fontSize: 14 }}>✅ {f}</p>)}<div style={{ display: "flex", gap: 10, marginTop: 14 }}><button onClick={() => addToCart(pkg)} style={{ flex: 1, padding: "12px", border: `2px solid ${BLUE}`, borderRadius: 10, background: "#fff", color: BLUE, fontWeight: 900, cursor: "pointer" }}>Add to Cart</button><button onClick={() => onBuyNow(pkg)} style={{ flex: 1, padding: "12px", border: 0, borderRadius: 10, background: BLUE, color: "#fff", fontWeight: 900, cursor: "pointer" }}>Buy Now</button></div></div>)}
        </div>
      </div>
    </div>
  );
}

function HostingPage({ currency, onBuyNow }) {
  return (
    <div style={{ minHeight: "100vh", padding: "8rem 1.5rem", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 950, margin: "0 0 0.5rem", color: NAVY }}>Fast, Reliable Kenyan Hosting</h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>DirectAdmin-powered hosting with 99.9% uptime, free SSL, and Kenyan support.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>{HOSTING_PLANS.map(plan => <div key={plan.name} style={{ background: "#fff", borderRadius: 20, padding: "2rem", border: plan.popular ? `2px solid ${GOLD}` : "1px solid #e5e7eb", boxShadow: "0 16px 45px rgba(15,23,42,0.06)" }}><h3 style={{ margin: "0 0 8px", fontWeight: 950, color: NAVY }}>{plan.name}</h3><p style={{ margin: "0 0 16px", fontSize: 28, fontWeight: 950, color: BLUE }}>{currency === "KES" ? KES(plan.price) : USD(plan.price)}/mo</p>{plan.features.map(f => <p key={f} style={{ margin: "6px 0", fontSize: 14, color: "#475569" }}>✅ {f}</p>)}<button onClick={() => onBuyNow({ ...plan, name: `${plan.name} Hosting`, type: "Monthly" })} style={{ ...primaryBtn, width: "100%", marginTop: 14 }}>Order Now</button></div>)}</div>
      </div>
    </div>
  );
}

function DomainsPage() {
  const [query, setQuery] = useState("");
  return <div style={{ minHeight: "100vh", padding: "8rem 1.5rem", background: "#f8fafc" }}><div style={{ maxWidth: 800, margin: "0 auto" }}><h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 950, margin: "0 0 0.5rem", color: NAVY }}>Find Your Perfect Domain</h1><p style={{ color: "#64748b", marginBottom: "2rem" }}>Register .co.ke, .ke, .com, .africa and more.</p><div style={{ display: "flex", gap: 8, marginBottom: "2rem" }}><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter domain name" style={{ flex: 1, padding: "16px 20px", border: "2px solid #e5e7eb", borderRadius: 12, fontSize: 16 }} /><button style={{ background: GOLD, color: NAVY, border: "none", padding: "16px 28px", borderRadius: 12, fontSize: 16, fontWeight: 950, cursor: "pointer" }}>Search</button></div></div></div>;
}

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const submit = async () => { if (!form.name || !form.email) return; setSent(true); setTimeout(() => setSent(false), 3000); setForm({ name: "", email: "", phone: "", message: "" }); };
  return <div style={{ minHeight: "100vh", padding: "8rem 1.5rem", background: "#f8fafc" }}><div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}><div><h1 style={{ fontSize: "clamp(2rem,3vw,3rem)", fontWeight: 950, margin: "0 0 1rem", color: NAVY }}>Let’s Grow Your Business</h1><p style={{ color: "#64748b", lineHeight: 1.7, fontSize: 18 }}>Our Kenyan digital growth team is ready to help you with marketing, websites, hosting, domains and business technology.</p><div style={{ marginTop: 24, display: "grid", gap: 14 }}><a href="https://wa.me/254723032756" style={{ color: GREEN, fontWeight: 900, textDecoration: "none" }}>💬 WhatsApp: +254 723 032 756</a><a href="mailto:info@faidasoko.co.ke" style={{ color: BLUE, fontWeight: 900, textDecoration: "none" }}>✉️ info@faidasoko.co.ke</a><p style={{ margin: 0, color: "#475569", fontWeight: 800 }}>📍 Nairobi, Kenya</p></div></div><div style={{ background: "#fff", borderRadius: 24, padding: "2.5rem", boxShadow: "0 16px 45px rgba(15,23,42,0.08)" }}>{sent ? <div style={{ textAlign: "center" }}><div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div><h2 style={{ color: BLUE }}>Message Received!</h2></div> : <div><h2 style={{ margin: "0 0 1.5rem", fontWeight: 950, color: NAVY }}>Send Us a Message</h2><div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{[["name", "Full Name"], ["email", "Email"], ["phone", "Phone"]].map(([field, ph]) => <input key={field} placeholder={ph} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={{ padding: "14px 16px", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 15 }} />)}<textarea placeholder="Message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5} style={{ padding: "14px 16px", border: "1px solid #e5e7eb", borderRadius: 12 }} /><button onClick={submit} style={{ background: BLUE, color: "#fff", border: "none", padding: "15px", borderRadius: 12, fontWeight: 950, cursor: "pointer" }}>Send Message →</button></div></div>}</div></div></div>;
}

function AccountPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!currentUser) { setLoading(false); return; }
      const q = query(collection(db, "orders"), where("userId", "==", currentUser.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(list);
      setLoading(false);
    };
    loadOrders();
  }, [currentUser]);

  if (!currentUser) {
    return <div style={{ minHeight: "100vh", padding: "8rem 1.5rem", background: "#f8fafc" }}><div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}><h1 style={{ color: NAVY }}>Please sign in</h1><p style={{ color: "#64748b" }}>Use the Sign In button on the navigation bar to access your dashboard.</p></div></div>;
  }

  return <div style={{ minHeight: "100vh", padding: "8rem 1.5rem", background: "#f8fafc" }}><div style={{ maxWidth: 1000, margin: "0 auto" }}><div style={{ background: `linear-gradient(135deg,${NAVY},${BLUE})`, borderRadius: 24, padding: "2rem", color: "#fff", marginBottom: 24 }}><h1 style={{ margin: 0 }}>Account Dashboard</h1><p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.75)" }}>{currentUser.email}</p></div><h2 style={{ color: NAVY }}>Order History</h2>{loading ? <p>Loading orders...</p> : orders.length === 0 ? <div style={{ background: "#fff", borderRadius: 20, padding: "3rem", textAlign: "center" }}><p style={{ fontSize: 42 }}>📦</p><h3>No orders yet</h3></div> : <div style={{ display: "grid", gap: 12 }}>{orders.map(o => <div key={o.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "1.2rem", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><b style={{ color: NAVY }}>{o.name}</b><p style={{ margin: "6px 0 0", color: "#64748b" }}>Order ID: {o.id} · {o.paymentMethod}</p></div><div style={{ textAlign: "right" }}><b style={{ color: BLUE }}>{KES(o.price || 0)}</b><p style={{ margin: "6px 0 0", color: GOLD, fontWeight: 800 }}>{o.status}</p></div></div>)}</div>}</div></div>;
}

function Footer({ setPage }) {
  return <footer style={{ background: NAVY, color: "#fff", padding: "4rem 1.5rem 2rem" }}><div style={{ maxWidth: 1200, margin: "0 auto" }}><div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: 32 }}><div><h2 style={{ margin: "0 0 12px", fontWeight: 950 }}>FAIDA SOKO</h2><p style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>Kenya’s digital marketplace for marketing, websites, hosting, domains and AgriTech solutions.</p></div><div><h4>Quick Links</h4>{["home", "shop", "hosting", "domains", "contact"].map(x => <button key={x} onClick={() => setPage(x)} style={{ display: "block", background: "none", border: 0, color: "rgba(255,255,255,0.7)", margin: "8px 0", cursor: "pointer", textTransform: "capitalize" }}>{x}</button>)}</div><div><h4>Products</h4><a href="https://sokoplus.africa" style={{ display: "block", color: "rgba(255,255,255,0.7)", margin: "8px 0", textDecoration: "none" }}>SokoPlus</a><button onClick={() => setPage("hosting")} style={{ display: "block", background: "none", border: 0, color: "rgba(255,255,255,0.7)", margin: "8px 0", cursor: "pointer" }}>Hosting</button><button onClick={() => setPage("domains")} style={{ display: "block", background: "none", border: 0, color: "rgba(255,255,255,0.7)", margin: "8px 0", cursor: "pointer" }}>Domains</button></div><div><h4>Contact</h4><p style={{ color: "rgba(255,255,255,0.7)" }}>+254 723 032 756</p><p style={{ color: "rgba(255,255,255,0.7)" }}>info@faidasoko.co.ke</p><p style={{ color: "rgba(255,255,255,0.7)" }}>Nairobi, Kenya</p></div></div><div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", marginTop: 32, paddingTop: 24, textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 13 }}>© 2026 FAIDA SOKO. All rights reserved.</div></div></footer>;
}

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ from: "bot", text: "Hi! I'm FAIDA Bot 🤖. How can I help?" }]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = async () => { if (!input.trim()) return; const userMsg = input.trim(); setInput(""); setMsgs(m => [...m, { from: "user", text: userMsg }, { from: "bot", text: "Thanks! Our team can help with that. You can also WhatsApp us on +254 723 032 756 for faster support." }]); };
  return <><button onClick={() => setOpen(o => !o)} style={{ position: "fixed", bottom: 24, left: 24, width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg,${BLUE},${GOLD})`, border: "none", color: "#fff", fontSize: 26, cursor: "pointer", zIndex: 999 }}>{open ? "✕" : "🤖"}</button>{open && <div style={{ position: "fixed", bottom: 92, left: 24, width: 340, height: 480, background: "#fff", borderRadius: 20, boxShadow: "0 16px 48px rgba(0,0,0,0.15)", zIndex: 999, display: "flex", flexDirection: "column", overflow: "hidden" }}><div style={{ background: `linear-gradient(135deg,${NAVY},${BLUE})`, padding: "16px 20px" }}><p style={{ margin: 0, color: "#fff", fontWeight: 900 }}>FAIDA Bot</p></div><div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>{msgs.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: "16px", background: m.from === "user" ? BLUE : "#f3f4f6", color: m.from === "user" ? "#fff" : "#111" }}>{m.text}</div></div>)}<div ref={bottomRef} /></div><div style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask..." style={{ flex: 1, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10 }} /><button onClick={send} style={{ background: BLUE, color: "#fff", border: "none", width: 40, borderRadius: 10, cursor: "pointer" }}>→</button></div></div>}</>;
}

export default function FaidaSoko() {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart") || "[]"));
  const [page, setPage] = useState("home");
  const [currency, setCurrency] = useState("KES");
  const [lang, setLang] = useState("en");
  const [paymentItem, setPaymentItem] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);
  const addToCart = (item) => setCart(c => [...c, item]);
  const protectedBuy = (item) => { if (!currentUser) setShowAuth(true); else setPaymentItem(item); };

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage setPage={setPage} lang={lang} />;
      case "services": return <div><ServicesSection /></div>;
      case "shop": return <ShopPage addToCart={addToCart} currency={currency} onBuyNow={protectedBuy} />;
      case "hosting": return <HostingPage currency={currency} onBuyNow={protectedBuy} />;
      case "domains": return <DomainsPage />;
      case "contact": return <ContactPage />;
      case "account": return <AccountPage />;
      default: return <HomePage setPage={setPage} lang={lang} />;
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {paymentItem && <PaymentModal item={paymentItem} currency={currency} onClose={() => setPaymentItem(null)} />}
      <Nav page={page} setPage={setPage} cart={cart} currency={currency} setCurrency={setCurrency} lang={lang} setLang={setLang} onCheckout={protectedBuy} />
      <main style={{ paddingTop: 70 }}>{renderPage()}</main>
      <Footer setPage={setPage} />
      <a href="https://wa.me/254723032756" target="_blank" rel="noreferrer" style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, zIndex: 999, textDecoration: "none" }}>💬</a>
      <Chatbot />
    </div>
  );
}
