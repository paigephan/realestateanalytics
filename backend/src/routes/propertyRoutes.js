// API routes
import express from 'express';
import { getPropertyIDByAddressLandArea, createNewPropertyInfo, 
        updatePropertyURL, getRandomImageURLs, getDistinctSuburb, 
        getDistinctDistrict, getDistinctSuburbsFromDistricts,
        searchPropertiesController} from '../controllers/propertyController.js';
import { apiKeyAuth } from '../middlewares/apiKeyAuth.js';

const router = express.Router();

router.get('/searchid',apiKeyAuth, getPropertyIDByAddressLandArea);
router.post('/',apiKeyAuth, createNewPropertyInfo);
router.patch('/:id/url',apiKeyAuth, updatePropertyURL);
router.get('/randomimages',apiKeyAuth, getRandomImageURLs);
router.get('/suburbs', apiKeyAuth, getDistinctSuburb);
router.get('/districts', apiKeyAuth, getDistinctDistrict);
router.get('/suburbsfromdistricts', apiKeyAuth, getDistinctSuburbsFromDistricts);
router.post("/search", searchPropertiesController);

export default router;
