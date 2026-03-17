function Footer() {
  return (
    <footer className="border-top bg-white">
      <div className="container py-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
        <div>
          <strong>Market Simulator</strong>
          <div className="text-muted small">Professional trading practice platform</div>
        </div>
        <div className="d-flex flex-wrap gap-3">
          <a className="text-decoration-none" href="#">
            LinkedIn
          </a>
          <a className="text-decoration-none" href="#">
            X
          </a>
          <a className="text-decoration-none" href="https://github.com/AncheJeez">
            GitHub
          </a>
          <a className="text-decoration-none" href="#">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
