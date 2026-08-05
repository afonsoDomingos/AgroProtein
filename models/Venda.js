const mongoose = require('mongoose');

const VendaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  tipoProduto: {
    type: String,
    enum: ['frango', 'ovos'],
    required: true
  },
  quantidade: {
    type: Number,
    required: true
  },
  precoUnitario: {
    type: Number,
    required: true
  },
  valorTotal: {
    type: Number,
    required: true
  },
  dataVenda: {
    type: Date,
    default: Date.now
  },
  formaPagamento: {
    type: String,
    enum: ['dinheiro', 'cartao', 'pix', 'boleto'],
    default: 'dinheiro'
  },
  status: {
    type: String,
    enum: ['pendente', 'pago', 'cancelado'],
    default: 'pago'
  },
  observacoes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Venda', VendaSchema);
