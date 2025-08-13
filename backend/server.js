const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB()
    .then(() => {
        console.log('Database connected successfully');
        const formRoutes = require('./routes/formRoutes');
        app.use('/api/forms', formRoutes);
        
        // Test endpoint
        app.get('/api/test', (req, res) => {
            res.json({ message: 'Backend is working!' });
        });
                
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});