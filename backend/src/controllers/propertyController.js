import { selectPropertyIDByAddressLandArea, insertPropertyInfo, updatePropertyURLByID, selectRandomImageURLs } from '../models/property.js';
import { addressLandAreaSchema, newpropertySchema, propertyURLSchema
 } from '../validators/groupingvalidators.js';

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