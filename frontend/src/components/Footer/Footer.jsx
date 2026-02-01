import "./Footer.css";

const Footer = () => {
  return (
    <footer className="drdo-footer">
      <div className="footer-container">
        {/* LEFT: ABOUT */}
        <div className="footer-section">
          <h4>DIPAS</h4>
          <p>
            Defence Institute of Physiology & Allied Sciences (DIPAS), a
            laboratory of Defence Research and Development Organisation (DRDO),
            conducts physiological and biomedical research to improve human
            performance in extreme and wartime environments.
          </p>
        </div>

        {/* CENTER: ORGANISATION */}
        <div className="footer-section">
          <h4>Organisation</h4>
          <ul>
            <li>Research Areas: Life Sciences & Biotechnology</li>
            <li>Ministry: DRDO, Govt. of India</li>
            <li>Director: Dr. Rajeev Varshney</li>
            <li>State: Delhi</li>
          </ul>
        </div>

        {/* RIGHT: CONTACT */}
        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li>Address: New Delhi</li>
            <li>Phone: 011-23946257, 011-23883102</li>
            <li>Fax: 011-23932869, 011-23914790</li>
            <li>Email: director[dot]dipas[at]gov[dot]in</li>
          </ul>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} Defence Research and Development
        Organisation (DRDO) — DIPAS
      </div>
    </footer>
  );
};

export default Footer;
