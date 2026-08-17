const mongoose = require('mongoose');

const NoticiaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  conteudo: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    enum: ['geral', 'frangos', 'poedeiras', 'financeiro', 'mercado', 'tecnologia'],
    default: 'geral'
  },
  autor: {
    type: String,
    default: 'Administrador'
  },
  imagem: {
    type: String,
    default: ''
  },
  destaque: {
    type: Boolean,
    default: false
  },
  publicado: {
    type: Boolean,
    default: true
  },
  dataPublicacao: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

NoticiaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Noticia', NoticiaSchema);
