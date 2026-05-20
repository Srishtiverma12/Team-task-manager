import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Trash2, ArrowRight, X, Loader } from 'lucide-react';
import api from '../api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    setError('');
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '' });
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div>
      <div className="ai-page-head">
        <div>
          <div className="ai-page-kicker">Workspace</div>
          <h1 className="ai-page-title">Projects</h1>
          <p className="ai-page-sub">Manage your projects and collaborate with your team.</p>
        </div>
        <div className="ai-page-actions">
          <button className="ai-btn ai-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> New Project
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="ai-panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <FolderKanban size={36} style={{ color: 'var(--faint)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>No projects yet. Create your first one!</p>
          <button className="ai-btn ai-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Create Project
          </button>
        </div>
      ) : (
        <div className="ai-grid">
          {projects.map(p => (
            <div key={p.id} className="ai-card" onClick={() => navigate(`/project/${p.id}`)}>
              <div className="ai-card-accent" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="ai-avatar" style={{ width: 36, height: 36, borderRadius: 11, fontSize: 13 }}>
                  {getInitials(p.name)}
                </div>
                {p.role === 'Admin' && (
                  <button
                    className="ai-icon-btn"
                    onClick={(e) => handleDelete(e, p.id)}
                    title="Delete project"
                    style={{ color: 'var(--rose)', opacity: 0.7 }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="ai-card-title" style={{ marginTop: 10 }}>{p.name}</div>
              <div className="ai-card-body">{p.description || 'No description provided.'}</div>
              <div className="ai-card-foot">
                <span className="ai-chip">{p.role}</span>
                <ArrowRight size={14} style={{ color: 'var(--faint)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="ai-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="ai-modal" onClick={e => e.stopPropagation()}>
            <div className="ai-modal-head">
              <div>
                <div className="ai-modal-title">New Project</div>
                <div className="ai-modal-sub">Create a new workspace for your team</div>
              </div>
              <button className="ai-icon-btn" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>

            {error && <div className="ai-alert ai-alert-bad">{error}</div>}

            <form onSubmit={handleCreate}>
              <div className="ai-field">
                <label>Project name *</label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="ai-field">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="What is this project about?"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="ai-form-actions">
                <button type="button" className="ai-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="ai-btn ai-btn-primary" disabled={creating}>
                  {creating ? <Loader size={14} /> : <Plus size={14} />}
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;