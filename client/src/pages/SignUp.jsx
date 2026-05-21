import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../authContext.jsx';
import { ArrowRight, Loader } from 'lucide-react';
import api from '../api';
import logo from '../assets/logo.png';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-auth">
      <div className="ai-auth-left">
        <div className="ai-auth-logo">
          <img src={logo} alt="Ethara AI" style={{ width: 42, height: 42, objectFit: 'contain' }} />
          <div>
            <div className="ai-auth-logo-name">Ethara AI</div>
            <div className="ai-auth-logo-sub">Team Task Manager</div>
          </div>
        </div>
        <div className="ai-auth-headline">
          Start managing<br />
          <span>with Ethara.AI</span>
        </div>
        <p className="ai-auth-tagline">
          Create your workspace and invite your team. Everything you need to ship projects on time.
        </p>
        <div className="ai-auth-features">
          {['Create unlimited projects', 'Assign tasks to team members', 'Track daily attendance', 'Admin & member roles'].map(f => (
            <div key={f} className="ai-auth-feature">
              <div className="ai-auth-feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-auth-right">
        <div className="ai-auth-card">
          <div className="ai-auth-card-title">Create account</div>
          <div className="ai-auth-card-sub">Join Ethara AI — it's free to get started</div>

          {error && <div className="ai-alert ai-alert-bad">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="ai-field">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
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
                placeholder="Min. 6 characters"
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
              {loading ? <Loader size={15} /> : <ArrowRight size={15} />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="ai-auth-foot">
            <span>Already have an account?</span>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;