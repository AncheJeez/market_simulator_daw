import type { User } from '../utils/auth'
import defaultUser from '../assets/default-user.jpg'
import { assetUrl } from '../utils/api'

type AuthWelcomeProps = {
  user: User
}

const THEME = {
  bg: '#0f172a',
  card: '#1a2949',
  border: '#2b3139',
  text: '#eaecef',
  muted: '#848e9c',
  primary: '#f0b90b',
};

function AuthWelcome({ user }: AuthWelcomeProps) {
  const rawPath = user?.profilePicturePath || ''
  const normalizedPath = rawPath.replace(/^\/+/, '')
  const profileUrl = assetUrl(normalizedPath, defaultUser)

  const isAdmin = user?.userType === 'ADMIN';

  return (
    <div className="row justify-content-center px-2">
      <div className="col-12 col-lg-10 col-xl-8">
        <div 
          className="card border-0 shadow-lg trading-card-entrance overflow-hidden" 
          style={{ 
            backgroundColor: THEME.card, 
            border: `1px solid ${THEME.border}`,
            color: THEME.text,
            borderRadius: '12px',
            position: 'relative'
          }}
        >
          {/* BACKGROUND ANIMATED GRAPH */}
          <div className="trading-graph-container">
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="trading-graph-svg">
              <path 
                d="M0,50 L50,40 L100,60 L150,30 L200,70 L250,45 L300,55 L350,20 L400,60 L450,40 L500,50 L550,30 L600,70 L650,40 L700,60 L750,30 L800,70 L850,45 L900,55 L950,20 L1000,50" 
                fill="none" 
                stroke={THEME.primary} 
                strokeWidth="1"
                strokeOpacity="0.15"
              />
              <path 
                d="M0,50 L50,40 L100,60 L150,30 L200,70 L250,45 L300,55 L350,20 L400,60 L450,40 L500,50 L550,30 L600,70 L650,40 L700,60 L750,30 L800,70 L850,45 L900,55 L950,20 L1000,50" 
                fill="none" 
                stroke={THEME.primary} 
                strokeWidth="0.5"
                strokeOpacity="0.1"
                className="graph-line-secondary"
              />
            </svg>
          </div>

          <div className="card-body p-4 p-md-5" style={{ position: 'relative', zIndex: 3 }}>
            <div className="row align-items-center flex-column-reverse flex-md-row">
              
              {/* LADO IZQUIERDO: Información Técnica */}
              <div className="col-12 col-md-7 text-center text-md-start mt-4 mt-md-0">
                <p className="text-uppercase tracking-widest small mb-2" style={{ color: THEME.primary, letterSpacing: '2px' }}>
                  <span className="blink-dot"></span> System Authenticated
                </p>
                
                <div className="mb-3">
                  <p className="small mb-1" style={{ color: THEME.muted }}>User Details:</p>
                  <h4 className="h5 mb-2" style={{ color: THEME.text }}>
                    {user?.firstName} {user?.secondName}
                  </h4>
                </div>

                <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2 mb-3">
                  {isAdmin && (
                    <div className="badge p-2 px-3 border-gold text-gold shadow-sm">
                      SEC-LEVEL: {user?.userType}
                    </div>
                  )}
                </div>
              </div>

              {/* LADO DERECHO: Identidad Visual */}
              <div className="col-12 col-md-5 text-center border-md-start border-slate">
                <div className="position-relative d-inline-block mb-3">
                  <div className="profile-glow"></div>
                  <img
                    src={profileUrl}
                    alt="Profile"
                    className="rounded-circle position-relative border border-2 border-gold shadow-gold"
                    style={{ 
                      objectFit: 'cover',
                      zIndex: 2
                    }}
                    width="120"
                    height="120"
                  />
                </div>
                <h2 className="h4 fw-bold mb-0 text-uppercase" style={{ color: THEME.primary, letterSpacing: '1px' }}>
                  {user?.userName}
                </h2>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .trading-card-entrance {
            animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          /* BACKGROUND GRAPH ANIMATION */
          .trading-graph-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 200%; /* Doble ancho para scroll infinito */
            height: 100%;
            z-index: 1;
            pointer-events: none;
            overflow: hidden;
          }

          .trading-graph-svg {
            width: 100%;
            height: 100%;
            animation: scrollGraph 20s linear infinite;
            opacity: 0.5;
          }

          @keyframes scrollGraph {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }

          .graph-line-secondary {
            transform: translateY(10px);
          }

          /* GLOWS & STYLES */
          .profile-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 140px;
            height: 140px;
            background: radial-gradient(circle, ${THEME.primary}22 0%, transparent 70%);
            border-radius: 50%;
            z-index: 1;
          }

          .blink-dot {
            height: 8px;
            width: 8px;
            background-color: ${THEME.primary};
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
            animation: blink 1.5s infinite;
          }

          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }

          /* UTILS */
          .bg-dark-soft { background-color: rgba(132, 142, 156, 0.1); }
          .border-slate { border-color: ${THEME.border} !important; }
          .border-gold { border: 1px solid ${THEME.primary} !important; }
          .text-gold { color: ${THEME.primary}; }
          .shadow-gold { boxShadow: 0 0 20px ${THEME.primary}22; }
          .tracking-widest { font-weight: 600; font-size: 0.7rem; }
          .x-small { font-size: 0.65rem; }
          .italic { font-style: italic; }

          @media (max-width: 767px) {
            .trading-graph-svg { animation-duration: 10s; }
          }
        `}
      </style>
    </div>
  )
}

export default AuthWelcome