// API routes
import express from 'express';
import { getPropertyIDByAddressLandArea, createNewPropertyInfo, updatePropertyURL, getRandomImageURLs } from '../controllers/propertyController.js';
import { apiKeyAuth } from '../middlewares/apiKeyAuth.js';

const router = express.Router();

router.get('/searchid',apiKeyAuth, getPropertyIDByAddressLandArea);
router.post('/',apiKeyAuth, createNewPropertyInfo);
router.patch('/:id/url',apiKeyAuth, updatePropertyURL);
router.get('/randomimages',apiKeyAuth, getRandomImageURLs);

export default router;
