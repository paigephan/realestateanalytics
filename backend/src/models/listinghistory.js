import { pool } from '../config/db.js';

export const insertListing = async (data) => {
  const { page_no, realestate_url } = data;

  const query = `
    IF NOT EXISTS (
      SELECT 1 
      FROM property_listing
      WHERE realestate_url = @realestate_url
      AND CAST(listing_date AS DATE) = CAST(GETDATE() AS DATE)
    )
    BEGIN
      INSERT INTO property_listing (page_no, realestate_url, listing_date)
      OUTPUT INSERTED.*
      VALUES (@page_no, @realestate_url, GETDATE());
    END
  `;

  const result = await pool.request()
    .input('page_no', page_no)
    .input('realestate_url', realestate_url)
    .query(query);

  return result.recordset[0] || null;
};