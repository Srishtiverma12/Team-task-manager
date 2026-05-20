import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../authContext.jsx';
import { Calendar, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';

const STATUS_OPTIONS = ['Present', 'Absent', 'Late'];

const statusColor = (s) => {
  if (s === 'Present') return 'tone-good';
  if (s === 'Absent') return 'tone-bad';
  return 'tone-warn';
};

const statusIcon = (s) => {
  if (s === 'Present') return <CheckCircle size={13} />;
  if (s === 'Absent') return <XCircle size={13} />;
  return <Clock size={13} />;
};

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data));
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    Promise.all([
      api.get(`/projects/${selectedProject.id}`),
      api.get(`/attendance/project/${selectedProject.id}?month=${month}&year=${year}`)
    ]).then(([projRes, attRes]) => {
      setMembers(projRes.data.members);
      setAttendance(attRes.data);
      const me = projRes.data.members.find(m => m.id === user?.id);
      setIsAdmin(me?.role === 'Admin');
    }).finally(() => setLoading(false));
  }, [selectedProject, month, year]);

  const getDaysInMonth = () => new Date(year, month, 0).getDate();

  const getAttendance = (userId, day) => {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendance.find(a => a.user_id === userId && a.date?.startsWith(date));
  };

  const handleMark = async (userId, day, status) => {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const key = `${userId}-${date}`;
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      await api.post('/attendance', {
        projectId: selectedProject.id,
        userId,
        date,
        status,
      });
      const attRes = await api.get(`/attendance/project/${selectedProject.id}?month=${month}&year=${year}`);
      setAttendance(attRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const getStats = (userId) => {
    const userAtt = attendance.filter(a => a.user_id === userId);
    const present = userAtt.filter(a => a.status === 'Present').length;
    const absent = userAtt.filter(a => a.status === 'Absent').length;
    const late = userAtt.filter(a => a.status === 'Late').length;
    return { present, absent, late, total: userAtt.length };
  };

  const days = Array.from({ length: getDaysInMonth() }, (_, i) => i + 1);
  const todayDay = today.getMonth() + 1 === month && today.getFullYear() === year ? today.getDate() : null;

  return (
    <div>
      <div className="ai-page-head">
        <div>
          <div className="ai-page-kicker">Team</div>
          <h1 className="ai-page-title">Attendance</h1>
          <p className="ai-page-sub">Track daily attendance for your team members.</p>
        </div>
      </div>

      {/* Project Selector */}
      <div className="ai-panel" style={{ marginBottom: 16 }}>
        <div className="ai-field" style={{ marginBottom: 0 }}>
          <label>Select Project</label>
          <select
            value={selectedProject?.id || ''}
            onChange={e => {
              const p = projects.find(p => p.id === parseInt(e.target.value));
              setSelectedProject(p || null);
            }}
          >
            <option value="">-- Choose a project --</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedProject && (
        <>
          {/* Month Navigator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <button className="ai-icon-btn" onClick={() => {
              if (month === 1) { setMonth(12); setYear(y => y - 1); }
              else setMonth(m => m - 1);
            }}><ChevronLeft size={16} /></button>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
              {monthName} {year}
            </span>
            <button className="ai-icon-btn" onClick={() => {
              if (month === 12) { setMonth(1); setYear(y => y + 1); }
              else setMonth(m => m + 1);
            }}><ChevronRight size={16} /></button>
          </div>

          {loading ? <p style={{ color: 'var(--muted)' }}>Loading...</p> : (
            <>
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
                {members.map(m => {
                  const s = getStats(m.id);
                  return (
                    <div key={m.id} className="ai-tile tone-neutral">
                      <div className="ai-tile-top">
                        <div className="ai-avatar">{m.name[0].toUpperCase()}</div>
                        <span className="ai-tile-badge">{m.role}</span>
                      </div>
                      <div className="ai-tile-label">{m.name}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        <span className="ai-chip ai-chip-low">✓ {s.present}</span>
                        <span className="ai-chip ai-chip-high">✗ {s.absent}</span>
                        <span className="ai-chip ai-chip-medium">~ {s.late}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Attendance Table */}
              <div className="ai-panel" style={{ overflowX: 'auto' }}>
                <div className="ai-panel-head">
                  <div className="ai-panel-title">Daily Attendance — {monthName} {year}</div>
                  {!isAdmin && <span className="ai-chip">View only — Admins can mark</span>}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', minWidth: 130 }}>Member</th>
                      {days.map(d => (
                        <th key={d} style={{
                          padding: '6px 4px', color: d === todayDay ? 'var(--cyan)' : 'var(--muted)',
                          fontWeight: d === todayDay ? 700 : 500,
                          borderBottom: '1px solid var(--border)', minWidth: 36, textAlign: 'center'
                        }}>{d}</th>
                      ))}
                      <th style={{ padding: '6px 8px', color: 'var(--muted)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(m => {
                      const s = getStats(m.id);
                      const pct = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0;
                      return (
                        <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div className="ai-avatar">{m.name[0].toUpperCase()}</div>
                              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{m.name}</span>
                            </div>
                          </td>
                          {days.map(d => {
                            const rec = getAttendance(m.id, d);
                            const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                            const key = `${m.id}-${date}`;
                            const isFuture = new Date(date) > today;
                            return (
                              <td key={d} style={{ padding: '4px 2px', textAlign: 'center' }}>
                                {isFuture ? (
                                  <span style={{ color: 'var(--faint)', fontSize: 10 }}>—</span>
                                ) : isAdmin ? (
                                  <select
                                    className="ai-mini-select"
                                    style={{ padding: '3px 4px', fontSize: 10, minWidth: 32, opacity: saving[key] ? 0.5 : 1 }}
                                    value={rec?.status || ''}
                                    onChange={e => handleMark(m.id, d, e.target.value)}
                                    disabled={saving[key]}
                                  >
                                    <option value="">-</option>
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s[0]}</option>)}
                                  </select>
                                ) : (
                                  <span className={`ai-chip ${rec ? statusColor(rec.status) : ''}`} style={{ padding: '2px 5px', fontSize: 10 }}>
                                    {rec ? statusIcon(rec.status) : '—'}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                            <span className={`ai-chip ${pct >= 75 ? 'ai-chip-low' : pct >= 50 ? 'ai-chip-medium' : 'ai-chip-high'}`}>
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {!selectedProject && (
        <div className="ai-panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Calendar size={36} style={{ color: 'var(--faint)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--muted)' }}>Select a project to view attendance</p>
        </div>
      )}
    </div>
  );
};

export default Attendance;