import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../authContext';
import { LayoutDashboard, CheckCircle, Clock, AlertTriangle, FolderKanban, ArrowRight } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          api.get('/tasks/stats'),
          api.get('/projects'),
        ]);
        setStats(statsRes.data);
        setProjects(projectsRes.data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusCount = (status) => {
    if (!stats?.tasksByStatus) return 0;
    const found = stats.tasksByStatus.find(s => s.status === status);
    return found ? parseInt(found.count) : 0;
  };

  const total = parseInt(stats?.totalTasks || 0);
  const done = getStatusCount('Done');
  const inProgress = getStatusCount('In Progress');
  const todo = getStatusCount('To Do');
  const overdue = parseInt(stats?.overdueTasks || 0);
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const tiles = [
    { label: 'Total Tasks', value: total, badge: 'All', icon: <LayoutDashboard size={18} />, tone: 'tone-neutral', hint: 'Across all projects' },
    { label: 'Completed', value: done, badge: '✓ Done', icon: <CheckCircle size={18} />, tone: 'tone-good', hint: `${completionRate}% completion rate` },
    { label: 'In Progress', value: inProgress, badge: 'Active', icon: <Clock size={18} />, tone: 'tone-warn', hint: 'Currently being worked on' },
    { label: 'Overdue', value: overdue, badge: '! Alert', icon: <AlertTriangle size={18} />, tone: 'tone-bad', hint: 'Past due date' },
  ];

  const bars = [
    { label: 'To Do', value: todo, total, tone: '' },
    { label: 'In Progress', value: inProgress, total, tone: 'tone-warn' },
    { label: 'Done', value: done, total, tone: 'tone-good' },
    { label: 'Overdue', value: overdue, total, tone: 'tone-bad' },
  ];

  if (loading) return (
    <div style={{ color: 'var(--muted)', padding: '40px 0', textAlign: 'center' }}>
      Loading dashboard...
    </div>
  );

  return (
    <div>
      <div className="ai-page-head">
        <div>
          <div className="ai-page-kicker">Overview</div>
          <h1 className="ai-page-title" style={{ fontSize: '42px' }}>Good to see you, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="ai-page-sub">Here's what's happening across your projects today.</p>
        </div>
      </div>

      {/* Stat Tiles */}
      <div className="ai-tiles">
        {tiles.map((t, i) => (
          <div key={i} className={`ai-tile ${t.tone}`}>
            <div className="ai-tile-top">
              <div className="ai-tile-icon">{t.icon}</div>
              <span className="ai-tile-badge">{t.badge}</span>
            </div>
            <div className="ai-tile-label">{t.label}</div>
            <div className="ai-tile-value">{t.value}</div>
            <div className="ai-tile-hint">{t.hint}</div>
          </div>
        ))}
      </div>

      {/* Split: Bars + Projects */}
      <div className="ai-split">
        {/* Progress Bars */}
        <div className="ai-panel">
          <div className="ai-panel-head">
            <div>
              <div className="ai-panel-title">Task Breakdown</div>
              <div className="ai-panel-sub">Distribution by status</div>
            </div>
            <div className="ai-metric-big" style={{ fontSize: '36px' }}>{completionRate}%</div>
          </div>
          <div className="ai-bars">
            {bars.map((b, i) => {
              const pct = b.total > 0 ? Math.round((b.value / b.total) * 100) : 0;
              return (
                <div key={i} className="ai-bar-row">
                  <div className="ai-bar-meta">
                    <span className="ai-bar-label">{b.label}</span>
                    <span>{b.value} &nbsp;·&nbsp; {pct}%</span>
                  </div>
                  <div className="ai-bar-track">
                    <div className={`ai-bar-fill ${b.tone}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="ai-panel">
          <div className="ai-panel-head">
            <div>
              <div className="ai-panel-title">Recent Projects</div>
              <div className="ai-panel-sub">{projects.length} projects</div>
            </div>
            <button className="ai-ghost-link" onClick={() => navigate('/projects')}>
              View all
            </button>
          </div>
          {projects.length === 0 ? (
            <p className="ai-empty">No projects yet. Create one!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {projects.map(p => (
                <div
                  key={p.id}
                  className="ai-member"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/project/${p.id}`)}
                >
                  <div className="ai-member-left">
                    <div className="ai-avatar"><FolderKanban size={13} /></div>
                    <div>
                      <div className="ai-member-name">{p.name}</div>
                      <div className="ai-member-email">{p.role}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--faint)' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;