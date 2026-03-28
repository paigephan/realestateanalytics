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
      OUTPUT INSERTED.*
      VALUES (@property_id, @cv_date_text, @cv_value_text, @cv_value);
    `;
  
    const result = await pool.request()
      .input('property_id', property_id)
      .input('cv_date_text', cv_date_text)
      .input('cv_value_text', cv_value_text)
      .input('cv_value', cv_value)
      .query(query);
  
    return result.recordset[0]; // equivalent to rows[0]
  };

export const selectCVDate = async (data) => {
    const { property_id } = data;

    const query = `
        SELECT cv_date_text 
        FROM cv_most_recent 
        WHERE id = @property_id
    `;

    const result = await pool.request()
        .input('property_id', property_id)
        .query(query);

    // return empty object if no row found
    return result.recordset[0] || {};
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
      SET cv_date_text = @cv_date_text,
          cv_value_text = @cv_value_text,
          cv_value = @cv_value,
          updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @property_id;
    `;
  
    const result = await pool.request()
      .input('cv_date_text', cv_date_text)
      .input('cv_value_text', cv_value_text)
      .input('cv_value', cv_value)
      .input('property_id', property_id)
      .query(query);
  
    return result.recordset[0]; // must not include || {} as crawler use this logic
  };