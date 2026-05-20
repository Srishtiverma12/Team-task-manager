const express = require('express');
const router = express.Router();
const pool = require('../db');
const protect = require('../middleware/auth');

// Get all projects for logged in user
router.get('/', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, pm.role FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project with tasks and members
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (project.rows.length === 0) return res.status(404).json({ message: 'Project not found' });

    const members = await pool.query(
      `SELECT u.id, u.name, u.email, pm.role FROM users u
       JOIN project_members pm ON u.id = pm.user_id
       WHERE pm.project_id = $1`,
      [req.params.id]
    );

    const tasks = await pool.query(
      `SELECT t.*, u.name as assignee_name FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [req.params.id]
    );

    res.json({
      ...project.rows[0],
      members: members.rows,
      tasks: tasks.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project
router.post('/', protect, async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user.id]
    );
    const project = result.rows[0];
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [project.id, req.user.id, 'Admin']
    );
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to project
router.post('/:id/members', protect, async (req, res) => {
  const { email } = req.body;
  try {
    const isAdmin = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = $3',
      [req.params.id, req.user.id, 'Admin']
    );
    if (isAdmin.rows.length === 0) return res.status(403).json({ message: 'Only admins can add members' });

    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const alreadyMember = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [req.params.id, user.rows[0].id]
    );
    if (alreadyMember.rows.length > 0) return res.status(400).json({ message: 'User already a member' });

    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [req.params.id, user.rows[0].id, 'Member']
    );
    res.json({ message: 'Member added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', protect, async (req, res) => {
  try {
    const isAdmin = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = $3',
      [req.params.id, req.user.id, 'Admin']
    );
    if (isAdmin.rows.length === 0) return res.status(403).json({ message: 'Only admins can delete projects' });

    await pool.query('DELETE FROM tasks WHERE project_id = $1', [req.params.id]);
    await pool.query('DELETE FROM project_members WHERE project_id = $1', [req.params.id]);
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;