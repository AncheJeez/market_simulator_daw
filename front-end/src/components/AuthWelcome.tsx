import type { User } from '../utils/auth'
import defaultUser from '../assets/default-user.jpg'

type AuthWelcomeProps = {
  user: User
}

function AuthWelcome({ user }: AuthWelcomeProps) {
  const rawPath = user?.profilePicturePath || ''
  const normalizedPath = rawPath.replace(/^\/+/, '')
  const profileUrl = normalizedPath
    ? `http://localhost:8080/${normalizedPath}`
    : defaultUser

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body text-center p-5">
            <img
              src={profileUrl}
              alt="Profile"
              className="rounded-circle mb-3"
              width="96"
              height="96"
            />
            <p className="text-uppercase text-muted small mb-2">Market Simulator</p>
            <h1 className="display-6">Welcome back</h1>
            <p className="text-muted">
              Logged in as <strong>{user?.userName}</strong>
            </p>
            <div className="text-muted small">
              {user?.firstName} {user?.secondName} - {user?.userType}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthWelcome
