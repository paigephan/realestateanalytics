// API routes
import express from 'express';
import { createNewPropertyCV, updatePropertyCVByID, getCVDate } from '../controllers/capitalvalueController.js';
import { apiKeyAuth } from '../middlewares/apiKeyAuth.js';

const router = express.Router();

router.post('/',apiKeyAuth, createNewPropertyCV);
router.patch('/:id',apiKeyAuth, updatePropertyCVByID);
router.get('/:id/date',apiKeyAuth, getCVDate);

export default router;