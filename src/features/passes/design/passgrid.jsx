/**
 * Reference only: original grid page from design module.
 * Not used by app routes; register/pass uses RegistrationPassesGrid.
 * Stubbed so no dependency on missing passesData or PassesGrid.css.
 */
import React from 'react';
import './passgrid.css';

const passesData = [];

const PassesGrid = () => {
  return (
    <div className="passes-page">
      <header className="passes-header">
        <div className="header-content">
          <div className="logo-section">
            <svg className="header-globe" viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="30" cy="15" rx="28" ry="12" stroke="#fff" strokeWidth="1.5" fill="none" />
              <ellipse cx="30" cy="15" rx="14" ry="12" stroke="#fff" strokeWidth="1.5" fill="none" />
              <line x1="2" y1="15" x2="58" y2="15" stroke="#fff" strokeWidth="1.5" />
            </svg>
            <h1 className="header-title">TAKSHASHILA 2026</h1>
          </div>
          <p className="header-subtitle">Choose Your Pass • Experience the Festival</p>
        </div>
      </header>
      <main className="passes-main">
        <div className="passes-grid">
          {passesData.length === 0 && <p className="text-white/60">Reference component — cards rendered by PassCard.</p>}
        </div>
      </main>
      <footer className="passes-footer">
        <p>© 2026 Takshashila • All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default PassesGrid;
