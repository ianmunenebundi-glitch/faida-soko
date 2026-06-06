# 🔗 Frontend-Backend Integration Guide

## Overview

This guide shows you how to:
1. ✅ Fix the chatbot security vulnerability (API key was exposed)
2. ✅ Connect React frontend to Express backend
3. ✅ Setup user authentication
4. ✅ Persist cart data to database
5. ✅ Make contact forms work
6. ✅ Create production-ready integration

---

## 🚨 Security Issue to Fix

### Current Problem (UNSAFE)
In `FaidaSoko.jsx`, the chatbot directly calls Anthropic API:

```javascript
// ❌ DANGEROUS - API key exposed in browser console!
const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { 
    "Content-Type": "application/json",
    "x-api-key": API_KEY  // 🚨 VISIBLE TO ANYONE
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    messages: [...]
  })
});
```

**Why this is bad:**
- Anyone can see your API key in browser console
- Someone could use it to spam requests (costs $$)
- Your account could be compromised
- Violates API security best practices

### Solution (SECURE)
Route all requests through backend:

```javascript
// ✅ SAFE - API key hidden on backend
const res = await fetch("http://localhost:5000/api/chatbot/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${authToken}`  // Only user token sent
  },
  body: JSON.stringify({ message: userMsg })
});
```

---

## 📋 Integration Checklist

- [ ] Create API configuration file
- [ ] Add authentication context/state
- [ ] Update chatbot to use backend
- [ ] Update contact form to use backend
- [ ] Setup cart persistence (localStorage + backend)
- [ ] Add JWT token management
- [ ] Error handling & loading states
- [ ] Test all endpoints
- [ ] Deploy

---

## 🔧 Step 1: Create API Configuration

Create file: `apiConfig.js`

```javascript
// apiConfig.js
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    me: `${API_BASE_URL}/auth/me`,
  },
  
  // Users
  users: {
    profile: `${API_BASE_URL}/users/profile`,
    updateProfile: `${API_BASE_URL}/users/profile`,
    changePassword: `${API_BASE_URL}/users/change-password`,
  },
  
  // Products
  products: {
    list: `${API_BASE_URL}/products`,
    single: (id) => `${API_BASE_URL}/products/${id}`,
  },
  
  // Orders
  orders: {
    create: `${API_BASE_URL}/orders`,
    list: `${API_BASE_URL}/orders/my-orders`,
    single: (id) => `${API_BASE_URL}/orders/${id}`,
  },
  
  // Payments
  payments: {
    mpesaInitiate: `${API_BASE_URL}/payments/mpesa/initiate`,
    stripeIntent: `${API_BASE_URL}/payments/stripe/create-intent`,
    bankReference: `${API_BASE_URL}/payments/bank/generate-ref`,
    status: (orderId) => `${API_BASE_URL}/payments/${orderId}/status`,
  },
  
  // Contact
  contact: {
    submit: `${API_BASE_URL}/contact`,
    list: `${API_BASE_URL}/contact`,
    single: (id) => `${API_BASE_URL}/contact/${id}`,
    reply: (id) => `${API_BASE_URL}/contact/${id}/reply`,
  },
  
  // Chatbot
  chatbot: {
    chat: `${API_BASE_URL}/chatbot/chat`,
    suggestions: `${API_BASE_URL}/chatbot/suggestions`,
  },
  
  // Admin
  admin: {
    stats: `${API_BASE_URL}/admin/stats`,
    users: `${API_BASE_URL}/admin/users`,
    orders: `${API_BASE_URL}/admin/orders`,
  },
};

// Helper function to make API requests
export const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem("authToken");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  // Add token if it exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Check if response is ok
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
```

---

## 🔐 Step 2: Create Authentication Service

Create file: `authService.js`

```javascript
// authService.js
import { API_ENDPOINTS, apiCall } from "./apiConfig";

