import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../authContext.jsx';
import { LayoutDashboard, FolderKanban, LogOut, CalendarCheck } from 'lucide-react';

const Shell = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { path: '/projects', icon: <FolderKanban size={16} />, label: 'Projects' },
    { path: '/attendance', icon: <CalendarCheck size={16} />, label: 'Attendance' },
  ];

  return (
    <div className="ai-shell">
      <aside className="ai-sidebar">
        <div className="ai-brand">
          <div className="ai-brand-mark">E</div>
          <div>
            <div className="ai-brand-title">Ethara AI</div>
            <div className="ai-brand-sub">Team Task Manager</div>
          </div>
        </div>
        <nav className="ai-nav">
          <div className="ai-nav-label">Navigation</div>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`ai-nav-item ${location.pathname === item.path ? 'is-active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ai-sidebar-footer">
          <div className="ai-user">
            <div className="ai-user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="ai-user-meta">
              <div className="ai-user-name">{user?.name}</div>
              <div className="ai-user-email">{user?.email}</div>
            </div>
          </div>
          <button className="ai-icon-btn" onClick={handleLogout} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </aside>
      <main className="ai-main">
        <div className="ai-content">{children}</div>
      </main>
    </div>
  );
};

export default Shell;