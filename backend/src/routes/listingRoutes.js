// API routes
import express from 'express';
import { createNewListing } from '../controllers/listingController.js';
import { apiKeyAuth } from '../middlewares/apiKeyAuth.js';

const router = express.Router();

router.post('/',apiKeyAuth, createNewListing);

export default router;