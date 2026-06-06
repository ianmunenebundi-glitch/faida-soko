const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});
app.use('/api/', limiter);

// Database Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not set in .env');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: '🟢 API is running', timestamp: new Date().toISOString() });
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    console.log('Contact submission:', { name, email, phone });
    
    res.json({ 
      success: true, 
      message: 'Contact message received. We will get back to you soon.' 
    });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/chatbot/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // For now, return a mock response
    // In production, this would call Anthropic API securely
    const reply = `Thank you for your message: "${message}". Our AI is processing your query. FAIDA SOKO team will follow up shortly!`;
    
    res.json({ reply });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/products', (req, res) => {
  const products = [
    { id: 1, name: 'Social Media Starter', price: 15000, type: 'Monthly' },
    { id: 2, name: 'Digital Marketing Pro', price: 35000, type: 'Monthly' },
    { id: 3, name: 'E-commerce Website', price: 75000, type: 'One-time' },
    { id: 4, name: 'SEO Optimisation', price: 25000, type: 'Monthly' },
  ];
  res.json(products);
});

app.post('/api/orders', (req, res) => {
  try {
    const { items, total, currency } = req.body;
    
    const order = {
      orderId: `FS-${Date.now()}`,
      items,
      total,
      currency,
      status: 'Pending',
      createdAt: new Date()
    };
    
    console.log('Order created:', order);
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// Connect to DB and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 FAIDA SOKO API running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

module.exports = app;
