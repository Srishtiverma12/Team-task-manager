import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../authContext';
import { Plus, Trash2, X, Loader, UserPlus, ArrowLeft, Crown, User } from 'lucide-react';
import api from '../api';

const STATUS_COLS = ['To Do', 'In Progress', 'Done'];

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', assignedToId: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [error, setError] = useState('');
  const [memberError, setMemberError] = useState('');
  const [memberSuccess, setMemberSuccess] = useState('');

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const isAdmin = project?.members?.find(m => m.id === user?.id)?.role === 'Admin';

  const tasksByStatus = (status) => project?.tasks?.filter(t => t.status === status) || [];

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    setCreating(true);
    setError('');
    try {
      await api.post('/tasks', { ...taskForm, ProjectId: parseInt(id) });
      setTaskForm({ title: '', description: '', priority: 'Medium', dueDate: '', assignedToId: '' });
      setShowTaskModal(false);
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProject();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setAddingMember(true);
    setMemberError('');
    setMemberSuccess('');
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberSuccess('Member added successfully!');
      setMemberEmail('');
      fetchProject();
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Done') return false;
    return new Date(dueDate) < new Date();
  };

  const priorityClass = (p) => {
    if (p === 'High') return 'ai-chip-high';
    if (p === 'Low') return 'ai-chip-low';
    return 'ai-chip-medium';
  };

  const colClass = (status) => {
    if (status === 'In Progress') return 'col-inprogress';
    if (status === 'Done') return 'col-done';
    return 'col-todo';
  };

  if (loading) return <p style={{ color: 'var(--muted)', padding: '40px 0' }}>Loading project...</p>;
  if (!project) return <p style={{ color: 'var(--rose)' }}>Project not found.</p>;

  return (
    <div>
      {/* Header */}
      <button className="ai-back" onClick={() => navigate('/projects')}>
        <ArrowLeft size={14} /> Back to Projects
      </button>

      <div className="ai-page-head">
        <div>
          <div className="ai-page-kicker">Project</div>
          <h1 className="ai-page-title">{project.name}</h1>
          {project.description && <p className="ai-page-sub">{project.description}</p>}
        </div>
        <div className="ai-page-actions">
          {isAdmin && (
            <button className="ai-btn" onClick={() => setShowMemberModal(true)}>
              <UserPlus size={14} /> Add Member
            </button>
          )}
          <button className="ai-btn ai-btn-primary" onClick={() => setShowTaskModal(true)}>
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="ai-panel" style={{ marginBottom: 20 }}>
        <div className="ai-panel-head">
          <div className="ai-panel-title">Team Members</div>
          <div className="ai-panel-sub">{project.members?.length} members</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {project.members?.map(m => (
            <div key={m.id} className="ai-chip" style={{ gap: 7 }}>
              {m.role === 'Admin' ? <Crown size={11} style={{ color: 'var(--amber)' }} /> : <User size={11} />}
              {m.name}
              <span style={{ opacity: 0.5, fontSize: 11 }}>{m.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="ai-section-head">
        <div className="ai-section-title">Task Board</div>
        <div className="ai-section-sub">{project.tasks?.length || 0} total tasks</div>
      </div>

      <div className="ai-kanban">
        {STATUS_COLS.map(status => (
          <div key={status} className={`ai-column ${colClass(status)}`}>
            <div className="ai-column-head">
              <span className="ai-column-title">{status}</span>
              <span className="ai-badge ai-badge-soft">{tasksByStatus(status).length}</span>
            </div>
            <div className="ai-column-body">
              {tasksByStatus(status).length === 0 ? (
                <p className="ai-empty" style={{ padding: '12px 4px' }}>No tasks here</p>
              ) : (
                tasksByStatus(status).map(task => (
                  <div key={task.id} className="ai-task">
                    <div className="ai-task-top">
                      <div className="ai-task-title">{task.title}</div>
                      <div className="ai-task-actions">
                        {isAdmin && (
                          <button
                            className="ai-icon-btn"
                            style={{ color: 'var(--rose)', opacity: 0.7 }}
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    {task.description && (
                      <div className="ai-task-desc">{task.description}</div>
                    )}
                    <div className="ai-task-foot">
                      <div className="ai-task-meta">
                        <span className={`ai-chip ${priorityClass(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <span className="ai-chip" style={isOverdue(task.due_date, task.status) ? { borderColor: 'rgba(240,72,106,0.3)', color: 'var(--rose)' } : {}}>
                            {isOverdue(task.due_date, task.status) ? '⚠ ' : ''}
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        {task.assignee_name && (
                          <div className="ai-avatar" title={task.assignee_name}>
                            {task.assignee_name[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <select
                        className="ai-mini-select"
                        value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value)}
                      >
                        {STATUS_COLS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="ai-modal-backdrop" onClick={() => setShowTaskModal(false)}>
          <div className="ai-modal" onClick={e => e.stopPropagation()}>
            <div className="ai-modal-head">
              <div>
                <div className="ai-modal-title">New Task</div>
                <div className="ai-modal-sub">Add a task to this project</div>
              </div>
              <button className="ai-icon-btn" onClick={() => setShowTaskModal(false)}><X size={16} /></button>
            </div>
            {error && <div className="ai-alert ai-alert-bad">{error}</div>}
            <form onSubmit={handleCreateTask}>
              <div className="ai-field">
                <label>Task title *</label>
                <input
                  type="text"
                  placeholder="e.g. Design landing page"
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  required autoFocus
                />
              </div>
              <div className="ai-field">
                <label>Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional details..."
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>
              <div className="ai-row">
                <div className="ai-field">
                  <label>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="ai-field">
                  <label>Due date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="ai-field">
                <label>Assign to</label>
                <select value={taskForm.assignedToId} onChange={e => setTaskForm({ ...taskForm, assignedToId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members?.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="ai-form-actions">
                <button type="button" className="ai-btn" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="ai-btn ai-btn-primary" disabled={creating}>
                  {creating ? <Loader size={14} /> : <Plus size={14} />}
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="ai-modal-backdrop" onClick={() => setShowMemberModal(false)}>
          <div className="ai-modal" onClick={e => e.stopPropagation()}>
            <div className="ai-modal-head">
              <div>
                <div className="ai-modal-title">Add Member</div>
                <div className="ai-modal-sub">Invite someone to this project</div>
              </div>
              <button className="ai-icon-btn" onClick={() => setShowMemberModal(false)}><X size={16} /></button>
            </div>
            {memberError && <div className="ai-alert ai-alert-bad">{memberError}</div>}
            {memberSuccess && <div className="ai-alert ai-alert-ok">{memberSuccess}</div>}
            <form onSubmit={handleAddMember}>
              <div className="ai-field">
                <label>Member's email</label>
                <input
                  type="email"
                  placeholder="teammate@example.com"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  required autoFocus
                />
              </div>
              <div className="ai-form-actions">
                <button type="button" className="ai-btn" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="ai-btn ai-btn-primary" disabled={addingMember}>
                  {addingMember ? <Loader size={14} /> : <UserPlus size={14} />}
                  {addingMember ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>

            {/* Current Members List */}
            <div style={{ marginTop: 16 }}>
              <div className="ai-panel-title" style={{ marginBottom: 10, fontSize: 13 }}>Current Members</div>
              <div className="ai-members">
                {project.members?.map(m => (
                  <div key={m.id} className="ai-member">
                    <div className="ai-member-left">
                      <div className="ai-avatar">{m.name[0].toUpperCase()}</div>
                      <div>
                        <div className="ai-member-name">{m.name}</div>
                        <div className="ai-member-email">{m.email}</div>
                      </div>
                    </div>
                    <span className="ai-chip" style={{ fontSize: 11 }}>
                      {m.role === 'Admin' ? <Crown size={10} style={{ color: 'var(--amber)' }} /> : <User size={10} />}
                      &nbsp;{m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;