const express = require('express');
const router = express.Router();
const FrangoCorte = require('../models/FrangoCorte');
const Poedeira = require('../models/Poedeira');
const MovimentacaoStock = require('../models/MovimentacaoStock');
const { auth } = require('../middleware/auth');

// Registrar movimentação de stock
router.post('/movimentacao', auth, async (req, res) => {
  try {
    const { tipo, quantidade, produtoTipo, produtoId, lote, motivo, observacoes } = req.body;
    const usuario = req.user ? req.user.email : 'sistema';

    // Buscar produto atual
    let produto;
    if (produtoTipo === 'frango') {
      produto = await FrangoCorte.findById(produtoId);
    } else if (produtoTipo === 'poedeira') {
      produto = await Poedeira.findById(produtoId);
    }

    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const stockAnterior = produto.stockAtual;
    let stockNovo = stockAnterior;

    // Calcular novo stock baseado no tipo de movimentação
    switch (tipo) {
      case 'entrada':
        stockNovo = stockAnterior + quantidade;
        break;
      case 'saida':
        stockNovo = stockAnterior - quantidade;
        if (stockNovo < 0) {
          return res.status(400).json({ message: 'Stock insuficiente para esta saída' });
        }
        break;
      case 'ajuste':
        stockNovo = quantidade;
        break;
      case 'mortalidade':
        stockNovo = stockAnterior - quantidade;
        if (stockNovo < 0) {
          return res.status(400).json({ message: 'Stock insuficiente para esta mortalidade' });
        }
        break;
    }

    // Atualizar stock do produto
    produto.stockAtual = stockNovo;
    
    // Verificar alerta de stock baixo
    produto.alertaStockBaixo = stockNovo <= produto.stockMinimo;
    
    await produto.save();

    // Registrar movimentação
    const movimentacao = await MovimentacaoStock.create({
      tipo,
      quantidade,
      produtoTipo,
      produtoId,
      lote,
      motivo,
      stockAnterior,
      stockNovo,
      usuario,
      observacoes
    });

    res.status(201).json({ movimentacao, produto });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar movimentação', error: error.message });
  }
});

// Listar movimentações de stock
router.get('/movimentacoes', auth, async (req, res) => {
  try {
    const { produtoTipo, produtoId, lote, tipo, limit = 50 } = req.query;
    
    const query = {};
    if (produtoTipo) query.produtoTipo = produtoTipo;
    if (produtoId) query.produtoId = produtoId;
    if (lote) query.lote = lote;
    if (tipo) query.tipo = tipo;

    const movimentacoes = await MovimentacaoStock
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(movimentacoes);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar movimentações', error: error.message });
  }
});

// Obter status de stock
router.get('/status', auth, async (req, res) => {
  try {
    const frangos = await FrangoCorte.find({ status: 'ativo' });
    const poedeiras = await Poedeira.find({ status: 'ativo' });

    const stockFrangos = frangos.map(f => ({
      id: f._id,
      lote: f.lote,
      quantidade: f.quantidade,
      stockAtual: f.stockAtual,
      stockMinimo: f.stockMinimo,
      stockMaximo: f.stockMaximo,
      alertaStockBaixo: f.alertaStockBaixo,
      raca: f.raca,
      status: f.status
    }));

    const stockPoedeiras = poedeiras.map(p => ({
      id: p._id,
      lote: p.lote,
      quantidade: p.quantidade,
      stockAtual: p.stockAtual,
      stockMinimo: p.stockMinimo,
      stockMaximo: p.stockMaximo,
      alertaStockBaixo: p.alertaStockBaixo,
      raca: p.raca,
      status: p.status
    }));

    res.json({
      frangos: stockFrangos,
      poedeiras: stockPoedeiras,
      totalFrangos: stockFrangos.reduce((sum, f) => sum + f.stockAtual, 0),
      totalPoedeiras: stockPoedeiras.reduce((sum, p) => sum + p.stockAtual, 0),
      alertasStockBaixo: [
        ...stockFrangos.filter(f => f.alertaStockBaixo),
        ...stockPoedeiras.filter(p => p.alertaStockBaixo)
      ]
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar status de stock', error: error.message });
  }
});

// Ajustar stock mínimo/máximo
router.put('/config/:id', auth, async (req, res) => {
  try {
    const { stockMinimo, stockMaximo } = req.body;
    const { produtoTipo } = req.query;

    let produto;
    if (produtoTipo === 'frango') {
      produto = await FrangoCorte.findById(req.params.id);
    } else if (produtoTipo === 'poedeira') {
      produto = await Poedeira.findById(req.params.id);
    }

    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    if (stockMinimo !== undefined) produto.stockMinimo = stockMinimo;
    if (stockMaximo !== undefined) produto.stockMaximo = stockMaximo;
    
    // Recalcular alerta
    produto.alertaStockBaixo = produto.stockAtual <= produto.stockMinimo;
    
    await produto.save();

    res.json(produto);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar configuração de stock', error: error.message });
  }
});

// Obter relatório de stock
router.get('/relatorio', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const movimentacoes = await MovimentacaoStock.find(query).sort({ createdAt: -1 });

    // Agrupar por tipo
    const resumo = {
      totalEntradas: 0,
      totalSaidas: 0,
      totalAjustes: 0,
      totalMortalidade: 0,
      porTipo: {},
      porLote: {}
    };

    movimentacoes.forEach(mov => {
      switch (mov.tipo) {
        case 'entrada':
          resumo.totalEntradas += mov.quantidade;
          break;
        case 'saida':
          resumo.totalSaidas += mov.quantidade;
          break;
        case 'ajuste':
          resumo.totalAjustes += mov.quantidade;
          break;
        case 'mortalidade':
          resumo.totalMortalidade += mov.quantidade;
          break;
      }

      // Por tipo
      if (!resumo.porTipo[mov.produtoTipo]) {
        resumo.porTipo[mov.produtoTipo] = 0;
      }
      resumo.porTipo[mov.produtoTipo] += mov.quantidade;

      // Por lote
      if (!resumo.porLote[mov.lote]) {
        resumo.porLote[mov.lote] = 0;
      }
      resumo.porLote[mov.lote] += mov.quantidade;
    });

    res.json({ movimentacoes, resumo });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar relatório', error: error.message });
  }
});

module.exports = router;
