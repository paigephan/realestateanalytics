import { pool } from '../config/db.js';

export const selectPropertyIDByAddressLandArea = async (data) => {
  const { address, land_area_m2 } = data;

  let query = "SELECT id FROM property_info WHERE 1=1";
  const values = [];
  let paramIndex = 1;

  if (address != null && address !== '') {
    query += ` AND LOWER(address) = $${paramIndex++}`;
    values.push(address.toLowerCase());
  }

  if (land_area_m2 != null && land_area_m2 !== '') {
    query += ` AND land_area_m2 = $${paramIndex++}`;
    values.push(land_area_m2);
  }

  const result = await pool.query(query, values);

  return result.rows[0] || {};
};

export const insertPropertyInfo = async ({
  realestate_url,
  image_url,
  address,
  land_area_m2,
  district,
  suburb,
  property_type,
}) => {

  const query = `
    INSERT INTO property_info 
      (realestate_url, image_url, address, land_area_m2, district, suburb, property_type)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    realestate_url, image_url, address, land_area_m2, district, suburb, property_type
  ]);

  return result.rows[0];
};

export const updatePropertyURLByID = async (data) => {
  const { realestate_url, property_id } = data;

  const query = `
    UPDATE property_info 
    SET realestate_url = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;

  const result = await pool.query(query, [realestate_url, property_id]);

  return result.rows[0] || {};
};

