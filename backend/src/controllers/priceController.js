// import { insertPropertyPrice, selectPricebyID } from '../models/price.js';
import { insertPropertyPrice, selectPricebyID } from '../models_local/price.js';

import { propertyPriceSchema} from '../validators/groupingvalidators.js';

export const createNewPropertyPrice = async (req, res) => {
    try {
      // Validation
      const validatedData = await propertyPriceSchema.validate(req.body, { abortEarly: false });
        
      const propertyprice = await insertPropertyPrice(validatedData);
  
      res.status(201).json({
        message: 'Price created successfully',
        data: propertyprice
      });
  
    } catch (err) {
        if (err.name === 'ValidationError') {
          return res.status(400).json({ error: err.message });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
  };

export const getPropertyPriceByID = async (req, res) => {
    try {
        // Get id from route params
        const { id } = req.params;
        const propertyID = parseInt(id);

        if (!id) {
        return res.status(400).json({ error: 'id is required' });
        }

        if (isNaN(propertyID)) {
            return res.status(400).json({ error: 'Invalid property ID' });
          }
      
  
        const propertyPrice = await selectPricebyID({ property_id: propertyID});
  
        if (!propertyPrice) {
            return res.status(404).json({ error: 'Property price not found' });
          }

        // Success response
        return res.status(200).json(propertyPrice);
  
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};