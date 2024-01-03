const { Pool } = require('pg');
const dbConfig = require('./config');

const pool = new Pool({
  user: dbConfig.user,
  password: dbConfig.password,
  host: dbConfig.host,
  database: dbConfig.database,
  port: dbConfig.port,
});

pool.on('error', (err, client) => {
  console.error('Error:', err);
});

module.exports = {
  // Possible enhancement: Query logging (filtered for sensitive data) + query metrics (like query run time)
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
};
