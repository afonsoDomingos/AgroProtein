const mongoose = require('mongoose');

const PoedeiraSchema = new mongoose.Schema({
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
  raca: {
    type: String,
    default: 'Hy-Line'
  },
  producaoDiaria: {
    type: Number,
    default: 0
  },
  taxaPostura: {
    type: Number,
    default: 0
  },
  pesoMedioOvo: {
    type: Number,
    default: 60
  },
  taxaMortalidade: {
    type: Number,
    default: 0
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
    default: 50
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
PoedeiraSchema.pre('save', function(next) {
  if (this.isNew) {
    this.stockAtual = this.quantidade;
  }
  next();
});

module.exports = mongoose.model('Poedeira', PoedeiraSchema);
