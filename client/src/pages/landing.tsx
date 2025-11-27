import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleStartNow = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocation("/chat");
  };

  return (
    <>
      <style>{`
        /* ============ ROOT COLORS ============ */
        :root {
          --bg: #fafafa;
          --text-main: #111111;
          --text-soft: #555555;
          --text-muted: #888888;
          --card-bg: #18181b;
          --card-bg-light: rgba(255,255,255,0.85);
          --border-light: rgba(0,0,0,0.08);
          --border-dark: rgba(255,255,255,0.12);
          --radius-sm: 8px;
          --radius-md: 14px;
          --radius-lg: 24px;
          --radius-xl: 32px;
          --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
          --shadow-md: 0 8px 30px rgba(0,0,0,0.08);
          --shadow-lg: 0 20px 50px rgba(0,0,0,0.12);
          --shadow-card: 0 25px 60px rgba(0,0,0,0.35);
        }

        /* ========= RESET & BASE ========= */
        .landing-page * { margin:0; padding:0; box-sizing:border-box; }

        .landing-page {
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--text-main);
          background: url('/bg.jpg') no-repeat center center;
          background-size: cover;
          background-attachment: fixed;
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Subtle overlay for better text readability */
        .landing-page::before {
          content: "";
          position: fixed;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          pointer-events: none;
          z-index: 0;
        }

        /* ====== PAGE WRAPPER ====== */
        .page-wrap {
          max-width: 900px;
          margin: 0 auto;
          padding: 48px 60px 80px;
          padding-top: 100px;
          position: relative;
          z-index: 1;
        }

        /* ===== HERO ===== */
        .hero {
          min-height: 85vh;
          display: flex;
          align-items: center;
          gap: 40px;
          position: relative;
          padding: 40px 0;
        }

        .hero-left { flex: 1.2; }
        .hero-right { flex: 1; }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          border-radius: 100px;
          background: rgba(0,0,0,0.06);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-light);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-soft);
          margin-bottom: 24px;
          animation: fadeInUp 0.6s ease-out;
        }

        .hero-kicker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #333 0%, #666 100%);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .hero-title {
          font-size: clamp(42px, 5vw, 64px);
          line-height: 1.08;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
          animation: fadeInUp 0.6s ease-out 0.1s both;
        }

        .hero-title span {
          background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 50%, #1a1a1a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
          to { background-position: 200% center; }
        }

        .hero-subtitle {
          font-size: 18px;
          line-height: 1.7;
          color: var(--text-soft);
          max-width: 520px;
          margin-bottom: 32px;
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .hero-subtitle strong {
          color: var(--text-main);
          font-weight: 600;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          animation: fadeInUp 0.6s ease-out 0.3s both;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          border: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .btn-primary {
          background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
          color: #ffffff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
        }

        .btn-primary:hover::before { opacity: 1; }

        .btn-primary span { position: relative; z-index: 1; }

        .btn-secondary {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-light);
          color: var(--text-main);
          box-shadow: var(--shadow-sm);
        }

        .btn-secondary:hover {
          background: #ffffff;
          border-color: rgba(0,0,0,0.15);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .btn-icon {
          font-size: 16px;
          transition: transform 0.2s ease;
        }

        .btn:hover .btn-icon { transform: translateX(3px); }

        .hero-subnote {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 24px;
          animation: fadeIn 0.6s ease-out 0.5s both;
          max-width: 480px;
          line-height: 1.6;
        }

        /* CHAT CARD */
        .hero-right {
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeIn 0.8s ease-out 0.4s both;
        }

        .hero-card {
          background: var(--card-bg);
          border-radius: var(--radius-xl);
          padding: 24px;
          border: 1px solid var(--border-dark);
          box-shadow: var(--shadow-card);
          max-width: 400px;
          width: 100%;
          backdrop-filter: blur(20px);
          transform: perspective(1000px) rotateY(-2deg) rotateX(2deg);
          transition: transform 0.4s ease;
        }

        .hero-card:hover {
          transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
        }

        .hero-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-dark);
        }

        .hero-pill {
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(255,255,255,0.08);
          border: 1px solid var(--border-dark);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #ffffff;
        }

        .hero-card-header > span:last-child {
          font-size: 11px;
          color: #888888;
          font-weight: 500;
        }

        .hero-chat {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bubble-row {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        .bubble-row.me { justify-content: flex-end; }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #555555 0%, #222222 100%);
          border: 2px solid rgba(255,255,255,0.15);
          flex-shrink: 0;
        }

        .bubble {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 20px;
          font-size: 13px;
          line-height: 1.5;
          font-weight: 450;
        }

        .bubble.them {
          background: rgba(255,255,255,0.08);
          border: 1px solid var(--border-dark);
          border-bottom-left-radius: 6px;
          color: #e8e8e8;
        }

        .bubble.me {
          background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
          border-bottom-right-radius: 6px;
          color: #1a1a1a;
          box-shadow: 0 4px 15px rgba(255,255,255,0.15);
        }

        .hero-card-footer {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-dark);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #777777;
          font-weight: 500;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
          animation: pulse 2s infinite;
        }

        /* ===== SECTIONS ===== */
        .section {
          padding: 80px 0;
        }

        .section-header {
          margin-bottom: 48px;
          max-width: 600px;
        }

        .eyebrow {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 12px;
          padding: 6px 12px;
          background: rgba(0,0,0,0.04);
          border-radius: 6px;
        }

        .section-title {
          font-size: clamp(28px, 3vw, 36px);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
          line-height: 1.2;
        }

        .section-lead {
          font-size: 16px;
          color: var(--text-soft);
          line-height: 1.7;
        }

        /* ABOUT / COMPARISON */
        .about-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: start;
        }

        .about-text p {
          font-size: 16px;
          line-height: 1.8;
          color: var(--text-soft);
          margin-bottom: 20px;
        }

        .about-text p strong {
          color: var(--text-main);
          font-weight: 600;
        }

        .compare-card {
          background: var(--card-bg);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-dark);
          padding: 28px;
          box-shadow: var(--shadow-card);
        }

        .compare-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #888888;
          margin-bottom: 20px;
        }

        .compare-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .compare-col {
          padding: 16px;
          border-radius: var(--radius-md);
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border-dark);
          transition: all 0.25s ease;
        }

        .compare-col:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }

        .compare-col h4 {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #ffffff;
        }

        .compare-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .compare-col li {
          color: #b0b0b0;
          margin-bottom: 8px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12px;
          line-height: 1.4;
        }

        .pill-good, .pill-bad {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .pill-good { background: #4ade80; box-shadow: 0 0 8px rgba(74, 222, 128, 0.4); }
        .pill-bad { background: #666666; }

        /* HOW IT WORKS */
        .how-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: start;
        }

        .how-text p {
          font-size: 16px;
          line-height: 1.8;
          color: var(--text-soft);
          margin-bottom: 16px;
        }

        .how-text p strong {
          color: var(--text-main);
          font-weight: 600;
        }

        .frame {
          background: var(--card-bg);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-dark);
          box-shadow: var(--shadow-card);
          overflow: hidden;
        }

        .frame-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid var(--border-dark);
          font-size: 12px;
          font-weight: 500;
          color: #999999;
        }

        .frame-dots {
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3a3a3a;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .dot:nth-child(1) { background: #ff5f57; }
        .dot:nth-child(2) { background: #febc2e; }
        .dot:nth-child(3) { background: #28c840; }

        .frame-body {
          padding: 28px;
        }

        .steps {
          list-style: none;
          padding: 0;
          margin: 0;
          counter-reset: step;
        }

        .steps li {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
          padding: 16px;
          background: rgba(255,255,255,0.04);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-dark);
          transition: all 0.25s ease;
        }

        .steps li:hover {
          background: rgba(255,255,255,0.08);
          transform: translateX(4px);
        }

        .steps li:last-child { margin-bottom: 0; }

        .steps li::before {
          counter-increment: step;
          content: counter(step);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #444 0%, #222 100%);
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .steps li span {
          color: #ffffff;
          font-weight: 600;
        }

        .step-content {
          flex: 1;
          color: #b0b0b0;
          font-size: 14px;
          line-height: 1.5;
        }

        /* CTA */
        .cta {
          text-align: center;
          padding: 80px 0 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cta .section-header {
          margin: 0 auto 32px;
          text-align: center;
          max-width: 500px;
        }

        .cta p {
          font-size: 16px;
          color: var(--text-soft);
          margin-bottom: 32px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 16px 24px;
          border-radius: var(--radius-md);
        }

        .cta-button-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .cta .btn-primary {
          padding: 16px 40px;
          font-size: 15px;
        }

        /* ===== HEADER & NAV ===== */
        .landing-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-light);
        }

        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 900px;
          margin: 0 auto;
          padding: 16px 60px;
        }

        .nav-logo {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-main);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: opacity 0.2s ease;
        }

        .nav-logo:hover { opacity: 0.8; }

        .nav-logo img {
          height: 36px;
          border-radius: 10px;
        }

        .nav-logo span {
          background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-soft);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .nav-link:hover { color: var(--text-main); }

        /* FOOTER */
        .landing-footer {
          padding: 32px 0;
          font-size: 13px;
          color: var(--text-muted);
          text-align: center;
          border-top: 1px solid var(--border-light);
          margin-top: 40px;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .hero {
            flex-direction: column;
            padding-top: 32px;
            min-height: auto;
            gap: 48px;
          }
          .hero-right { order: -1; }
          .hero-card { transform: none; }
          .about-layout, .how-layout {
            grid-template-columns: 1fr;
          }
          .section { padding: 60px 0; }
        }

        @media (max-width: 640px) {
          .page-wrap { padding: 32px 16px 60px; }
          .hero { min-height: auto; }
          .nav-links a.nav-link { display: none; }
          .compare-grid { grid-template-columns: 1fr; }
          .hero-title { font-size: 36px; }
          .section-title { font-size: 24px; }
        }
      `}</style>

      <div className="landing-page">
        <header className="landing-header">
          <nav className="nav">
            <a href="#" className="nav-logo">
              <img src="/favicon.png" alt="Aether logo" />
              <span>Aether</span>
            </a>
            <div className="nav-links">
              <a href="#about" className="nav-link">
                About
              </a>
              <a href="#how-it-works" className="nav-link">
                How it works
              </a>
              <a
                href="/chat"
                onClick={handleStartNow}
                className="btn btn-primary"
              >
                <span>Get Started</span>
                <span className="btn-icon">→</span>
              </a>
            </div>
          </nav>
        </header>

        <main className="page-wrap">
          {/* HERO */}
          <section className="hero">
            <div className="hero-left">
              <div className="hero-kicker">
                <span className="hero-kicker-dot"></span>
                Decentralized messaging
              </div>
              <h1 className="hero-title">
                Meet <span>Aether</span> your private space in the network.
              </h1>
              <p className="hero-subtitle">
                A decentralized chat layer built for privacy. No central
                servers, no data harvesting — just encrypted packets moving
                between peers that belong to <strong>you</strong>.
              </p>
              <div className="hero-actions">
                <a
                  href="/chat"
                  onClick={handleStartNow}
                  className="btn btn-primary"
                >
                  <span>Start Chatting</span>
                  <span className="btn-icon">→</span>
                </a>
                <a href="#how-it-works" className="btn btn-secondary">
                  Learn More
                </a>
              </div>
              <p className="hero-subnote">
                ✦ End-to-end encrypted · No phone number required · Open
                protocol
              </p>
            </div>

            <div className="hero-right">
              <div className="hero-card">
                <div className="hero-card-header">
                  <span className="hero-pill">#general</span>
                  <span>E2E Encrypted</span>
                </div>
                <div className="hero-chat">
                  <div className="bubble-row">
                    <div className="avatar"></div>
                    <div className="bubble them">
                      Anyone else love that we don't need phone numbers here? 🌌
                    </div>
                  </div>
                  <div className="bubble-row me">
                    <div className="bubble me">
                      Pure cryptographic IDs. No gatekeepers, no middlemen.
                    </div>
                  </div>
                  <div className="bubble-row">
                    <div className="avatar"></div>
                    <div className="bubble them">
                      And my chats don't live on some company's servers forever
                      🔒
                    </div>
                  </div>
                </div>
                <div className="hero-card-footer">
                  <div className="status-indicator">
                    <span className="status-dot"></span>
                    <span>Network active</span>
                  </div>
                  <span>~80ms latency</span>
                </div>
              </div>
            </div>
          </section>

          {/* ABOUT */}
          <section id="about" className="section">
            <div className="section-header">
              <div className="eyebrow">Why Aether?</div>
              <h2 className="section-title">
                Communication that's truly yours.
              </h2>
              <p className="section-lead">
                Every message is encrypted, encapsulated, and routed through a
                distributed network — without any central authority.
              </p>
            </div>

            <div className="about-layout">
              <div className="about-text">
                <p>
                  Traditional messengers like <strong>WhatsApp</strong> or{" "}
                  <strong>Telegram</strong> control the network, your identity,
                  and their policies. Even with encryption, your communication
                  flows through their servers.
                </p>
                <p>
                  With <strong>Aether</strong>, each message is{" "}
                  <strong>encapsulated</strong> into an encrypted packet. The
                  network only sees routing information — never the content.
                  Only your recipient can <strong>decapsulate</strong> and read
                  it.
                </p>
                <p>
                  This means <strong>no single point of failure</strong>,
                  minimal metadata exposure, and complete freedom to communicate
                  without surveillance.
                </p>
              </div>

              <aside className="compare-card">
                <div className="compare-label">Platform Comparison</div>
                <div className="compare-grid">
                  <div className="compare-col">
                    <h4>WhatsApp</h4>
                    <ul>
                      <li>
                        <span className="pill-bad"></span>
                        Phone number identity
                      </li>
                      <li>
                        <span className="pill-bad"></span>
                        Centralized servers
                      </li>
                      <li>
                        <span className="pill-bad"></span>
                        Closed ecosystem
                      </li>
                    </ul>
                  </div>
                  <div className="compare-col">
                    <h4>Telegram</h4>
                    <ul>
                      <li>
                        <span className="pill-bad"></span>
                        Cloud-based storage
                      </li>
                      <li>
                        <span className="pill-bad"></span>
                        Optional encryption
                      </li>
                      <li>
                        <span className="pill-bad"></span>
                        Corporate control
                      </li>
                    </ul>
                  </div>
                  <div className="compare-col">
                    <h4>Aether</h4>
                    <ul>
                      <li>
                        <span className="pill-good"></span>
                        Decentralized network
                      </li>
                      <li>
                        <span className="pill-good"></span>
                        Always encrypted
                      </li>
                      <li>
                        <span className="pill-good"></span>
                        Open protocol
                      </li>
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="how-it-works" className="section">
            <div className="section-header">
              <div className="eyebrow">How It Works</div>
              <h2 className="section-title">From message to delivery.</h2>
              <p className="section-lead">
                A simple flow that prioritizes your privacy at every step.
              </p>
            </div>

            <div className="how-layout">
              <div className="how-text">
                <p>
                  Aether uses a two-phase process:{" "}
                  <strong>encapsulation</strong> transforms your message into an
                  encrypted network packet, and <strong>decapsulation</strong>{" "}
                  allows only the recipient to reconstruct it.
                </p>
                <p>
                  Between these phases, nodes simply route sealed capsules
                  without ever accessing their contents. Your conversation
                  remains private, always.
                </p>
              </div>

              <div className="frame">
                <div className="frame-topbar">
                  <div className="frame-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                  <span>Message Flow</span>
                  <span></span>
                </div>
                <div className="frame-body">
                  <ol className="steps">
                    <li>
                      <div className="step-content">
                        <span>Compose</span> — Write your message with optional
                        metadata
                      </div>
                    </li>
                    <li>
                      <div className="step-content">
                        <span>Encrypt</span> — Message is encrypted and wrapped
                        in a capsule
                      </div>
                    </li>
                    <li>
                      <div className="step-content">
                        <span>Route</span> — Network nodes forward the sealed
                        packet
                      </div>
                    </li>
                    <li>
                      <div className="step-content">
                        <span>Decrypt</span> — Recipient unwraps and decrypts
                        the message
                      </div>
                    </li>
                    <li>
                      <div className="step-content">
                        <span>Display</span> — Message rendered locally, stored
                        as you choose
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="section cta">
            <div className="section-header">
              <div className="eyebrow">Get Started</div>
              <h2 className="section-title">Ready to take control?</h2>
            </div>
            <p>Join the decentralized network. Your messages, your rules.</p>
            <div className="cta-button-wrapper">
              <a
                href="/chat"
                onClick={handleStartNow}
                className="btn btn-primary"
              >
                <span>Launch Aether</span>
                <span className="btn-icon">→</span>
              </a>
            </div>
          </section>

          <footer className="landing-footer">
            Aether — Decentralized messaging for the modern web.
          </footer>
        </main>
      </div>
    </>
  );
}
