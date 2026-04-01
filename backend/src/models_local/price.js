import { pool } from '../config/db_local.js';

export const insertPropertyPrice = async (data) => {
  const {
    property_id,
    pricing_method,
    price,
  } = data;

  const query = `
    INSERT INTO property_sale_price (id, pricing_method, price)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const result = await pool.query(query, [property_id, pricing_method, price]);

  return result.rows[0];
};

export const selectPricebyID = async (data) => {
  const { property_id } = data;

  const query = `
    SELECT pricing_method
    FROM property_sale_price
    WHERE id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const result = await pool.query(query, [property_id]);

  return result.rows[0] || {};
};