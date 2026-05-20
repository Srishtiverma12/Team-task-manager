const express = require('express');
const router = express.Router();
const pool = require('../db');
const protect = require('../middleware/auth');

// Mark attendance
router.post('/', protect, async (req, res) => {
  const { projectId, userId, date, status, note } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO attendance (user_id, project_id, date, status, note, marked_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, project_id, date)
       DO UPDATE SET status = $4, note = $5, marked_by = $6
       RETURNING *`,
      [userId, projectId, date, status, note || null, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance for a project
router.get('/project/:projectId', protect, async (req, res) => {
  const { month, year } = req.query;
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as user_name, u.email as user_email
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       WHERE a.project_id = $1
       AND EXTRACT(MONTH FROM a.date) = $2
       AND EXTRACT(YEAR FROM a.date) = $3
       ORDER BY a.date DESC, u.name ASC`,
      [req.params.projectId, month, year]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my attendance stats
router.get('/stats/:projectId', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM attendance
       WHERE user_id = $1 AND project_id = $2
       GROUP BY status`,
      [req.user.id, req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance for all projects (dashboard)
router.get('/my', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, p.name as project_name
       FROM attendance a
       JOIN projects p ON a.project_id = p.id
       WHERE a.user_id = $1
       ORDER BY a.date DESC
       LIMIT 30`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;