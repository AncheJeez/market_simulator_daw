import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { FormEvent } from 'react'

function Register() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [userName, setUserName] = useState('')
  const [userType, setUserType] = useState('NORMAL')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    if (profilePicture && profilePicture.size > 5 * 1024 * 1024) {
      setMessage('Profile picture must be under 5MB.')
      return
    }

    const formData = new FormData()
    formData.append('firstName', firstName)
    formData.append('secondName', secondName)
    formData.append('userName', userName)
    formData.append('userType', userType)
    formData.append('password', password)
    if (profilePicture) {
      formData.append('profilePicture', profilePicture)
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Registration failed.' }))
        setMessage(error.message || 'Registration failed.')
        return
      }

      const user = await response.json()
      setMessage(`Account created for ${user.userName}. Redirecting to login...`)
      setTimeout(() => navigate('/login'), 900)
    } catch (error) {
      setMessage('Unable to reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h3">Create Account</h1>
            <p className="text-muted">Fill out your profile details.</p>
            <form className="d-grid gap-3" onSubmit={handleSubmit}>
              <label className="form-label">
                First Name
                <input
                  className="form-control"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
              </label>
              <label className="form-label">
                Second Name
                <input
                  className="form-control"
                  type="text"
                  value={secondName}
                  onChange={(event) => setSecondName(event.target.value)}
                  required
                />
              </label>
              <label className="form-label">
                User Name
                <input
                  className="form-control"
                  type="text"
                  value={userName}
                  onChange={(event) => setUserName(event.target.value)}
                  required
                />
              </label>
              <label className="form-label">
                User Type
                <select
                  className="form-select"
                  value={userType}
                  onChange={(event) => setUserType(event.target.value)}
                  required
                >
                  <option value="NORMAL">Normal</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
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
              <label className="form-label">
                Profile Picture (PNG or JPEG, max 5MB)
                <input
                  className="form-control"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(event) => setProfilePicture(event.target.files?.[0] || null)}
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
