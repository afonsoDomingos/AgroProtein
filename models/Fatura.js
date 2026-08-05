const mongoose = require('mongoose');

const FaturaSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  venda: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venda'
  },
  valor: {
    type: Number,
    required: true
  },
  dataEmissao: {
    type: Date,
    default: Date.now
  },
  dataVencimento: {
    type: Date,
    required: true
  },
  dataPagamento: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pendente', 'pago', 'atrasado', 'cancelado'],
    default: 'pendente'
  },
  observacoes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Fatura', FaturaSchema);
