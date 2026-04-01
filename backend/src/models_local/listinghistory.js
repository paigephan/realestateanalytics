import { pool } from '../config/db.js';

export const insertListing = async (data) => {
  const { page_no, realestate_url } = data;

  const query = `
    INSERT INTO property_listing (page_no, realestate_url, listing_date)
    VALUES ($1, $2, NOW())
    ON CONFLICT DO NOTHING
    RETURNING *;
  `;

  // Note: Requires a unique constraint on (realestate_url, listing_date::date)
  // CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_url_date 
  // ON property_listing (realestate_url, CAST(listing_date AS DATE));

  const result = await pool.query(query, [page_no, realestate_url]);

  return result.rows[0] || null;
};