const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('../routes/auth');
const frangosRoutes = require('../routes/frangosCorte');
const poedeirasRoutes = require('../routes/poedeiras');
const clientesRoutes = require('../routes/clientes');
const vendasRoutes = require('../routes/vendas');
const despesasRoutes = require('../routes/despesas');
const faturasRoutes = require('../routes/faturas');
const dashboardRoutes = require('../routes/dashboard');
const stockRoutes = require('../routes/stock');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/frangos-corte', frangosRoutes);
app.use('/api/poedeiras', poedeirasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/despesas', despesasRoutes);
app.use('/api/faturas', faturasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stock', stockRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Export for Vercel
module.exports = app;
