import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(process.cwd(), 'public')));

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/api/logo', async (req, res) => {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN is missing in environment variables');
      return res.status(500).send('BLOB_READ_WRITE_TOKEN environment variable is missing');
    }

    const fetchResponse = await fetch('https://crtakdehv59wca9m.private.blob.vercel-storage.com/ideal%20webtech.png', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!fetchResponse.ok) {
      console.error('Failed to fetch logo from Vercel Blob:', fetchResponse.status, fetchResponse.statusText);
      return res.status(fetchResponse.status).send(`Vercel Blob fetch failed: ${fetchResponse.statusText}`);
    }

    const buffer = await fetchResponse.arrayBuffer();
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error fetching logo from Vercel Blob:', error);
    res.status(500).send('Error fetching logo from Vercel Blob');
  }
});

app.get('/api/signature', async (req, res) => {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN is missing in environment variables');
      return res.status(500).send('BLOB_READ_WRITE_TOKEN environment variable is missing');
    }

    let targetUrl = 'https://crtakdehv59wca9m.private.blob.vercel-storage.com/signature%20%282%29.jpeg';

    let fetchResponse = await fetch(targetUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!fetchResponse.ok) {
      try {
        const { list } = await import('@vercel/blob');
        const { blobs } = await list({ token });
        const sigBlob = blobs.find(b => b.pathname.toLowerCase().includes('signature'));
        if (sigBlob) {
          targetUrl = sigBlob.url;
          fetchResponse = await fetch(targetUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (listErr) {
        console.error('Error searching Vercel Blob store for signature:', listErr);
      }
    }

    if (!fetchResponse.ok) {
      console.error('Failed to fetch signature from Vercel Blob:', fetchResponse.status, fetchResponse.statusText);
      return res.status(fetchResponse.status).send(`Vercel Blob fetch failed: ${fetchResponse.statusText}`);
    }

    const buffer = await fetchResponse.arrayBuffer();
    const contentType = fetchResponse.headers.get('content-type') || 'image/jpeg';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error fetching signature from Vercel Blob:', error);
    res.status(500).send('Error fetching signature from Vercel Blob');
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
