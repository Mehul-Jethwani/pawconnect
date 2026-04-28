import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon">🐾</span>
            <span className="logo-text">PawConnect</span>
          </div>
          <p className="footer-motto">
            Connecting hearts and paws. Your one-stop destination for pet adoption and elite pet care services.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-icon">Instagram</a>
            <a href="#" className="social-icon">Twitter</a>
            <a href="#" className="social-icon">LinkedIn</a>
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/pets">Adoption</Link></li>
              <li><Link to="/services">Pet Services</Link></li>
              <li><Link to="/stores">Stores</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><Link to="/care-guides">Pet Care Guides</Link></li>
              <li><Link to="/ngo-info">NGO Partners</Link></li>
              <li><a href="mailto:support@pawconnect.com">Contact Us</a></li>
              <li><Link to="/faq">FAQs</Link></li>
            </ul>
          </div>

          <div className="footer-column footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Get the latest pet adoption alerts and care tips.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Your email..." disabled />
              <button className="btn btn-primary" disabled>Join</button>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} PawConnect. Made with ❤️ for animals in India.</p>
      </div>
    </footer>
  );
};

export default Footer;
