import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../authContext.jsx';
import { ArrowRight, Loader } from 'lucide-react';
import api from '../api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-auth">
      <div className="ai-auth-left">
        <div className="ai-auth-logo">
          <div className="ai-auth-logo-mark">E</div>
          <div>
            <div className="ai-auth-logo-name">Ethara AI</div>
            <div className="ai-auth-logo-sub">Team Task Manager</div>
          </div>
        </div>
        <div className="ai-auth-headline">
          Welcome back<br />
          <span>to Ethara.AI</span>
        </div>
        <p className="ai-auth-tagline">
          Manage your projects, track tasks, and collaborate with your team — all in one place.
        </p>
        <div className="ai-auth-features">
          {['Role-based access control', 'Real-time task tracking', 'Attendance management', 'Team collaboration'].map(f => (
            <div key={f} className="ai-auth-feature">
              <div className="ai-auth-feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-auth-right">
        <div className="ai-auth-card">
          <div className="ai-auth-card-title">Sign in</div>
          <div className="ai-auth-card-sub">Enter your credentials to continue</div>

          {/* Role Selector */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {['Member', 'Admin'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  border: role === r ? '2px solid #0a2d6e' : '1px solid #dde1ed',
                  background: role === r ? '#0a2d6e' : 'white',
                  color: role === r ? 'white' : '#0a1940',
                  fontWeight: 600, fontSize: 13.5,
                  cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {r === 'Admin' ? '👑 Admin' : '👤 Member'}
              </button>
            ))}
          </div>

          {error && <div className="ai-alert ai-alert-bad">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="ai-field">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="ai-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="ai-btn ai-btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
              disabled={loading}
            >
              {loading ? <Loader size={15} className="spin" /> : <ArrowRight size={15} />}
              {loading ? 'Signing in...' : `Sign in as ${role}`}
            </button>
          </form>

          <div className="ai-auth-foot">
            <span>Don't have an account?</span>
            <Link to="/signup">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;