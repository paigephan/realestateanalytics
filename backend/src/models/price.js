import { pool } from '../config/db.js';

export const insertPropertyPrice = async (data) => {
  const {
    property_id,
    pricing_method,
    price,
  } = data;

  const query = `
    INSERT INTO property_sale_price (id, pricing_method, price)
    OUTPUT INSERTED.*
    VALUES (@property_id, @pricing_method, @price);
  `;

  const result = await pool.request()
    .input('property_id', property_id)
    .input('pricing_method', pricing_method)
    .input('price', price)
    .query(query);

  return result.recordset[0];
};

export const selectPricebyID = async (data) => {
  const { property_id } = data;

  const query = `
    SELECT TOP 1 pricing_method
    FROM property_sale_price
    WHERE id = @property_id
    ORDER BY created_at DESC
  `;

  const result = await pool.request()
    .input('property_id', property_id)
    .query(query);

  return result.recordset[0] || {};
};