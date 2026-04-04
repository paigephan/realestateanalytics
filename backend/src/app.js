import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 1433;

// Creates the express server
const app = express();

app.use(express.json());
app.use(cors());

// 🚧 MAINTENANCE MODE
const MAINTENANCE_MODE = false;

app.use((req, res, next) => {
  if (MAINTENANCE_MODE) {
    return res.sendFile(path.join(__dirname, '../public', 'maintenance.html'));
  }
  next();
});

// ── Routes ──
app.use(express.static(path.join(__dirname, '../public')));

app.get("/", (req, res) => { res.send("API is running..."); });

import listinghistory from './routes/listingRoutes.js';
app.use('/api/listinghistory', listinghistory);

import property from './routes/propertyRoutes.js';
app.use('/api/property', property);

import capitalvalue from './routes/capitalvalueRoutes.js';
app.use('/api/propertycv', capitalvalue);

import propertyprice from './routes/priceRoutes.js';
app.use('/api/propertyprice', propertyprice);

// ✅ SPA fallback LAST
app.use((req, res) => {
  if (MAINTENANCE_MODE) {
    return res.sendFile(path.join(__dirname, '../public', 'maintenance.html'));
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ✅ Start server first
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ✅ DB connects separately — won't crash server if it fails
// import { connectDB } from './config/db.js';
import { connectDB } from './config/db_local.js';

connectDB().catch(err => {
  console.error('❌ DB connection failed:', err.message);
  console.log('⚠️  Server still running — maintenance page is active');
});