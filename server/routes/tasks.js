const express = require('express');
const router = express.Router();
const pool = require('../db');
const protect = require('../middleware/auth');

// Get task stats for dashboard
router.get('/stats', protect, async (req, res) => {
  try {
    const totalTasks = await pool.query(
      `SELECT COUNT(*) FROM tasks t
       JOIN project_members pm ON t.project_id = pm.project_id
       WHERE pm.user_id = $1`,
      [req.user.id]
    );

    const tasksByStatus = await pool.query(
      `SELECT status, COUNT(*) as count FROM tasks t
       JOIN project_members pm ON t.project_id = pm.project_id
       WHERE pm.user_id = $1
       GROUP BY status`,
      [req.user.id]
    );

    const overdueTasks = await pool.query(
      `SELECT COUNT(*) FROM tasks t
       JOIN project_members pm ON t.project_id = pm.project_id
       WHERE pm.user_id = $1
       AND t.due_date < NOW()
       AND t.status != 'Done'`,
      [req.user.id]
    );

    res.json({
      totalTasks: totalTasks.rows[0].count,
      tasksByStatus: tasksByStatus.rows,
      overdueTasks: overdueTasks.rows[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/', protect, async (req, res) => {
  const { title, description, dueDate, priority, assignedToId, ProjectId } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, due_date, priority, assigned_to, project_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, dueDate || null, priority || 'Medium', assignedToId || null, ProjectId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', protect, async (req, res) => {
  const { title, description, status, priority, dueDate, assignedToId } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_date = COALESCE($5, due_date),
        assigned_to = COALESCE($6, assigned_to)
       WHERE id = $7 RETURNING *`,
      [title, description, status, priority, dueDate, assignedToId, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;