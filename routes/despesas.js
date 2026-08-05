const express = require('express');
const router = express.Router();
const Despesa = require('../models/Despesa');
const { auth } = require('../middleware/auth');

// Criar nova despesa
router.post('/', auth, async (req, res) => {
  try {
    const despesa = await Despesa.create(req.body);
    res.status(201).json(despesa);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar despesa', error: error.message });
  }
});

// Listar todas as despesas
router.get('/', auth, async (req, res) => {
  try {
    const despesas = await Despesa.find().sort({ createdAt: -1 });
    res.json(despesas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar despesas', error: error.message });
  }
});

// Buscar despesa por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const despesa = await Despesa.findById(req.params.id);
    if (!despesa) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }
    res.json(despesa);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar despesa', error: error.message });
  }
});

// Atualizar despesa
router.put('/:id', auth, async (req, res) => {
  try {
    const despesa = await Despesa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!despesa) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }
    res.json(despesa);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar despesa', error: error.message });
  }
});

// Deletar despesa
router.delete('/:id', auth, async (req, res) => {
  try {
    const despesa = await Despesa.findByIdAndDelete(req.params.id);
    if (!despesa) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }
    res.json({ message: 'Despesa deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar despesa', error: error.message });
  }
});

module.exports = router;
