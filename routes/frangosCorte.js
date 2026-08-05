const express = require('express');
const router = express.Router();
const FrangoCorte = require('../models/FrangoCorte');
const { auth } = require('../middleware/auth');

// Criar novo lote de frangos de corte
router.post('/', auth, async (req, res) => {
  try {
    const frango = await FrangoCorte.create(req.body);
    res.status(201).json(frango);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar lote', error: error.message });
  }
});

// Listar todos os lotes
router.get('/', auth, async (req, res) => {
  try {
    const frangos = await FrangoCorte.find().sort({ createdAt: -1 });
    res.json(frangos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar lotes', error: error.message });
  }
});

// Buscar lote por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const frango = await FrangoCorte.findById(req.params.id);
    if (!frango) {
      return res.status(404).json({ message: 'Lote não encontrado' });
    }
    res.json(frango);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar lote', error: error.message });
  }
});

// Atualizar lote
router.put('/:id', auth, async (req, res) => {
  try {
    const frango = await FrangoCorte.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!frango) {
      return res.status(404).json({ message: 'Lote não encontrado' });
    }
    res.json(frango);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar lote', error: error.message });
  }
});

// Deletar lote
router.delete('/:id', auth, async (req, res) => {
  try {
    const frango = await FrangoCorte.findByIdAndDelete(req.params.id);
    if (!frango) {
      return res.status(404).json({ message: 'Lote não encontrado' });
    }
    res.json({ message: 'Lote deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar lote', error: error.message });
  }
});

module.exports = router;
