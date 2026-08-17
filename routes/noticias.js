const express = require('express');
const router = express.Router();
const Noticia = require('../models/Noticia');
const { auth } = require('../middleware/auth');

// Listar todas as notícias
router.get('/', auth, async (req, res) => {
  try {
    const noticias = await Noticia.find().sort({ dataPublicacao: -1 });
    res.json(noticias);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar notícias', error: error.message });
  }
});

// Listar notícias publicadas
router.get('/publicadas', async (req, res) => {
  try {
    const noticias = await Noticia.find({ publicado: true }).sort({ dataPublicacao: -1 });
    res.json(noticias);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar notícias', error: error.message });
  }
});

// Listar notícias em destaque
router.get('/destaques', async (req, res) => {
  try {
    const noticias = await Noticia.find({ publicado: true, destaque: true }).sort({ dataPublicacao: -1 });
    res.json(noticias);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar destaques', error: error.message });
  }
});

// Buscar notícia por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const noticia = await Noticia.findById(req.params.id);
    if (!noticia) {
      return res.status(404).json({ message: 'Notícia não encontrada' });
    }
    res.json(noticia);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar notícia', error: error.message });
  }
});

// Criar nova notícia
router.post('/', auth, async (req, res) => {
  try {
    const noticia = await Noticia.create(req.body);
    res.status(201).json(noticia);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar notícia', error: error.message });
  }
});

// Atualizar notícia
router.put('/:id', auth, async (req, res) => {
  try {
    const noticia = await Noticia.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!noticia) {
      return res.status(404).json({ message: 'Notícia não encontrada' });
    }
    res.json(noticia);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar notícia', error: error.message });
  }
});

// Deletar notícia
router.delete('/:id', auth, async (req, res) => {
  try {
    const noticia = await Noticia.findByIdAndDelete(req.params.id);
    if (!noticia) {
      return res.status(404).json({ message: 'Notícia não encontrada' });
    }
    res.json({ message: 'Notícia deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar notícia', error: error.message });
  }
});

module.exports = router;
