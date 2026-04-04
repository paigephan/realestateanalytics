import { pool } from '../config/db_local.js';

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
    WITH ranked AS (
      SELECT 
        a.image_url,
        CASE 
          WHEN sp.price <= 500000 THEN 1
          WHEN sp.price <= 1000000 THEN 2
          WHEN sp.price <= 2000000 THEN 3
          ELSE 4
        END AS price_bucket,
        ROW_NUMBER() OVER (
          PARTITION BY CASE 
            WHEN sp.price <= 500000 THEN 1
            WHEN sp.price <= 1000000 THEN 2
            WHEN sp.price <= 2000000 THEN 3
            ELSE 4
          END
          ORDER BY RANDOM()
        ) AS rn
      FROM property_info a
      JOIN property_sale_price sp ON a.id = sp.id
    )
    SELECT image_url
    FROM ranked
    WHERE rn <= 5
    ORDER BY price_bucket, rn;
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
    SELECT geojson_suburb as suburb
    FROM (
        SELECT DISTINCT geojson_suburb FROM property_info
        UNION
        SELECT 'All' AS geojson_suburb
    ) t
    ORDER BY 
        CASE WHEN geojson_suburb = 'All' THEN 1 ELSE 0 END DESC,
        geojson_suburb ASC;
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
  suburbs: geojson_suburbs,
  districts,
  min_price,
  max_price,
  min_area,
  max_area
}) => {
  try {
    const values = [];
    const nextParam = () => `$${values.push(...arguments) || values.length}`;

    // Build suburb filter
    let suburbFilter = '';
    if (geojson_suburbs && geojson_suburbs.length > 0 && !geojson_suburbs.includes('All')) {
      const placeholders = geojson_suburbs.map(s => {
        values.push(s);
        return `$${values.length}`;
      });
      suburbFilter = `AND suburb IN (${placeholders.join(', ')})`;
    }

    // Build district filter
    let districtFilter = '';
    if (districts && districts.length > 0 && !districts.includes('All')) {
      const placeholders = districts.map(d => {
        values.push(d);
        return `$${values.length}`;
      });
      districtFilter = `AND district IN (${placeholders.join(', ')})`;
    }

    // Build numeric filters
    let minPriceFilter = '';
    if (min_price != null) {
      values.push(min_price);
      minPriceFilter = `AND final_price >= $${values.length}`;
    }

    let maxPriceFilter = '';
    if (max_price != null) {
      values.push(max_price);
      maxPriceFilter = `AND final_price <= $${values.length}`;
    }

    let minAreaFilter = '';
    if (min_area != null) {
      values.push(min_area);
      minAreaFilter = `AND land_area_m2 >= $${values.length}`;
    }

    let maxAreaFilter = '';
    if (max_area != null) {
      values.push(max_area);
      maxAreaFilter = `AND land_area_m2 <= $${values.length}`;
    }

    const query = `
      WITH latest_sale AS (
        SELECT sp1.id, sp1.pricing_method, sp1.price, sp1.created_at
        FROM property_sale_price sp1
        INNER JOIN (
          SELECT id, MAX(created_at) AS max_created
          FROM property_sale_price
          GROUP BY id
        ) sp2 ON sp1.id = sp2.id AND sp1.created_at = sp2.max_created
      ),
      earliest_listing AS (
        SELECT realestate_url
        FROM property_listing
        WHERE listing_date >= NOW() - INTERVAL '168 hours'
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
          p.geojson_suburb AS suburb,
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
    WITH earliest_listing AS (
      SELECT 
        realestate_url,
        MIN(listing_date) AS earliest_listing_date
      FROM property_listing
      WHERE listing_date >= NOW() - INTERVAL '168 hours'
      GROUP BY realestate_url
    )

    SELECT
      p.created_at,
      p.id,
      p.realestate_url,
      p.image_url, 
      p.address, 
      p.land_area_m2, 
      p.geojson_suburb AS suburb,
      p.district,
      c.cv_date_text,
      c.cv_value,
      ls.pricing_method,
      ls.price,
      COALESCE(ls.price, c.cv_value) AS final_price
    FROM property_info p
    INNER JOIN cv_most_recent c ON p.id = c.id
    LEFT JOIN property_sale_price ls ON ls.id = p.id
    INNER JOIN earliest_listing l ON l.realestate_url = p.realestate_url
    WHERE p.property_type = 'House'
    ORDER BY l.earliest_listing_date ASC
    LIMIT 20
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
    SELECT p.geojson_suburb as suburb, p.district, COUNT(p.id) AS sales_count
    FROM property_info p 
    INNER JOIN all_listing l ON l.realestate_url = p.realestate_url
    WHERE p.property_type = 'House'
    GROUP BY p.geojson_suburb, p.district;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error("Error get AnalyticsData:", err);
    return [];
  }
};

export const selectAllAddresses = async () => {
  const query = `
      select id, address from property_info
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error("Error get Addresses:", err);
    return [];
  }
};

export const updatePropertyGeoJsonSuburb = async (data) => {
  const {
    geojson_suburb,
    property_id
  } = data;

  const query = `
    UPDATE property_info 
    SET geojson_suburb = $1,
        updated_at = NOW()
    WHERE id = $2 AND geojson_suburb IS NULL
    RETURNING *;
  `;

  const result = await pool.query(query, [geojson_suburb, property_id]);

  return result.rows[0] || {};
};