export const selectRandomImageURLs = async () => {
  const query = `
    SELECT image_url FROM (
      SELECT a.image_url 
      FROM property_info a
      JOIN property_sale_price sp ON a.id = sp.id
      WHERE sp.price <= 500000
      ORDER BY RANDOM() LIMIT 5
    ) t1

    UNION ALL

    SELECT image_url FROM (
      SELECT a.image_url 
      FROM property_info a
      JOIN property_sale_price sp ON a.id = sp.id
      WHERE sp.price > 500000 AND sp.price <= 1000000
      ORDER BY RANDOM() LIMIT 5
    ) t2

    UNION ALL

    SELECT image_url FROM (
      SELECT a.image_url 
      FROM property_info a
      JOIN property_sale_price sp ON a.id = sp.id
      WHERE sp.price > 1000000 AND sp.price <= 2000000
      ORDER BY RANDOM() LIMIT 5
    ) t3

    UNION ALL

    SELECT image_url FROM (
      SELECT a.image_url 
      FROM property_info a
      JOIN property_sale_price sp ON a.id = sp.id
      WHERE sp.price > 2000000
      ORDER BY RANDOM() LIMIT 5
    ) t4;
  `;

  try {
    const result = await pool.query(query);
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
        CASE WHEN suburb = 'All' THEN 1 ELSE 0 END DESC,
        suburb ASC;
  `;

  try {
    const result = await pool.query(query);
    return result.rows.map(row => row.suburb);
  } catch (err) {
    console.error("Error selecting distinct suburb:", err);
    return [];
  }
};

export const selectDistinctDistrict = async () => {
  const query = `
    SELECT district
    FROM (
        SELECT DISTINCT district FROM property_info
        UNION
        SELECT 'All' AS district
    ) t
    ORDER BY 
        CASE WHEN district = 'All' THEN 1 ELSE 0 END DESC,
        district ASC;
  `;

  try {
    const result = await pool.query(query);
    return result.rows.map(row => row.district);
  } catch (err) {
    console.error("Error selecting distinct district:", err);
    return [];
  }
};

export const checkDistinctSuburbsFromDistricts = async (data) => {
  const { listSuburbs } = data;

  try {
    let query = `SELECT DISTINCT suburb FROM property_info`;
    const values = [];

    if (listSuburbs && listSuburbs.length > 0) {
      const inClause = listSuburbs.map((_, index) => `$${index + 1}`).join(', ');
      query += ` WHERE district IN (${inClause})`;
      values.push(...listSuburbs);
    }

    const result = await pool.query(query, values);
    return result.rows;
  } catch (err) {
    console.error("Error checking distinct suburbs:", err);
    return [];
  }
};

export const searchProperties = async ({
  suburbs,
  districts,
  min_price,
  max_price,
  min_area,
  max_area
}) => {
  try {
    const values = [];
    let paramIndex = 1;

    let suburbFilter = '';
    if (suburbs && suburbs.length > 0 && !suburbs.includes('All')) {
      const inClause = suburbs.map(() => `$${paramIndex++}`).join(', ');
      suburbFilter = `AND suburb IN (${inClause})`;
      values.push(...suburbs);
    }

    let districtFilter = '';
    if (districts && districts.length > 0 && !districts.includes('All')) {
      const inClause = districts.map(() => `$${paramIndex++}`).join(', ');
      districtFilter = `AND district IN (${inClause})`;
      values.push(...districts);
    }

    let minPriceFilter = '';
    if (min_price != null) { minPriceFilter = `AND final_price >= $${paramIndex++}`; values.push(min_price); }

    let maxPriceFilter = '';
    if (max_price != null) { maxPriceFilter = `AND final_price <= $${paramIndex++}`; values.push(max_price); }

    let minAreaFilter = '';
    if (min_area != null) { minAreaFilter = `AND land_area_m2 >= $${paramIndex++}`; values.push(min_area); }

    let maxAreaFilter = '';
    if (max_area != null) { maxAreaFilter = `AND land_area_m2 <= $${paramIndex++}`; values.push(max_area); }

    const query = `
      WITH latest_sale AS (
          SELECT sp1.id, sp1.pricing_method, sp1.price, sp1.created_at
          FROM property_sale_price sp1
          INNER JOIN (
              SELECT id, MAX(created_at) AS max_created
              FROM property_sale_price
              GROUP BY id
          ) sp2
          ON sp1.id = sp2.id AND sp1.created_at = sp2.max_created
      ),
      earliest_listing AS (
        SELECT realestate_url
        FROM property_listing
        GROUP BY realestate_url
      ),
      combined AS (
          SELECT 
              p.id,
              p.created_at,
              p.realestate_url,
              p.image_url, 
              p.address, 
              p.land_area_m2, 
              p.suburb,
              p.district,
              c.cv_date_text,
              c.cv_value,
              ls.pricing_method,
              ls.price,
              COALESCE(ls.price, c.cv_value) AS final_price
          FROM property_info p
          LEFT JOIN cv_most_recent c ON p.id = c.id
          LEFT JOIN latest_sale ls ON ls.id = p.id
          JOIN earliest_listing l ON l.realestate_url = p.realestate_url
          WHERE p.property_type = 'House'
      )
      SELECT *
      FROM combined
      WHERE 1=1
        ${suburbFilter}
        ${districtFilter}
        ${minPriceFilter}
        ${maxPriceFilter}
        ${minAreaFilter}
        ${maxAreaFilter}
      ORDER BY created_at ASC
    `;

    const result = await pool.query(query, values);
    return result.rows;
  } catch (err) {
    console.error('Error searching properties:', err);
    return [];
  }
};

export const select20latestHouseSales = async () => {
  const query = `
    SELECT
      p.created_at,
      p.id,
      p.realestate_url,
      p.image_url, 
      p.address, 
      p.land_area_m2, 
      p.suburb,
      p.district,
      c.cv_date_text,
      c.cv_value,
      ls.pricing_method,
      ls.price,
      COALESCE(ls.price, c.cv_value) AS final_price
    FROM property_info p
    JOIN cv_most_recent c ON p.id = c.id
    JOIN property_sale_price ls ON ls.id = p.id
    JOIN property_listing l ON l.realestate_url = p.realestate_url
    WHERE p.property_type = 'House'
    ORDER BY p.created_at ASC
    LIMIT 20;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error("Error select20latestHouseSale:", err);
    return [];
  }
};

export const selectSalesCount = async () => {
  const query = `
    WITH all_listing AS (
      SELECT DISTINCT realestate_url
      FROM property_listing
    )
    SELECT p.suburb, p.district, COUNT(p.id) AS sales_count
    FROM property_info p 
    INNER JOIN all_listing l ON l.realestate_url = p.realestate_url
    WHERE p.property_type = 'House'
    GROUP BY p.suburb, p.district;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error("Error get AnalyticsData:", err);
    return [];
  }
};