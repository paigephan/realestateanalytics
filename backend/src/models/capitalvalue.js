import { pool } from '../config/db.js';

export const insertPropertyCV = async (data) => {
    const {
      property_id,
      cv_date_text,
      cv_value_text,
      cv_value,
    } = data;
  
    const query = `
        INSERT INTO cv_most_recent (id, cv_date_text, cv_value_text, cv_value)
        VALUES ($1, $2, $3, $4)
    `;
  
    const values = [property_id, cv_date_text, cv_value_text, cv_value];
  
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const selectCVDate = async (data) => {
    const { property_id } = data;

    const query = "SELECT cv_date_text FROM cv_most_recent WHERE id = $1";
    const values = [property_id];
    const result = await pool.query(query, values);

    // return empty JSON if no row found
    return result.rows[0] || {};
};

export const updateCVDateValuebyID = async (data) => {
    const {
      cv_date_text,
      cv_value_text,
      cv_value,
      property_id
    } = data;
  
    const query = `
        UPDATE cv_most_recent
        SET cv_date_text = $1,
            cv_value_text = $2,
            cv_value = $3,
            updated_at = CURRENT_TIMESTAMP
        where id = $4
        returning *
    `;
  
    const values = [cv_date_text, cv_value_text, cv_value, property_id];
  
    const result = await pool.query(query, values);
    return result.rows[0];
  };