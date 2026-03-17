import { Link } from 'react-router-dom'

function Welcome() {
  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body text-center p-5">
            <p className="text-uppercase text-muted small mb-2">Market Simulator</p>
            <h1 className="display-6">Welcome</h1>
            <p className="text-muted">
              Start exploring the simulator. Sign in to continue.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <Link className="btn btn-dark" to="/login">
                Go to Login
              </Link>
              <Link className="btn btn-outline-dark" to="/register">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome
