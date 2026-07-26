import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/api/logo', async (req, res) => {
  try {
    const fetchResponse = await fetch('https://crtakdehv59wca9m.private.blob.vercel-storage.com/ideal%20webtech.png', {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
    });
    const buffer = await fetchResponse.arrayBuffer();
    res.set('Content-Type', 'image/png');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error fetching logo:', error);
    res.status(500).send('Error fetching logo');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
