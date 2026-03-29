import { pool } from '../config/db.js';

export const selectPropertyIDByAddressLandArea = async (data) => {
  const { address, land_area_m2 } = data;

  let query = "SELECT id FROM property_info WHERE 1=1";

  const request = pool.request();

  if (address != null && address !== '') {
    query += " AND LOWER(address) = @address";
    request.input('address', address.toLowerCase());
  }

  if (land_area_m2 != null && land_area_m2 !== '') {
    query += " AND land_area_m2 = @land_area_m2";
    request.input('land_area_m2', land_area_m2);
  }

  const result = await request.query(query);

  return result.recordset[0] || {};
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
    OUTPUT INSERTED.*
    VALUES 
      (@realestate_url, @image_url, @address, @land_area_m2, @district, @suburb, @property_type);
  `;

  const result = await pool.request()
    .input('realestate_url', realestate_url)
    .input('image_url', image_url)
    .input('address', address)
    .input('land_area_m2', land_area_m2)
    .input('district', district)
    .input('suburb', suburb)
    .input('property_type', property_type)
    .query(query);

  return result.recordset[0];
};

export const updatePropertyURLByID = async (data) => {
  const {
    realestate_url,
    property_id
  } = data;

  const query = `
    UPDATE property_info 
    SET realestate_url = @realestate_url,
        updated_at = GETDATE()
    OUTPUT INSERTED.*
    WHERE id = @property_id;
  `;

  const result = await pool.request()
    .input('realestate_url', realestate_url)
    .input('property_id', property_id)
    .query(query);

  return result.recordset[0] || {};
};

export const selectRandomImageURLs = async () => {

  const query = `
    SELECT image_url FROM (
      SELECT TOP 5 a.image_url 
      FROM property_info a
      JOIN property_sale_price sp ON a.id = sp.id
      WHERE sp.price <= 500000
      ORDER BY NEWID()
    ) t1

    UNION ALL

    SELECT image_url FROM (
      SELECT TOP 5 a.image_url 
      FROM property_info a
      JOIN property_sale_price sp ON a.id = sp.id
      WHERE sp.price > 500000 AND sp.price <= 1000000
      ORDER BY NEWID()
    ) t2

    UNION ALL

    SELECT image_url FROM (
      SELECT TOP 5 a.image_url 
      FROM property_info a
      JOIN property_sale_price sp ON a.id = sp.id
      WHERE sp.price > 1000000 AND sp.price <= 2000000
      ORDER BY NEWID()
    ) t3

    UNION ALL

    SELECT image_url FROM (
      SELECT TOP 5 a.image_url 
      FROM property_info a
      JOIN property_sale_price sp ON a.id = sp.id
      WHERE sp.price > 2000000
      ORDER BY NEWID()
    ) t4;
  `;

  try {
    const result = await pool.request().query(query);
    return result.recordset.map(row => row.image_url);
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
    const result = await pool.request().query(query);
    return result.recordset.map(row => row.suburb);
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
    const result = await pool.request().query(query);
    return result.recordset.map(row => row.district);
  } catch (err) {
    console.error("Error selecting distinct district:", err);
    return [];
  }
};

export const checkDistinctSuburbsFromDistricts = async (data) => {
  const { listSuburbs } = data;

  try {
    const request = pool.request();
    let query = `SELECT DISTINCT suburb FROM property_info`;

    if (listSuburbs && listSuburbs.length > 0) {
      // Add each district as a parameter dynamically
      listSuburbs.forEach((district, index) => {
        request.input(`district${index}`, district);
      });

      // Build IN clause dynamically
      const inClause = listSuburbs.map((_, index) => `@district${index}`).join(', ');

      query += ` WHERE district IN (${inClause})`;
    }
    // else: no WHERE clause, will select all

    const result = await request.query(query);
    return result.recordset;
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
    const request = pool.request();

    // Add parameters dynamically if arrays are non-empty
    let suburbFilter = '';
    if (suburbs && suburbs.length > 0 && !suburbs.includes('All')) {
      suburbs.forEach((s, i) => request.input(`suburb${i}`, s));
      suburbFilter = `AND suburb IN (${suburbs.map((_, i) => `@suburb${i}`).join(', ')})`;
    }

    let districtFilter = '';
    if (districts && districts.length > 0 && !districts.includes('All')) {
      districts.forEach((d, i) => request.input(`district${i}`, d));
      districtFilter = `AND district IN (${districts.map((_, i) => `@district${i}`).join(', ')})`;
    }

    // Add numeric filters if values are provided
    if (min_price != null) request.input('min_price', min_price);
    if (max_price != null) request.input('max_price', max_price);
    if (min_area != null) request.input('min_area', min_area);
    if (max_area != null) request.input('max_area', max_area);

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
          JOIN property_listing l on l.realestate_url = p.realestate_url
          where 
          p.property_type = 'House'
          and l.listing_date >= DATEADD(HOUR, -24, GETDATE())
      )
      SELECT *
      FROM combined
      WHERE 1=1
        ${suburbFilter}
        ${districtFilter}
        ${min_price != null ? 'AND final_price >= @min_price' : ''}
        ${max_price != null ? 'AND final_price <= @max_price' : ''}
        ${min_area != null ? 'AND land_area_m2 >= @min_area' : ''}
        ${max_area != null ? 'AND land_area_m2 <= @max_area' : ''}
        ORDER BY created_at ASC
    `;

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error('Error searching properties:', err);
    return [];
  }
};

export const select20latestHouseSales = async () => {
  const query = `
    SELECT TOP 20
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
    JOIN property_listing l on l.realestate_url = p.realestate_url
    where p.property_type = 'House'
    and l.listing_date >= DATEADD(HOUR, -24, GETDATE())
    ORDER BY p.created_at ASC;
  `;

  try {
    const result = await pool.request().query(query);
    return result.recordset; // ✅ better: return actual data
  } catch (err) {
    console.error("Error select20latestHouseSale:", err);
    return [];
  }
};