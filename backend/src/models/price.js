import { pool } from '../config/db.js';

export const insertPropertyPrice = async (data) => {
    const {
      property_id,
      pricing_method,
      price,
    } = data;
  
    const query = `
        INSERT INTO property_sale_price (id, pricing_method, price)
        VALUES ($1, $2, $3)
    `;
  
    const values = [property_id, pricing_method, price];
  
    const result = await pool.query(query, values);
    return result.rows[0];
  };

export const selectPricebyID = async (data) => {
    const { property_id } = data;

    const query = "SELECT price FROM property_sale_price WHERE id = $1 order by created_at desc limit 1";
    const values = [property_id];
    const result = await pool.query(query, values);

    // return empty JSON if no row found
    return result.rows[0] || {};
};