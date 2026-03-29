// API routes
import express from 'express';
import { getPropertyIDByAddressLandArea, createNewPropertyInfo, 
        updatePropertyURL, getRandomImageURLs, getDistinctSuburb, 
        getDistinctDistrict, getDistinctSuburbsFromDistricts,
        searchPropertiesController, get20latestHouseSales} from '../controllers/propertyController.js';
import { apiKeyAuth } from '../middlewares/apiKeyAuth.js';

const router = express.Router();

router.get('/searchid',apiKeyAuth, getPropertyIDByAddressLandArea);
router.post('/',apiKeyAuth, createNewPropertyInfo);
router.patch('/:id/url',apiKeyAuth, updatePropertyURL);
router.get('/randomimages', getRandomImageURLs);
router.get('/suburbs', getDistinctSuburb);
router.get('/districts', getDistinctDistrict);
router.get('/suburbsfromdistricts', apiKeyAuth, getDistinctSuburbsFromDistricts);
router.post("/search", searchPropertiesController);
router.get('/latestHouseSales', get20latestHouseSales);

export default router;
