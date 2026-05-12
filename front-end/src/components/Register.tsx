import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { apiUrl } from '../utils/api';

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

function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [bornDate, setBornDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    backgroundColor: THEME.bg,
    color: THEME.text,
    border: `1px solid ${THEME.border}`,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('secondName', secondName);
    formData.append('userName', userName);
    formData.append('email', email);
    formData.append('bornDate', bornDate);
    formData.append('userType', 'NORMAL'); // Valor predeterminado fijo
    formData.append('password', password);
    if (profilePicture) formData.append('profilePicture', profilePicture);

    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Registration failed.' }));
        setMessage(error.message || 'Registration failed.');
        return;
      }

      setMessage(`Account created successfully. Redirecting...`);
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setMessage('Unable to reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 py-5 d-flex flex-column align-items-center justify-content-center">
      <div className="col-12 col-md-10 col-lg-8 col-xl-6">
        <div className="text-center mb-4">
          <h1 className="h4 fw-bold mb-0 text-uppercase" style={{ color: THEME.text }}>
            Trading Sim <span style={{ color: THEME.primary }}>Registration</span>
          </h1>
        </div>

        <div className="card border-0 shadow-lg" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase" style={{ color: THEME.muted }}>First Name</label>
                  <input className="form-control border-0" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase" style={{ color: THEME.muted }}>Second Name</label>
                  <input className="form-control border-0" type="text" value={secondName} onChange={(e) => setSecondName(e.target.value)} required style={inputStyle} />
                </div>
                <div className="col-md-8">
                  <label className="form-label small fw-bold text-uppercase" style={{ color: THEME.muted }}>Email Address</label>
                  <input className="form-control border-0" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-uppercase" style={{ color: THEME.muted }}>Born Date</label>
                  <input className="form-control border-0" type="date" value={bornDate} onChange={(e) => setBornDate(e.target.value)} required style={inputStyle} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-uppercase" style={{ color: THEME.muted }}>User Name</label>
                  <input className="form-control border-0" type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required style={inputStyle} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase" style={{ color: THEME.muted }}>Password</label>
                  <input className="form-control border-0" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase" style={{ color: THEME.muted }}>Confirm Password</label>
                  <input className="form-control border-0" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-uppercase" style={{ color: THEME.muted }}>Profile Picture</label>
                  <input className="form-control border-0" type="file" accept="image/png,image/jpeg" onChange={(e) => setProfilePicture(e.target.files?.[0] || null)} style={{...inputStyle, fontSize: '0.8rem'}} />
                </div>
                <div className="col-12 mt-4">
                  <button className="btn fw-bold w-100 py-2 shadow-sm" type="submit" disabled={loading} style={{ backgroundColor: THEME.primary, color: '#000' }}>
                    {loading ? 'INITIALIZING...' : 'CREATE ACCOUNT & DEPLOY'}
                  </button>
                </div>
              </div>
            </form>
            {message && (
              <div className="mt-4 p-2 small text-center rounded text-uppercase" style={{ 
                backgroundColor: message.includes('success') ? 'rgba(14, 203, 129, 0.1)' : 'rgba(246, 70, 93, 0.1)',
                color: message.includes('success') ? THEME.success : THEME.danger,
                border: `1px solid ${message.includes('success') ? THEME.success : THEME.danger}`
              }}>{message}</div>
            )}
            <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: THEME.border }}>
              <Link className="small text-decoration-none fw-bold" to="/login" style={{ color: THEME.muted }}>GO BACK</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;