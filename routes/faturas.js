const express = require('express');
const router = express.Router();
const Fatura = require('../models/Fatura');
const { auth } = require('../middleware/auth');

// Criar nova fatura
router.post('/', auth, async (req, res) => {
  try {
    const fatura = await Fatura.create(req.body);
    res.status(201).json(fatura);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar fatura', error: error.message });
  }
});

// Listar todas as faturas
router.get('/', auth, async (req, res) => {
  try {
    const faturas = await Fatura.find().populate('cliente').populate('venda').sort({ createdAt: -1 });
    res.json(faturas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar faturas', error: error.message });
  }
});

// Buscar fatura por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const fatura = await Fatura.findById(req.params.id).populate('cliente').populate('venda');
    if (!fatura) {
      return res.status(404).json({ message: 'Fatura não encontrada' });
    }
    res.json(fatura);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar fatura', error: error.message });
  }
});

// Atualizar fatura
router.put('/:id', auth, async (req, res) => {
  try {
    const fatura = await Fatura.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!fatura) {
      return res.status(404).json({ message: 'Fatura não encontrada' });
    }
    res.json(fatura);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar fatura', error: error.message });
  }
});

// Deletar fatura
router.delete('/:id', auth, async (req, res) => {
  try {
    const fatura = await Fatura.findByIdAndDelete(req.params.id);
    if (!fatura) {
      return res.status(404).json({ message: 'Fatura não encontrada' });
    }
    res.json({ message: 'Fatura deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar fatura', error: error.message });
  }
});

module.exports = router;
