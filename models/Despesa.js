const mongoose = require('mongoose');

const DespesaSchema = new mongoose.Schema({
  descricao: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    enum: ['alimentacao', 'medicamentos', 'manutencao', 'salarios', 'energia', 'agua', 'outros'],
    required: true
  },
  valor: {
    type: Number,
    required: true
  },
  dataDespesa: {
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
  fornecedor: {
    type: String
  },
  observacoes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Despesa', DespesaSchema);
