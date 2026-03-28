// main server entry point
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from "cors";

// Set's our port to the PORT environment variable, or 3000 by default if the env is not configured.
const PORT = process.env.PORT || 1433;

// Make sure our database is up and running
import {connectDB} from './config/db.js';
connectDB();

// Creates the express server
const app = express();

/**
 * Configure middleware (logging, CORS support, JSON parsing support,
 * static files support, cookie parser)
 *
 * CORS is configured to allow cookies and these two origins from fetch() requests.
 * Feel free to reconfigure if required, or add your own middleware.
 */
app.use(express.json());
app.use(cors());

// Serve frontend build
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '../public')));


// Test localhost:3000
app.get("/", (req, res) => {res.send("API is running...");});

import listinghistory from './routes/listingRoutes.js';
app.use('/api/listinghistory', listinghistory);

import property from './routes/propertyRoutes.js';
app.use('/api/property', property);

import capitalvalue from './routes/capitalvalueRoutes.js';
app.use('/api/propertycv', capitalvalue);

import propertyprice from './routes/priceRoutes.js';
app.use('/api/propertyprice', propertyprice);

app.listen(PORT, () => console.log(`Server running on port meomeo ${PORT}`));

// ✅ SPA fallback LAST (use app.use instead of app.get)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });