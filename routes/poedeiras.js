const express = require('express');
const router = express.Router();
const Poedeira = require('../models/Poedeira');
const { auth } = require('../middleware/auth');

// Criar novo lote de poedeiras
router.post('/', auth, async (req, res) => {
  try {
    const poedeira = await Poedeira.create(req.body);
    res.status(201).json(poedeira);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar lote', error: error.message });
  }
});

// Listar todos os lotes
router.get('/', auth, async (req, res) => {
  try {
    const poedeiras = await Poedeira.find().sort({ createdAt: -1 });
    res.json(poedeiras);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar lotes', error: error.message });
  }
});

// Buscar lote por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const poedeira = await Poedeira.findById(req.params.id);
    if (!poedeira) {
      return res.status(404).json({ message: 'Lote não encontrado' });
    }
    res.json(poedeira);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar lote', error: error.message });
  }
});

// Atualizar lote
router.put('/:id', auth, async (req, res) => {
  try {
    const poedeira = await Poedeira.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!poedeira) {
      return res.status(404).json({ message: 'Lote não encontrado' });
    }
    res.json(poedeira);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar lote', error: error.message });
  }
});

// Deletar lote
router.delete('/:id', auth, async (req, res) => {
  try {
    const poedeira = await Poedeira.findByIdAndDelete(req.params.id);
    if (!poedeira) {
      return res.status(404).json({ message: 'Lote não encontrado' });
    }
    res.json({ message: 'Lote deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar lote', error: error.message });
  }
});

module.exports = router;
