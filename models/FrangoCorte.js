const mongoose = require('mongoose');

const FrangoCorteSchema = new mongoose.Schema({
  lote: {
    type: String,
    required: true,
    unique: true
  },
  quantidade: {
    type: Number,
    required: true
  },
  dataEntrada: {
    type: Date,
    required: true
  },
  dataSaida: {
    type: Date
  },
  pesoMedio: {
    type: Number
  },
  taxaMortalidade: {
    type: Number,
    default: 0
  },
  raca: {
    type: String,
    default: 'Cobb'
  },
  status: {
    type: String,
    enum: ['ativo', 'concluido', 'cancelado'],
    default: 'ativo'
  },
  custoAlimentacao: {
    type: Number,
    default: 0
  },
  custoMedicamento: {
    type: Number,
    default: 0
  },
  observacoes: {
    type: String
  },
  // Stock management fields
  stockAtual: {
    type: Number,
    default: 0
  },
  stockMinimo: {
    type: Number,
    default: 100
  },
  stockMaximo: {
    type: Number,
    default: 0
  },
  alertaStockBaixo: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate stock atual before saving
FrangoCorteSchema.pre('save', function(next) {
  if (this.isNew) {
    this.stockAtual = this.quantidade;
  }
  next();
});

module.exports = mongoose.model('FrangoCorte', FrangoCorteSchema);
