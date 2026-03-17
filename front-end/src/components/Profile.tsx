import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { User } from '../utils/auth'

type ProfileProps = {
  user: User
  onUpdate: (user: User) => void
}

function Profile({ user, onUpdate }: ProfileProps) {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [secondName, setSecondName] = useState(user?.secondName || '')
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (profilePicture && profilePicture.size > 5 * 1024 * 1024) {
      setMessage('Profile picture must be under 5MB.')
      return
    }

    const formData = new FormData()
    formData.append('firstName', firstName)
    formData.append('secondName', secondName)
    if (profilePicture) {
      formData.append('profilePicture', profilePicture)
    }

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Update failed.' }))
        setMessage(error.message || 'Update failed.')
        return
      }

      const updated: User = await response.json()
      onUpdate(updated)
      setMessage('Profile updated successfully.')
      setTimeout(() => navigate('/profile'), 500)
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
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h1 className="h3 mb-1">Profile</h1>
                <p className="text-muted mb-0">Update your details.</p>
              </div>
              <span className="badge bg-secondary">{user?.userType}</span>
            </div>
            <div className="mt-4">
              <div className="mb-3">
                <label className="form-label">User Name</label>
                <input className="form-control" value={user?.userName || ''} disabled />
              </div>
            </div>
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
                Replace Profile Picture (PNG or JPEG, max 5MB)
                <input
                  className="form-control"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(event) => setProfilePicture(event.target.files?.[0] || null)}
                />
              </label>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
            {message && <p className="text-danger mt-3">{message}</p>}
            <Link className="d-inline-block mt-2" to="/">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
