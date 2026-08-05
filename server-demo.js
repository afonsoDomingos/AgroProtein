require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Armazenamento em memória para demonstração
const memoryDB = {
  users: [],
  frangosCorte: [],
  poedeiras: [],
  clientes: [],
  vendas: [],
  despesas: [],
  faturas: []
};

// Gerar IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Inicializar usuário admin
const initAdmin = async () => {
  const adminExists = memoryDB.users.find(u => u.email === 'admin@avicultura.com');
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('@Admin123@', 10);
    memoryDB.users.push({
      _id: generateId(),
      email: 'admin@avicultura.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin'
    });
    console.log('Usuário admin criado com sucesso');
  }
};

// Middleware de autenticação
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Rotas de autenticação
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = memoryDB.users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
});

app.post('/api/auth/seed-admin', async (req, res) => {
  await initAdmin();
  res.json({ message: 'Admin verificado/criado' });
});

// Rotas CRUD genéricas
const createCRUDRoutes = (entityName, singularName) => {
  const router = express.Router();

  router.post('/', auth, (req, res) => {
    const item = { _id: generateId(), ...req.body, createdAt: new Date() };
    memoryDB[entityName].push(item);
    res.status(201).json(item);
  });

  router.get('/', auth, (req, res) => {
    res.json(memoryDB[entityName]);
  });

  router.get('/:id', auth, (req, res) => {
    const item = memoryDB[entityName].find(i => i._id === req.params.id);
    if (!item) return res.status(404).json({ message: 'Não encontrado' });
    res.json(item);
  });

  router.put('/:id', auth, (req, res) => {
    const index = memoryDB[entityName].findIndex(i => i._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Não encontrado' });
    memoryDB[entityName][index] = { ...memoryDB[entityName][index], ...req.body };
    res.json(memoryDB[entityName][index]);
  });

  router.delete('/:id', auth, (req, res) => {
    const index = memoryDB[entityName].findIndex(i => i._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Não encontrado' });
    memoryDB[entityName].splice(index, 1);
    res.json({ message: 'Excluído com sucesso' });
  });

  return router;
};

// Aplicar rotas CRUD
app.use('/api/frangos-corte', createCRUDRoutes('frangosCorte', 'frango'));
app.use('/api/poedeiras', createCRUDRoutes('poedeiras', 'poedeira'));
app.use('/api/clientes', createCRUDRoutes('clientes', 'cliente'));
app.use('/api/vendas', createCRUDRoutes('vendas', 'venda'));
app.use('/api/despesas', createCRUDRoutes('despesas', 'despesa'));
app.use('/api/faturas', createCRUDRoutes('faturas', 'fatura'));

// Dashboard
app.get('/api/dashboard/overview', auth, (req, res) => {
  const vendas = memoryDB.vendas.filter(v => v.status === 'pago');
  const despesas = memoryDB.despesas.filter(d => d.status === 'pago');
  
  const receitaTotal = vendas.reduce((sum, v) => sum + (v.valorTotal || 0), 0);
  const despesaTotal = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
  const lucroLiquido = receitaTotal - despesaTotal;
  const margemLucro = receitaTotal > 0 ? ((lucroLiquido / receitaTotal) * 100).toFixed(2) : 0;
  const investimentoTotal = despesaTotal;
  const roi = investimentoTotal > 0 ? ((lucroLiquido / investimentoTotal) * 100).toFixed(2) : 0;
  
  const totalFrangos = memoryDB.frangosCorte
    .filter(f => f.status === 'ativo')
    .reduce((sum, f) => sum + (f.quantidade || 0), 0);
  const totalPoedeiras = memoryDB.poedeiras
    .filter(p => p.status === 'ativo')
    .reduce((sum, p) => sum + (p.quantidade || 0), 0);
  const avesAlojadas = totalFrangos + totalPoedeiras;
  
  const taxaMortalidadeFrangos = memoryDB.frangosCorte.length > 0
    ? memoryDB.frangosCorte.reduce((sum, f) => sum + (f.taxaMortalidade || 0), 0) / memoryDB.frangosCorte.length
    : 0;
  const taxaMortalidadePoedeiras = memoryDB.poedeiras.length > 0
    ? memoryDB.poedeiras.reduce((sum, p) => sum + (p.taxaMortalidade || 0), 0) / memoryDB.poedeiras.length
    : 0;
  const taxaMortalidadeMedia = ((taxaMortalidadeFrangos + taxaMortalidadePoedeiras) / 2).toFixed(2);
  
  const vendasFrango = vendas.filter(v => v.tipoProduto === 'frango');
  const receitaFrango = vendasFrango.reduce((sum, v) => sum + (v.valorTotal || 0), 0);
  const vendasOvos = vendas.filter(v => v.tipoProduto === 'ovos');
  const receitaOvos = vendasOvos.reduce((sum, v) => sum + (v.valorTotal || 0), 0);
  
  const metaMargem = 20;
  const desempenho = ((margemLucro / metaMargem) * 100).toFixed(2);
  
  let saudeGranja = 'Saudável';
  if (margemLucro < 10 || taxaMortalidadeMedia > 5 || lucroLiquido < 0) {
    saudeGranja = 'Atenção';
  }
  if (margemLucro < 5 || taxaMortalidadeMedia > 10 || lucroLiquido < -10000) {
    saudeGranja = 'Crítico';
  }

  // Dados simulados para gráficos (modo demo)
  const receitaMensal = [15000, 18000, 22000, 19000, 25000, 28000, 32000, 30000, 27000, 31000, 35000, 38000];
  const distribuicaoDespesas = [30, 15, 10, 25, 10, 5, 5];
  const producao = {
    atual: [totalFrangos, totalPoedeiras / 1000],
    anterior: [Math.round(totalFrangos * 0.9), Math.round((totalPoedeiras / 1000) * 0.95)]
  };
  const mortalidade = {
    frangos: [2.5, 2.8, 3.1, 2.9, 3.2, 2.7, 2.4, 2.6, 3.0, 2.8, 2.5, 2.3],
    poedeiras: [1.8, 2.0, 2.2, 1.9, 2.1, 1.7, 1.5, 1.8, 2.0, 1.9, 1.6, 1.4]
  };
  const fluxoCaixa = {
    receitas: receitaMensal,
    despesas: receitaMensal.map(v => v * 0.75)
  };

  res.json({
    saudeGranja,
    indicadores: {
      receitaTotal,
      lucroLiquido,
      margemLucro: parseFloat(margemLucro),
      roi: parseFloat(roi),
      avesAlojadas,
      taxaMortalidadeMedia: parseFloat(taxaMortalidadeMedia),
      fluxoCaixaLiquido: lucroLiquido
    },
    desempenhoMeta: {
      metaMargem,
      desempenho: parseFloat(desempenho)
    },
    receitaPorLinha: {
      frango: receitaFrango,
      ovos: receitaOvos
    },
    resumoVendas: {
      totalVendas: vendas.length,
      valorMedioVenda: vendas.length > 0 ? receitaTotal / vendas.length : 0
    },
    // Dados para gráficos
    receitaMensal,
    distribuicaoDespesas,
    producao,
    mortalidade,
    fluxoCaixa
  });
});

// Rotas principais
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Inicializar e iniciar servidor
initAdmin().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
    console.log(`Login: admin@avicultura.com`);
    console.log(`Senha: @Admin123@`);
  });
});
