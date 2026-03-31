import {  selectPropertyIDByAddressLandArea, insertPropertyInfo, 
          updatePropertyURLByID, selectRandomImageURLs, 
          selectDistinctSuburb, selectDistinctDistrict, checkDistinctSuburbsFromDistricts,
          searchProperties, select20latestHouseSales, selectSalesCount} from '../models/property.js';
import {  addressLandAreaSchema, newpropertySchema, propertyURLSchema, selectSuburbSchema,
          searchPropertiesSchema } from '../validators/groupingvalidators.js';

export const getPropertyIDByAddressLandArea = async (req, res) => {
    try {
        // Validation
        const validatedData = await addressLandAreaSchema.validate(req.query, { abortEarly: false });
    
        // Call model
        const result = await selectPropertyIDByAddressLandArea(validatedData);
        
        res.json(result);
    
    } catch (err) {
        if (err.name === 'ValidationError') {
          return res.status(400).json({ errors: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};

export const createNewPropertyInfo = async (req, res) => {
    try {    
        // Validation
        const validatedData = await newpropertySchema.validate(req.body, { abortEarly: false });

        // Call model
        const property = await insertPropertyInfo(validatedData);
        
        // Restful response (201 + Location header)
        return res
        .status(201) // proper status code for creation
        .location(`/api/property/${property.id}`) // allow frontend or crawler to fetch directly
        .json({
            success: true,
            data: property
            });
  
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ errors: err.errors });
          }
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const updatePropertyURL = async (req, res) => {
    try {
      const { id } = req.params;
      const propertyId = parseInt(id);
  
      if (isNaN(propertyId)) {
        return res.status(400).json({ error: "Invalid property ID" });
      }
  
      // ✅ Validate only the URL field from body
      const { realestate_url } = await propertyURLSchema.validate(req.body, { abortEarly: false });
  
      // Call model
      const updatedProperty = await updatePropertyURLByID({ realestate_url, property_id: propertyId });
  
      if (!updatedProperty) {
        return res.status(404).json({ error: "Property not found" });
      }
  
      return res.status(200).json({
        message: "Property URL updated successfully",
        data: updatedProperty
      });
  
    } catch (err) {
      if (err.name === "ValidationError") {
        return res.status(400).json({ errors: err.errors });
      }
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
};

export const getRandomImageURLs = async (req, res) => {
  try {
  
      // Call model
      const result = await selectRandomImageURLs();
      
      res.json(result);
  
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

export const getDistinctSuburb = async (req, res) => {
  try {
  
      // Call model
      const result = await selectDistinctSuburb();
      
      res.json(result);
  
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

export const getDistinctDistrict = async (req, res) => {
  try {
  
      // Call model
      const result = await selectDistinctDistrict();
      
      res.json(result);
  
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

export const getDistinctSuburbsFromDistricts = async (req, res) => {
  try {
    // ✅ Validate input
    const validatedData = await selectSuburbSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // ✅ Call service
    const result = await checkDistinctSuburbsFromDistricts(validatedData);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    // ✅ Handle validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        errors: err.errors,
      });
    }

    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const searchPropertiesController = async (req, res) => {
  try {
    // 1️⃣ Validate request body
    const validated = await searchPropertiesSchema.validate(req.body, {
      abortEarly: false,
    });

    // 2️⃣ Call model
    const results = await searchProperties(validated);

    // 3️⃣ Response
    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        errors: err.errors
      });
    }

    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

export const get20latestHouseSales = async (req, res) => {
  try {
  
      // Call model
      const result = await select20latestHouseSales();
      
      return res.status(200).json({
        success: true,
        count: result.length,
        data: result
      });

  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

export const getSalesCount = async (req, res) => {
  try {
  
      // Call model
      const result = await selectSalesCount();
      
      return res.status(200).json({
        success: true,
        count: result.length,
        data: result
      });

  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};