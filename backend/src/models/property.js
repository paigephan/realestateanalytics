import { pool } from '../config/db.js';

export const selectPropertyIDByAddressLandArea = async (data) => {
    const { address, land_area_m2 } = data;

    let query = "SELECT id FROM property_info WHERE 1=1";
    let params = [];
    let index = 1; // <= important

    if (address != null && address !== '') {
        query += ` AND LOWER(address) = LOWER($${index})`; 
        params.push(address.toLowerCase());
        index++;
    }

    if (land_area_m2 != null && land_area_m2 !== '') {
        query += ` AND land_area_m2 = $${index}`;
        params.push(land_area_m2);
        index++;
    }

    const result = await pool.query(query, params);

    // return empty JSON if no row found
    return result.rows[0] || {};
};

export const insertPropertyInfo = async ({
      realestate_url,
      image_url,
      address,
      land_area_m2,
    }) => {  
    const query = `
        INSERT INTO property_info (realestate_url, image_url, address, land_area_m2)
        VALUES ($1, $2, $3, $4)
        Returning *
    `;
  
    const values = [realestate_url, image_url, address, land_area_m2];
  
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const updatePropertyURLByID = async (data) => {
    const {
      realestate_url,
      property_id
    } = data;
  
    const query = `
        UPDATE property_info 
        SET realestate_url = $1,
            updated_at = CURRENT_TIMESTAMP
        where id = $2
        returning *
    `;
  
    const values = [realestate_url, property_id];
  
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const selectRandomImageURLs = async () => {
  
    // SQL query with consistent aliases
    const query = `
      (SELECT a.image_url FROM property_info a
        JOIN property_sale_price sp ON a.id = sp.id
        WHERE sp.price <= 500000
        ORDER BY RANDOM()
        LIMIT 5)
      UNION ALL
      (SELECT a.image_url FROM property_info a
        JOIN property_sale_price sp ON a.id = sp.id
        WHERE sp.price <= 1000000 AND sp.price > 500000
        ORDER BY RANDOM()
        LIMIT 5)
      UNION ALL
      (SELECT a.image_url FROM property_info a
        JOIN property_sale_price sp ON a.id = sp.id
        WHERE sp.price <= 2000000 AND sp.price > 1000000
        ORDER BY RANDOM()
        LIMIT 5)
      UNION ALL
      (SELECT a.image_url FROM property_info a
        JOIN property_sale_price sp ON a.id = sp.id
        WHERE sp.price > 2000000
        ORDER BY RANDOM()
        LIMIT 5);
    `;
  
    try {
      const result = await pool.query(query); // no params needed
      // return all image URLs as array
      return result.rows.map(row => row.image_url);
    } catch (err) {
      console.error("Error selecting random images:", err);
      return [];
    }
};

export const selectDistinctSuburb = async () => {
  
    const query = `
    SELECT DISTINCT suburb FROM property_info
    UNION
    SELECT 'All'
    ORDER BY suburb ASC;
    `;
  
    try {
      const result = await pool.query(query); // no params needed
      // return all image URLs as array
      return result.rows.map(row => row.image_url);
    } catch (err) {
      console.error("Error selecting distinct suburb:", err);
      return [];
    }
};

export const selectDistinctDistrict = async () => {
  
    const query = `
    SELECT DISTINCT district FROM property_info
    UNION
    SELECT 'All'
    ORDER BY district ASC;
    `;
  
    try {
      const result = await pool.query(query); // no params needed
      // return all image URLs as array
      return result.rows.map(row => row.image_url);
    } catch (err) {
      console.error("Error selecting distinct district:", err);
      return [];
    }
};

// export const selectDistinctDistrictFromSuburb = async (data) => {
//     const { listSuburbs } = data;

//     const query = `
//     select distinct suburb from property_info where district in $1
//     `;
  
//     try {
//       const result = await pool.query(query); // no params needed
//       // return all image URLs as array
//       return result.rows.map(row => row.image_url);
//     } catch (err) {
//       console.error("Error selecting distinct district:", err);
//       return [];
//     }
// };