import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../authContext';
import { Zap, Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import api from '../api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
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
      <div className="ai-auth-card">
        <div className="ai-auth-head">
          <div className="ai-auth-mark"><Zap size={22} /></div>
          <div>
            <div className="ai-auth-title">Welcome</div>
            <div className="ai-auth-sub">Sign in to your Team Task Manager workspace</div>
          </div>
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="ai-auth-foot">
          <span>Don't have an account?</span>
          <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;