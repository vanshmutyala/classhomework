const { Router } = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/notes', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT date_key, note, is_highlight FROM calendar_notes ORDER BY date_key'
    );
    res.json({ notes: rows });
  } catch (err) {
    console.error('Fetch notes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/notes/:dateKey', requireAuth, async (req, res) => {
  const { dateKey } = req.params;
  const { note, is_highlight } = req.body;
  if (typeof note !== 'string' || !note.trim()) {
    return res.status(400).json({ error: 'note text is required' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return res.status(400).json({ error: 'Invalid date key format' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO calendar_notes (date_key, note, is_highlight, created_by, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (date_key) DO UPDATE
         SET note = EXCLUDED.note,
             is_highlight = EXCLUDED.is_highlight,
             updated_at = NOW()
       RETURNING date_key, note, is_highlight`,
      [dateKey, note.trim(), is_highlight ?? false, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Upsert note error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/notes/:dateKey', requireAuth, async (req, res) => {
  const { dateKey } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return res.status(400).json({ error: 'Invalid date key format' });
  }
  try {
    await pool.query('DELETE FROM calendar_notes WHERE date_key = $1', [dateKey]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
