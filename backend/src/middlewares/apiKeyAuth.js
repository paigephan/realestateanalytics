// Import dotenv so we can read keys from .env
import dotenv from "dotenv";
dotenv.config();

// Middleware function for Express
export const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key']; // client must send in header
    if (!apiKey || apiKey !== process.env.SCRAPER_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized: invalid API key' });
    }
    next();
  };