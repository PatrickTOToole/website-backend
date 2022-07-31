const { Pool } = require('pg')
const pool = new Pool({
  host: 'postgres',
  user: 'postgres',
  password: 'temp'
})

module.exports = {
  query: (text, params) => pool.query(text, params),
}
