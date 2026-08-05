// Versão local para demonstração sem MongoDB
// Em produção, use o arquivo db.js com MongoDB

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Usar MongoDB local se disponível, ou em memória para testes
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/avicultura_local';
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erro ao conectar MongoDB: ${error.message}`);
    console.log('Iniciando sem conexão MongoDB - algumas funcionalidades estarão limitadas');
    // Não encerrar o processo para permitir testes da interface
  }
};

module.exports = connectDB;