export const authService = {
  // Register new user
  async register(data) {
    const response = await apiCall(API_ENDPOINTS.auth.register, {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    // Store token
    if (response.token) {
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    
    return response;
  },
  
  // Login user
  async login(email, password) {
    const response = await apiCall(API_ENDPOINTS.auth.login, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    
    // Store token
    if (response.token) {
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    
    return response;
  },
  
  // Logout user
  async logout() {
    try {
      await apiCall(API_ENDPOINTS.auth.logout, {
        method: "POST",
      });
    } finally {
      // Clear local storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
  },
  
  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiCall(API_ENDPOINTS.auth.me);
      return response.user;
    } catch (error) {
      // Token invalid, clear storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      return null;
    }
  },
  
  // Check if user is logged in
  isLoggedIn() {
    return !!localStorage.getItem("authToken");
  },
  
  // Get stored user
  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  
  // Get token
  getToken() {
    return localStorage.getItem("authToken");
  },
};
```

---

## 💬 Step 3: Fix Chatbot (Security Fix)

Replace the `Chatbot` function in `FaidaSoko.jsx`:

```javascript
function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { 
      from: "bot", 
      text: "Hi! I'm FAIDA Bot 🤖 — your Kenyan digital marketing assistant. How can I help you grow your business today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setInput("");
    setMsgs(m => [...m, { from: "user", text: userMsg }]);
    setLoading(true);
    
    try {
      // ✅ NEW: Call backend instead of Anthropic directly
      const response = await fetch("http://localhost:5000/api/chatbot/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken") || ""}`
        },
        body: JSON.stringify({
          message: userMsg,
          conversationHistory: msgs.map(m => ({
            role: m.from === "user" ? "user" : "assistant",
            content: m.text
          }))
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to get response");
      }
      
      const data = await response.json();
      const reply = data.reply || "Sorry, I couldn't process that. Please try again.";
      
      setMsgs(m => [...m, { from: "bot", text: reply }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMsgs(m => [...m, { 
        from: "bot", 
        text: "Connection issue. Please try again in a moment." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(o => !o)}
        style={{ 
          position: "fixed", 
          bottom: 24, 
          left: 24, 
          width: 56, 
          height: 56, 
          borderRadius: "50%", 
          background: "linear-gradient(135deg,#22c55e,#15803d)", 
          border: "none", 
          color: "#fff", 
          fontSize: 26, 
          cursor: "pointer", 
          boxShadow: "0 4px 16px rgba(34,197,94,0.4)", 
          zIndex: 999, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
        {open ? "✕" : "🤖"}
      </button>
      
      {open && (
        <div style={{ 
          position: "fixed", 
          bottom: 92, 
          left: 24, 
          width: 340, 
          height: 480, 
          background: "#fff", 
          borderRadius: 20, 
          boxShadow: "0 16px 48px rgba(0,0,0,0.15)", 
          zIndex: 999, 
          display: "flex", 
          flexDirection: "column", 
          overflow: "hidden", 
          border: "1px solid #e5e7eb" 
        }}>
          {/* Header */}
          <div style={{ 
            background: "linear-gradient(135deg,#022c22,#15803d)", 
            padding: "16px 20px", 
            display: "flex", 
            alignItems: "center", 
            gap: 12 
          }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: "50%", 
              background: "rgba(255,255,255,0.15)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: 18 
            }}>
              🤖
            </div>
            <div>
              <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: 15 }}>
                FAIDA Bot
              </p>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                AI-Powered · Always Online
              </p>
            </div>
          </div>
          
          {/* Messages */}
          <div style={{ 
            flex: 1, 
            overflowY: "auto", 
            padding: "16px", 
            display: "flex", 
            flexDirection: "column", 
            gap: 12 
          }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ 
                display: "flex", 
                justifyContent: m.from === "user" ? "flex-end" : "flex-start" 
              }}>
                <div style={{ 
                  maxWidth: "80%", 
                  padding: "10px 14px", 
                  borderRadius: m.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", 
                  background: m.from === "user" ? "#22c55e" : "#f3f4f6", 
                  color: m.from === "user" ? "#fff" : "#111", 
                  fontSize: 14, 
                  lineHeight: 1.5 
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={{ 
                display: "flex", 
                justifyContent: "flex-start" 
              }}>
                <div style={{ 
                  background: "#f3f4f6", 
                  padding: "10px 14px", 
                  borderRadius: "16px 16px 16px 4px", 
                  fontSize: 14, 
                  color: "#888" 
                }}>
                  Typing...
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>
          
          {/* Input */}
          <div style={{ 
            padding: "12px 16px", 
            borderTop: "1px solid #e5e7eb", 
            display: "flex", 
            gap: 8 
          }}>
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === "Enter" && send()} 
              placeholder="Ask me anything..."
              style={{ 
                flex: 1, 
                padding: "10px 14px", 
                border: "1px solid #e5e7eb", 
                borderRadius: 10, 
                fontSize: 14 
              }} 
            />
            <button 
              onClick={send} 
              disabled={loading}
              style={{ 
                background: "#22c55e", 
                color: "#fff", 
                border: "none", 
                width: 40, 
                borderRadius: 10, 
                cursor: loading ? "not-allowed" : "pointer", 
                fontSize: 18,
                opacity: loading ? 0.6 : 1
              }}>
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

---

## 📝 Step 4: Fix Contact Form

Replace the `ContactPage` function in `FaidaSoko.jsx`:

```javascript
function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    // Validation
    if (!form.name || !form.email || !form.phone || !form.message) {
      setError("All fields are required");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // ✅ NEW: Send to backend
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }
      
      setSent(true);
      // Reset form after 3 seconds
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      setError(err.message);
      console.error("Contact error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "8rem 1.5rem 5rem", background: "#f9fafb" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>
        <div>
          <p style={{ color: "#15803d", fontWeight: 700, letterSpacing: 2, fontSize: 13 }}>GET IN TOUCH</p>
          <h1 style={{ fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 900, margin: "0 0 1rem", color: "#111" }}>Let's Grow Your Business Together</h1>
          <p style={{ color: "#6b7280", lineHeight: 1.7, fontSize: 16, marginBottom: "2rem" }}>Our team of Kenyan digital marketing experts is ready to craft the perfect strategy for your business.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { icon: "📍", label: "Office", val: "Delta House, Chiromo Road, Westlands, Nairobi" },
              { icon: "📧", label: "Email", val: "support@faidasoko.co.ke" },
              { icon: "📧", label: "Billing", val: "billing@faidasoko.co.ke" },
              { icon: "📱", label: "WhatsApp", val: "+254 723 032 756" }
            ].map(c => (
              <div key={c.label} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "#111", fontSize: 14 }}>{c.label}</p>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: 15 }}>{c.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
              <h2 style={{ color: "#15803d", marginBottom: 12 }}>Message Received!</h2>
              <p style={{ color: "#6b7280" }}>Thank you for reaching out. We'll get back to you within 2 business hours.</p>
            </div>
          ) : (
            <div>
              <h2 style={{ margin: "0 0 1.5rem", fontWeight: 800, color: "#111" }}>Send Us a Message</h2>
              
              {error && (
                <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10, padding: 12, marginBottom: 16, color: "#dc2626", fontSize: 14 }}>
                  {error}
                </div>
              )}
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { field: "name", ph: "Full Name", type: "text" },
                  { field: "email", ph: "Email Address", type: "email" },
                  { field: "phone", ph: "Phone Number", type: "tel" }
                ].map(({ field, ph, type }) => (
                  <input 
                    key={field}
                    type={type} 
                    placeholder={ph} 
                    value={form[field]} 
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{ padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 15 }}
                  />
                ))}
                
                <textarea 
                  placeholder="Tell us about your business and goals..." 
                  value={form.message} 
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={5} 
                  style={{ padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 15, resize: "vertical" }}
                />
                
                <button 
                  onClick={submit} 
                  disabled={loading}
                  style={{ 
                    background: "#22c55e", 
                    color: "#fff", 
                    border: "none", 
                    padding: "14px", 
                    borderRadius: 10, 
                    fontSize: 16, 
                    fontWeight: 700, 
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1
                  }}>
                  {loading ? "Sending..." : "Send Message →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 🛒 Step 5: Setup Cart Persistence

Update cart state in main `FaidaSoko` function:

```javascript
export default function FaidaSoko() {
  // Load cart from localStorage on mount
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  
  const [page, setPage] = useState("home");
  const [currency, setCurrency] = useState("KES");
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(null);
  
  // Load user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const addToCart = (item) => {
    setCart(c => [...c, item]);
  };

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage setPage={setPage} currency={currency} lang={lang} />;
      case "services": return <HomePage setPage={setPage} currency={currency} lang={lang} />;
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
      <main style={{ paddingTop: 0 }}>
        {renderPage()}
      </main>
      <Footer setPage={setPage} />
      {/* WhatsApp FAB */}
      <a href="https://wa.me/254723032756" target="_blank" rel="noreferrer"
        style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 4px 16px rgba(37,211,102,0.4)", zIndex: 999, textDecoration: "none" }}>
        💬
      </a>
      {/* FAIDA Bot */}
      <Chatbot />
    </div>
  );
}
```

---

## 🌐 Step 6: Environment Configuration

Create file: `.env.local` in project root

```bash
# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

For production:

```bash
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_ENV=production
```

---

## ✅ Step 7: Testing Checklist

Test each endpoint:

```bash
# 1. Test Backend Health
curl http://localhost:5000/api/health

# 2. Register User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "254712345678",
    "password": "testpass123",
    "confirmPassword": "testpass123"
  }'

