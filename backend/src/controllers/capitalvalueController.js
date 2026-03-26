import { insertPropertyCV, updateCVDateValuebyID, selectCVDate } from '../models/capitalvalue.js';
import { propertyCVSchema } from '../validators/groupingvalidators.js';

export const createNewPropertyCV = async (req, res) => {
    try {
        // Validation
        const validatedData = await propertyCVSchema.validate(req.body, { abortEarly: false });
            
        // Call model
        const propertycv = await insertPropertyCV(validatedData);

        res.status(201).json({
            message: 'CV created successfully',
            data: propertycv
        });
    
    } catch (err) {
        if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const updatePropertyCVByID = async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
    
      if (isNaN(propertyId)) {
        return res.status(400).json({ error: "Invalid property ID" });
      }

      // ✅ Validate only the CV fields from body
      const propertyCV = await propertyCVSchema.validate(req.body, { abortEarly: false });
  
      // 2️⃣ Call model
      const updatedPropertyCV = await updateCVDateValuebyID({ ...propertyCV, property_id: propertyId});
      
      if (!updatedPropertyCV) {
        return res.status(404).json({ error: "Property not found" });
      }

      // 4️⃣ Success response
      return res.status(200).json({
        message: "Property CV updated successfully",
        data: updatedPropertyCV
      });
  
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ errors: err.errors });
          }
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getCVDate = async (req, res) => {
    try {
        const propertyId = parseInt(req.params.id);
  
        if (isNaN(propertyId)) {
            return res.status(400).json({ error: "Invalid property ID" });
        }
  
        const result = await selectCVDate({ property_id: propertyId });
  
        res.json(result);
  
    } catch (err) {
        if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
  };