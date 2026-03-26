import { pool } from '../config/db.js';

export const insertListing = async (data) => {
  const {
    page_no,
    realestate_url,
  } = data;

  const query = `
    INSERT INTO property_listing (page_no, realestate_url, listing_date)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT DO NOTHING
    RETURNING *;
  `;

  const values = [page_no, realestate_url];

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};