# 3. Login User
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'

# Save token from response

# 4. Get User Profile (with token)
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Test Chatbot
curl -X POST http://localhost:5000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "How can I grow my business?",
    "conversationHistory": []
  }'

# 6. Submit Contact Form
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "254712345678",
    "message": "I need digital marketing help"
  }'
```

---

## 🚀 Step 8: Running Integrated System

### Terminal 1: Start Frontend
```bash
cd faida-soko
npm install
npm start
# Opens http://localhost:3000
```

### Terminal 2: Start Backend
```bash
cd faida-soko/server
npm install
cp .env.example .env
# Edit .env with MongoDB URI and API keys
npm run dev
# Runs on http://localhost:5000
```

### Verify Both Are Running
- Frontend: http://localhost:3000 ✅
- Backend: http://localhost:5000/api/health ✅

---

## 🔐 Security Best Practices Applied

✅ **API Key Protection**
- Anthropic API key now on backend only
- Frontend never sees sensitive credentials

✅ **JWT Authentication**
- Tokens stored in localStorage
- Sent in Authorization header
- Validated on backend for every request

✅ **Input Validation**
- Joi validation on backend
- Form validation on frontend
- Error messages sent to user

✅ **CORS Protection**
- Backend configured to accept only frontend URL
- Prevents unauthorized cross-origin requests

✅ **Rate Limiting**
- 100 requests per 15 minutes per IP
- Prevents brute force attacks

✅ **Data Persistence**
- Cart stored in localStorage (client-side)
- Orders, contacts saved to MongoDB (server-side)
- User authentication persisted securely

---

## 📊 Integration Architecture

```
Frontend (React)                  Backend (Express)                Database
┌──────────────────┐             ┌──────────────────┐             ┌──────┐
│ FaidaSoko.jsx    │──HTTP/JSON──│ server.js        │────────────│ Mongo│
│                  │             │                  │  Mongoose  │ DB   │
│ - Chatbot        │             │ - JWT Auth       │             │      │
│ - Contact Form   │             │ - Validation     │             │      │
│ - Cart           │             │ - Payment Routes │             │      │
│ - Auth UI        │             │ - Admin APIs     │             │      │
└──────────────────┘             └──────────────────┘             └──────┘
```

---

## 🎯 What's Now Secure

| Feature | Before | After |
|---------|--------|-------|
| Chatbot | 🚨 API key exposed | ✅ Backend only |
| Auth | ❌ None | ✅ JWT tokens |
| Contact Form | ❌ Doesn't save | ✅ Saves to DB |
| Cart | 🔄 Resets on refresh | ✅ Persists |
| Payment | 🚫 Not functional | ✅ Routes ready |

---

## 🚀 Next Steps

1. ✅ Implement the changes above
2. ✅ Test all endpoints
3. 💳 Integrate M-Pesa payments
4. 💰 Integrate Stripe
5. 📧 Add email notifications
6. 🚀 Deploy to production

---

## 📞 Troubleshooting

### "CORS error" or "Cannot access backend"
```bash
# Make sure backend is running
cd server
npm run dev

# Check .env has correct MONGODB_URI
# Check FRONTEND_URL matches frontend origin
```

### "Token not found" in chatbot
```javascript
// Make sure authToken is saved in localStorage
// The chatbot now requires login for best experience
```

### "Contact form not saving"
```bash
# Ensure MongoDB is running/connected
# Check backend logs for errors
npm run dev  # with verbose logging
```

### "API calls failing"
```bash
# Check REACT_APP_API_URL in .env.local
# Verify backend health: curl http://localhost:5000/api/health
# Check browser console for detailed errors
```

---

## ✨ Congratulations!

Your frontend and backend are now securely integrated! 🎉

**Security Issues Fixed:**
- ✅ API key no longer exposed
- ✅ Chatbot uses secure backend
- ✅ Authentication properly implemented
- ✅ Data persistence working
- ✅ Contact forms saving to database

**Next: Integrate M-Pesa payments!**
