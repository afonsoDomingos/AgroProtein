const express = require('express');
const router = express.Router();
const Venda = require('../models/Venda');
const FrangoCorte = require('../models/FrangoCorte');
const Poedeira = require('../models/Poedeira');
const MovimentacaoStock = require('../models/MovimentacaoStock');
const { auth } = require('../middleware/auth');

// Criar nova venda
router.post('/', auth, async (req, res) => {
  try {
    const venda = await Venda.create(req.body);
    
    // Deduzir stock automaticamente se for venda de frango
    if (req.body.produto && req.body.produto.toLowerCase().includes('frango')) {
      // Encontrar lote ativo com stock suficiente
      const frangos = await FrangoCorte.find({ status: 'ativo', stockAtual: { $gte: req.body.quantidade } }).sort({ createdAt: 1 });
      
      if (frangos.length > 0) {
        const frango = frangos[0];
        const stockAnterior = frango.stockAtual;
        const stockNovo = stockAnterior - req.body.quantidade;
        
        // Atualizar stock
        frango.stockAtual = stockNovo;
        frango.alertaStockBaixo = stockNovo <= frango.stockMinimo;
        await frango.save();
        
        // Registrar movimentação
        await MovimentacaoStock.create({
          tipo: 'saida',
          quantidade: req.body.quantidade,
          produtoTipo: 'frango',
          produtoId: frango._id,
          lote: frango.lote,
          motivo: 'Venda automática',
          stockAnterior,
          stockNovo,
          usuario: req.user ? req.user.email : 'sistema',
          observacoes: `Venda #${venda._id}`
        });
      }
    }
    
    res.status(201).json(venda);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar venda', error: error.message });
  }
});

// Listar todas as vendas
router.get('/', auth, async (req, res) => {
  try {
    const vendas = await Venda.find().populate('cliente').sort({ createdAt: -1 });
    res.json(vendas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar vendas', error: error.message });
  }
});

// Buscar venda por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const venda = await Venda.findById(req.params.id).populate('cliente');
    if (!venda) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    res.json(venda);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar venda', error: error.message });
  }
});

// Atualizar venda
router.put('/:id', auth, async (req, res) => {
  try {
    const venda = await Venda.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!venda) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    res.json(venda);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar venda', error: error.message });
  }
});

// Deletar venda
router.delete('/:id', auth, async (req, res) => {
  try {
    const venda = await Venda.findByIdAndDelete(req.params.id);
    if (!venda) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    res.json({ message: 'Venda deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar venda', error: error.message });
  }
});

module.exports = router;
