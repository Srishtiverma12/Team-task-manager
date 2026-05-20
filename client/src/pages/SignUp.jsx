import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../authContext';
import { Zap, ArrowRight, Loader } from 'lucide-react';
import api from '../api';

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
      <div className="ai-auth-card">
        <div className="ai-auth-head">
          <div className="ai-auth-mark"><Zap size={22} /></div>
          <div>
            <div className="ai-auth-title">Create account</div>
            <div className="ai-auth-sub">Start managing your team today</div>
          </div>
        </div>

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
  );
};

export default Signup;