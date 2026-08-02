import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import zlib from 'zlib';
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

function processSignatureToWhiteBg(buffer: Buffer): Buffer {
  try {
    let pos = 8;
    const idatChunks: Buffer[] = [];
    let ihdrChunk: Buffer | null = null;
    let width = 500;
    let height = 500;

    while (pos < buffer.length) {
      const len = buffer.readUInt32BE(pos);
      const type = buffer.slice(pos + 4, pos + 8).toString('ascii');
      if (type === 'IHDR') {
        ihdrChunk = buffer.subarray(pos + 8, pos + 8 + len);
        width = buffer.readUInt32BE(pos + 8);
        height = buffer.readUInt32BE(pos + 12);
      }
      if (type === 'IDAT') idatChunks.push(buffer.subarray(pos + 8, pos + 8 + len));
      pos += 8 + len + 4;
    }

    if (!ihdrChunk || idatChunks.length === 0) return buffer;

    const raw = zlib.inflateSync(Buffer.concat(idatChunks));
    const bpp = 4;
    const stride = 1 + width * bpp;
    const uncompressed = Buffer.alloc(height * width * bpp);

    function paeth(a: number, b: number, c: number) {
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      if (pa <= pb && pa <= pc) return a;
      if (pb <= pc) return b;
      return c;
    }

    for (let y = 0; y < height; y++) {
      const filter = raw[y * stride];
      for (let x = 0; x < width; x++) {
        const rawIdx = y * stride + 1 + x * bpp;
        const outIdx = (y * width + x) * bpp;
        for (let c = 0; c < bpp; c++) {
          const val = raw[rawIdx + c];
          const left = x > 0 ? uncompressed[outIdx - bpp + c] : 0;
          const up = y > 0 ? uncompressed[((y - 1) * width + x) * bpp + c] : 0;
          const upLeft = (x > 0 && y > 0) ? uncompressed[((y - 1) * width + (x - 1)) * bpp + c] : 0;
          let recon = 0;
          if (filter === 0) recon = val;
          else if (filter === 1) recon = (val + left) & 0xff;
          else if (filter === 2) recon = (val + up) & 0xff;
          else if (filter === 3) recon = (val + Math.floor((left + up) / 2)) & 0xff;
          else if (filter === 4) recon = (val + paeth(left, up, upLeft)) & 0xff;
          uncompressed[outIdx + c] = recon;
        }
      }
    }

    for (let i = 0; i < uncompressed.length; i += 4) {
      const r = uncompressed[i];
      const g = uncompressed[i + 1];
      const b = uncompressed[i + 2];
      const a = uncompressed[i + 3];

      if (a < 200 || (r < 50 && g < 50 && b < 50)) {
        uncompressed[i] = 255;
        uncompressed[i + 1] = 255;
        uncompressed[i + 2] = 255;
        uncompressed[i + 3] = 255;
      }
    }

    const newRaw = Buffer.alloc(height * stride);
    for (let y = 0; y < height; y++) {
      newRaw[y * stride] = 0;
      uncompressed.copy(newRaw, y * stride + 1, y * width * bpp, (y + 1) * width * bpp);
    }

    const newIdat = zlib.deflateSync(newRaw);

    function createChunk(typeStr: string, data: Buffer): Buffer {
      const typeBuf = Buffer.from(typeStr, 'ascii');
      const lenBuf = Buffer.alloc(4);
      lenBuf.writeUInt32BE(data.length, 0);
      const payload = Buffer.concat([typeBuf, data]);
      const crcVal = zlib.crc32(payload);
      const crcBuf = Buffer.alloc(4);
      crcBuf.writeUInt32BE(crcVal >>> 0, 0);
      return Buffer.concat([lenBuf, payload, crcBuf]);
    }

    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const ihdrChunkBuf = createChunk('IHDR', ihdrChunk);
    const idatChunkBuf = createChunk('IDAT', newIdat);
    const iendChunkBuf = createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([pngHeader, ihdrChunkBuf, idatChunkBuf, iendChunkBuf]);
  } catch (err) {
    console.error('Error processing signature background:', err);
    return buffer;
  }
}

app.get('/api/signature', async (req, res) => {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN is missing in environment variables');
      return res.status(500).send('BLOB_READ_WRITE_TOKEN environment variable is missing');
    }

    let targetUrl = 'https://crtakdehv59wca9m.private.blob.vercel-storage.com/signature%20%282%29.png';

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

    const rawBuffer = Buffer.from(await fetchResponse.arrayBuffer());
    const cleanBuffer = processSignatureToWhiteBg(rawBuffer);

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(cleanBuffer);
  } catch (error) {
    console.error('Error fetching signature from Vercel Blob:', error);
    res.status(500).send('Error fetching signature from Vercel Blob');
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
