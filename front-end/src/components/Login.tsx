import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { User } from '../utils/auth';
import { apiUrl } from '../utils/api';

// Mantenemos la misma paleta de colores de Simulations
const THEME = {
  bg: '#0f172a',
  card: '#1a2949',
  border: '#2b3139',
  text: '#eaecef',
  muted: '#848e9c',
  primary: '#f0b90b',
  success: '#0ecb81',
  danger: '#f6465d',
};

type LoginProps = {
  onLogin: (user: User) => void;
};

function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userName, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed.' }));
        setMessage(error.message || 'Login failed.');
        return;
      }

      const user: User = await response.json();
      onLogin(user);
      setMessage(`Welcome back, ${user.userName}`);
      setTimeout(() => navigate('/'), 800);
    } catch (error) {
      setMessage('Unable to reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
      <div className="col-12 col-sm-8 col-md-6 col-lg-4 col-xl-3">
        {/* Encabezado estilo Terminal */}
        <div className="text-center mb-4">
          <h1 className="h4 fw-bold mb-0 text-uppercase tracking-tight" style={{ color: THEME.text }}>
            Trading <span style={{ color: THEME.primary }}>Sim</span>
          </h1>
        </div>

        <div className="card border-0 shadow-lg" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
          <div className="card-body p-4">
            <form className="d-grid gap-3" onSubmit={handleSubmit}>
              <div>
                <label className="form-label small fw-bold text-uppercase" style={{ color: THEME.muted }}>
                  User Name
                </label>
                <input
                  className="form-control border-0"
                  type="text"
                  value={userName}
                  onChange={(event) => setUserName(event.target.value)}
                  required
                  style={{ 
                    backgroundColor: THEME.bg, 
                    color: THEME.text,
                    border: `1px solid ${THEME.border}` 
                  }}
                />
              </div>

              <div>
                <label className="form-label small fw-bold text-uppercase" style={{ color: THEME.muted }}>
                  Password
                </label>
                <input
                  className="form-control border-0"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  style={{ 
                    backgroundColor: THEME.bg, 
                    color: THEME.text,
                    border: `1px solid ${THEME.border}` 
                  }}
                />
              </div>

              <button 
                className="btn fw-bold mt-2 py-2 shadow-sm" 
                type="submit" 
                disabled={loading}
                style={{ 
                  backgroundColor: THEME.primary, 
                  color: '#000',
                  transition: 'opacity 0.2s'
                }}
              >
                {loading ? 'AUTHENTICATING...' : 'LOG IN'}
              </button>
            </form>

            {message && (
              <div 
                className="mt-3 p-2 small text-center rounded" 
                style={{ 
                  backgroundColor: message.includes('Welcome') ? 'rgba(14, 203, 129, 0.1)' : 'rgba(246, 70, 93, 0.1)',
                  color: message.includes('Welcome') ? THEME.success : THEME.danger,
                  border: `1px solid ${message.includes('Welcome') ? THEME.success : THEME.danger}`
                }}
              >
                {message.toUpperCase()}
              </div>
            )}

            <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: THEME.border }}>
              <Link 
                className="small text-decoration-none fw-bold" 
                to="/register"
                style={{ color: THEME.muted }}
                onMouseEnter={(e) => e.currentTarget.style.color = THEME.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = THEME.muted}
              >
                UNREGISTERED? CREATE ACCOUNT
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          input:focus {
            background-color: ${THEME.bg} !important;
            color: white !important;
            border-color: ${THEME.primary} !important;
            box-shadow: 0 0 0 0.25rem rgba(240, 185, 11, 0.1) !important;
          }
          .btn:hover {
            opacity: 0.9;
          }
        `}
      </style>
    </div>
  );
}

export default Login;