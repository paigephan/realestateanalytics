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
      district,
      suburb,
    }) => {  
    const query = `
        INSERT INTO property_info (realestate_url, image_url, address, land_area_m2, district, suburb)
        VALUES ($1, $2, $3, $4, $5, $6)
        Returning *
    `;
  
    const values = [realestate_url, image_url, address, land_area_m2, district, suburb];
  
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
        SELECT suburb
        FROM (
            SELECT DISTINCT suburb FROM property_info
            UNION
            SELECT 'All' AS suburb
        ) t
        ORDER BY 
            (suburb = 'All') DESC,
            suburb ASC;
    `;
  
    try {
      const result = await pool.query(query); // no params needed
      // return all image URLs as array
      return result.rows.map(row => row.suburb);
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
      return result.rows.map(row => row.district);
    } catch (err) {
      console.error("Error selecting distinct district:", err);
      return [];
    }
};

export const checkDistinctSuburbsFromDistricts = async (data) => {
    const { listSuburbs } = data;

    if (!listSuburbs || listSuburbs.length === 0) return [];

    const query = `
        SELECT suburb
        FROM property_info
        WHERE 
        $1::text[] IS NULL OR district = ANY($1)
    `;

    const values = [listSuburbs];
    const result = await pool.query(query, values);

    return result.rows;
};

export const searchProperties = async ({
    suburbs,
    districts,
    min_price,
    max_price,
    min_area,
    max_area
  }) => {
  
    const query = `
      WITH latest_sale AS (
          SELECT DISTINCT ON (id) 
                 id, pricing_method, price, created_at
          FROM property_sale_price
          ORDER BY id, created_at DESC
      ),
      combined AS (
          SELECT 
              p.id,
              p.realestate_url,
              p.image_url, 
              p.address, 
              p.land_area_m2, 
              p.suburb,
              p.district,
              c.cv_date_text,
              c.cv_value,
              t1.pricing_method,
              t1.price,
              COALESCE(t1.price, c.cv_value) AS final_price
          FROM property_info p
          LEFT JOIN cv_most_recent c ON p.id = c.id
          LEFT JOIN latest_sale t1 ON t1.id = p.id
      )
      SELECT *
      FROM combined
      WHERE 
          (
            ($1::text[] IS NULL OR suburb = ANY($1))
            AND ($2::text[] IS NULL OR district = ANY($2))
          )
          AND ($3::numeric IS NULL OR final_price >= $3)
          AND ($4::numeric IS NULL OR final_price <= $4)
          AND ($5::numeric IS NULL OR land_area_m2 >= $5)
          AND ($6::numeric IS NULL OR land_area_m2 <= $6)
    `;
  
    const values = [
      suburbs?.length ? suburbs : null,
      districts?.length ? districts : null,
      min_price ?? null,
      max_price ?? null,
      min_area ?? null,
      max_area ?? null
    ];
  
    const { rows } = await pool.query(query, values);
    return rows;
  };