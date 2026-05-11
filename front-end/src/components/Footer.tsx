function Footer() {
  const colors = {
    darkerBlue: '#141f38',
    borderBlue: '#253a66',
    accentGold: '#f0b90b',
    textWhite: '#ffffff',
    textMuted: '#848e9c'
  };

  return (
    <footer 
      className="border-top" 
      style={{ 
        backgroundColor: colors.darkerBlue, 
        borderColor: `${colors.borderBlue} !important` 
      }}
    >
      <div className="container py-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
        <div>
          <strong style={{ color: colors.textWhite }}>Market Simulator</strong>
          <div style={{ color: colors.textMuted, fontSize: '0.85rem' }}>
            Professional trading practice platform
          </div>
        </div>
        
        <div className="d-flex flex-wrap gap-4">
          <style>
            {`
              .footer-link {
                color: ${colors.textMuted};
                transition: color 0.2s ease;
                font-size: 0.9rem;
              }
              .footer-link:hover {
                color: ${colors.accentGold};
              }
            `}
          </style>
          <a className="text-decoration-none footer-link" href="#">
            LinkedIn
          </a>
          <a className="text-decoration-none footer-link" href="#">
            X
          </a>
          <a className="text-decoration-none footer-link" href="https://github.com/AncheJeez">
            GitHub
          </a>
          <a className="text-decoration-none footer-link" href="#">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer