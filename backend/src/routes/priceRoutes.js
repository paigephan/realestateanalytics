// API routes
import express from 'express';
import { createNewPropertyPrice, getPropertyPriceByID } from '../controllers/priceController.js';
import { apiKeyAuth } from '../middlewares/apiKeyAuth.js';

const router = express.Router();

router.post('/',apiKeyAuth, createNewPropertyPrice);
router.get('/:id',apiKeyAuth, getPropertyPriceByID);

export default router;