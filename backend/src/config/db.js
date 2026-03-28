import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

// Connection configuration
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST, 
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  options: {
    encrypt: true,
    trustServerCertificate: true, // for local dev without SSL
  },
};

// Create pool
export const pool = new sql.ConnectionPool(config);

// Connect once
export const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Microsoft SQL Server database connected');
  } catch (err) {
    console.error('DB connection error', err);
    process.exit(1);
  }
};
