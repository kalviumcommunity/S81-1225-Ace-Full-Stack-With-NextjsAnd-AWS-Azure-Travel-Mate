import Link from "next/link";

const footerLinks = {
  explore: [
    { label: "Destinations", href: "/places" },
    { label: "Popular Trips", href: "/places?sort=popular" },
    { label: "Travel Guides", href: "/guides" },
    { label: "Categories", href: "/categories" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Safety", href: "/safety" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span>🌍</span> Travel Mate
            </div>
            <p className="footer-description">
              Your smart travel companion for discovering amazing destinations,
              planning unforgettable trips, and exploring the world with
              confidence.
            </p>
            <div className="footer-social">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                𝕏
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                f
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                📷
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                ▶
              </a>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="footer-heading">Explore</h4>
            <ul className="footer-links">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Travel Mate. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem" }}>
            <Link
              href="/terms"
              style={{ color: "var(--muted)", textDecoration: "none" }}
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              style={{ color: "var(--muted)", textDecoration: "none" }}
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              style={{ color: "var(--muted)", textDecoration: "none" }}
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
