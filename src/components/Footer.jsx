import React from 'react';

function Footer() {
  return (
    <footer className="pc-footer">
      <div className="footer-wrapper container-fluid">
        <div className="row">
          <div className="col-sm my-1">
            <p className="m-0">&copy; Radofa, Riantsoa, Malala, Ando 2026.</p>
          </div>
          <div className="col-auto my-1">
            <ul className="list-inline footer-link mb-0">
              <li className="list-inline-item"><a href="/">Accueil</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;