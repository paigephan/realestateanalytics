// import { insertListing } from '../models/listinghistory.js';
import { insertListing } from '../models_local/listinghistory.js';
import { listingSchema } from '../validators/groupingvalidators.js';

export const createNewListing = async (req, res) => {
  try {
    const validatedData = await listingSchema.validate(req.body, { abortEarly: false})

    const listing = await insertListing(validatedData);

    // 3️⃣ Success response
    res.status(201)
       .json({
         message: 'Listing created successfully',
         data: listing
       });

  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};