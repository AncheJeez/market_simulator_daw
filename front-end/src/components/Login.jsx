import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed.' }))
        setMessage(error.message || 'Login failed.')
        return
      }

      const user = await response.json()
      onLogin(user)
      setMessage(`Welcome ${user.name}`)
      setTimeout(() => navigate('/'), 800)
    } catch (error) {
      setMessage('Unable to reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h3">Login</h1>
            <p className="text-muted">Enter your credentials.</p>
            <form className="d-grid gap-3" onSubmit={handleSubmit}>
              <label className="form-label">
                Name
                <input
                  className="form-control"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
              <label className="form-label">
                Password
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <button className="btn btn-dark" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            {message && <p className="text-danger mt-3">{message}</p>}
            <Link className="d-inline-block mt-2" to="/register">
              Need an account? Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
