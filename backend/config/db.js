const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1){
            console.log('MongoDB is already connected');
            return;
        }

        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not defined in environment variables');
        }

        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            maxPoolSize: 10,
            minPoolSize: 1,
            maxIdleTimeMS: 30000,
            family: 4,
        });

        console.log('MongoDB connected:', conn.connection.host);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        throw error;
    }
};

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

module.exports = connectDB