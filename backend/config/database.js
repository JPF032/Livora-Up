const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`Erreur de connexion à MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
