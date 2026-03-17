import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Registration failed.' }))
        setMessage(error.message || 'Registration failed.')
        return
      }

      const user = await response.json()
      setMessage(`Account created for ${user.name}. Redirecting to login...`)
      setTimeout(() => navigate('/login'), 900)
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
            <h1 className="h3">Create Account</h1>
            <p className="text-muted">Choose a name and password.</p>
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
              <label className="form-label">
                Repeat Password
                <input
                  className="form-control"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </label>
              <button className="btn btn-dark" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
            {message && <p className="text-danger mt-3">{message}</p>}
            <Link className="d-inline-block mt-2" to="/login">
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
