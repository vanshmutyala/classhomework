require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS calendar_notes (
      id SERIAL PRIMARY KEY,
      date_key VARCHAR(10) NOT NULL UNIQUE,
      note TEXT NOT NULL,
      is_highlight BOOLEAN DEFAULT FALSE,
      created_by INTEGER REFERENCES users(id),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*) FROM calendar_notes');
  if (parseInt(rows[0].count) === 0) {
    const seeds = [
      ['2026-04-01', 'Math lesson 11, pages 61 to 62', false],
      ['2026-04-02', 'Math lesson 12, page 65', false],
      ['2026-04-06', 'Spring Break', true],
      ['2026-04-07', 'Spring Break', true],
      ['2026-04-08', 'Spring Break', true],
      ['2026-04-09', 'Spring Break', true],
      ['2026-04-10', 'Spring Break', true],
      ['2026-04-13', 'Math lessons 13 and 14, pages 71 to 72 and 75', false],
      ['2026-04-14', 'Math lesson 15, page 81', false],
      ['2026-04-21', 'Field Trip: Oakland Zoo', false],
    ];
    for (const [date_key, note, is_highlight] of seeds) {
      await pool.query(
        'INSERT INTO calendar_notes (date_key, note, is_highlight) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [date_key, note, is_highlight]
      );
    }
  }
}

module.exports = { pool, initDb };
