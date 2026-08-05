require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Tentar conectar ao MongoDB, mas não bloquear se falhar
try {
  const connectDB = require('./config/db');
  connectDB();
} catch (error) {
  console.log('MongoDB não disponível, servidor rodando em modo limitado');
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/frangos-corte', require('./routes/frangosCorte'));
app.use('/api/poedeiras', require('./routes/poedeiras'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/vendas', require('./routes/vendas'));
app.use('/api/despesas', require('./routes/despesas'));
app.use('/api/faturas', require('./routes/faturas'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/stock', require('./routes/stock'));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
