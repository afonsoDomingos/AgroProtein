const mongoose = require('mongoose');

const MovimentacaoStockSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['entrada', 'saida', 'ajuste', 'mortalidade'],
    required: true
  },
  quantidade: {
    type: Number,
    required: true
  },
  produtoTipo: {
    type: String,
    enum: ['frango', 'poedeira', 'ovo'],
    required: true
  },
  produtoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  lote: {
    type: String,
    required: true
  },
  motivo: {
    type: String,
    required: true
  },
  stockAnterior: {
    type: Number,
    required: true
  },
  stockNovo: {
    type: Number,
    required: true
  },
  usuario: {
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

// Index for efficient queries
MovimentacaoStockSchema.index({ produtoTipo: 1, produtoId: 1, createdAt: -1 });
MovimentacaoStockSchema.index({ lote: 1, createdAt: -1 });

module.exports = mongoose.model('MovimentacaoStock', MovimentacaoStockSchema);
