const mongoose = require('mongoose');

// Cache connection for serverless
let cached = null;

const connectDB = async () => {
  if (cached) {
    return cached;
  }

  try {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, opts);
    cached = conn;
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erro ao conectar MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
