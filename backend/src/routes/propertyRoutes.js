// API routes
import express from 'express';
import { getPropertyIDByAddressLandArea, createNewPropertyInfo, 
        updatePropertyURL, getRandomImageURLs, getDistinctSuburb, 
        getDistinctDistrict, getDistinctSuburbsFromDistricts,
        searchPropertiesController, get20latestHouseSales,
        getSalesCount, getAllAddresses, updateGeoJsonSuburb
        } from '../controllers/propertyController.js';
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
router.get('/latesthousesales', get20latestHouseSales);
router.get('/latesthousesales', get20latestHouseSales);
router.get('/salescount', getSalesCount);
router.get('/alladdresses', getAllAddresses);
router.patch('/:id/geojsonsuburb', apiKeyAuth, updateGeoJsonSuburb);

export default router;
