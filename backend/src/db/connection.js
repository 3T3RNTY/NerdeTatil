/**
 * PostgreSQL Database Connection
 * For Node.js backend (Express.js)
 * 
 * Usage example:
 * const db = require('./connection');
 * 
 * // Query execution:
 * const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
 * const rows = result.rows;
 * 
 * // Transaction:
 * const client = await db.connect();
 * try {
 *   await client.query('BEGIN');
 *   // ... queries
 *   await client.query('COMMIT');
 * } catch (e) {
 *   await client.query('ROLLBACK');
 *   throw e;
 * } finally {
 *   client.release();
 * }
 */

const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'nerdetatil_user',
  password: process.env.DB_PASSWORD || 'nerdetatil_password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'nerdetatil_db',
  // Connection pool options
  max: 20,                 // Maximum number of clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Error handling
pool.on('error', (err) => {
  console.error('❌ Unexpected pool error:', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('✓ Database pool connected');
});

/**
 * Execute a query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = (text, params) => {
  const start = Date.now();
  return pool.query(text, params).then((res) => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('[DB Query]', { text, duration, rows: res.rowCount });
    }
    return res;
  });
};

/**
 * Get a client for transactions
 * @returns {Promise} Client object
 */
const connect = () => pool.connect();

/**
 * Close all connections
 */
const end = () => pool.end();

module.exports = {
  query,
  connect,
  end,
  pool,
};
