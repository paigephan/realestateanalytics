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

import { connectDB } from './config/db.js';
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// 🚧 MAINTENANCE — now path/__dirname are defined ✅
const MAINTENANCE_MODE = true;

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
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));