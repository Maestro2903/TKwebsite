/**
 * Reference: original Ticketpass card from design module.
 * App uses PassCardTicket.tsx (RegistrationPass + Tailwind) instead.
 */
import React from 'react';
import './Ticketpass.css';

const TicketPass = ({ passName, shortName, price, description, includes, bestFor, gradient }) => {
  return (
    <div className="ticket-pass">
      <div className={`ticket-top gradient-${gradient}`}>
        <div className="punch-hole punch-hole-left"></div>
        <div className="punch-hole punch-hole-right"></div>
        <div className="globe-container">
          <svg className="globe-icon" viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="15" rx="28" ry="12" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            <ellipse cx="30" cy="15" rx="14" ry="12" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            <line x1="2" y1="15" x2="58" y2="15" stroke="#1a1a1a" strokeWidth="1.5"/>
            <path d="M10 8 Q30 5 50 8" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            <path d="M10 22 Q30 25 50 22" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        <div className="event-title">TAKSHASHILA 2026</div>
        <div className="shortname-container">
          <svg className="tilted-oval" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="150" cy="75" rx="140" ry="50" stroke="#1a1a1a" strokeWidth="1.2" fill="none" transform="rotate(-12 150 75)"/>
          </svg>
          <div className="main-shortname">{shortName}</div>
        </div>
        <div className="pass-name-text">+ {passName} +</div>
        <div className="pill-container">
          <span className="pill-text">{price}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>
      <div className="divider-with-cutouts">
        <div className="cutout cutout-left"></div>
        <div className="dashed-line"></div>
        <div className="cutout cutout-right"></div>
      </div>
      <div className="ticket-middle">
        <div className="event-details">
          <div className="description-info">
            <div className="description-label">Description</div>
            <div className="description-text">{description}</div>
          </div>
          <div className="date-info">
            <div className="date-letter">T<span className="date-colon">:</span></div>
            <div className="date-year">26<span className="date-colon">:</span></div>
          </div>
        </div>
      </div>
      <div className="solid-divider"></div>
      <div className="ticket-includes">
        <div className="includes-header">
          <span className="includes-label">Includes:</span>
        </div>
        <div className="includes-list">
          {(includes || []).map((item, index) => (
            <div key={index} className="include-item">
              <span className="include-bullet">•</span>
              <span className="include-text">{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="solid-divider"></div>
      <div className="ticket-footer">
        <div className="footer-left">
          <div className="best-for-section">
            <div className="best-for-label">Best For:</div>
            <div className="best-for-text">{bestFor}</div>
          </div>
          <div className="barcode-section">
            <div className="checkerboard">
              {[...Array(2)].map((_, row) => (
                <div key={row} className="checker-row">
                  {[...Array(10)].map((_, col) => (
                    <div
                      key={col}
                      className={`checker-cell ${(row + col) % 2 === 0 ? 'black' : 'white'}`}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
            <div className="barcode">
              {[...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className="barcode-line"
                  style={{
                    width: [0,3,5,8,12,15,18,22,25,28,31,35,38].includes(i) ? '3px' : '1.5px',
                    marginRight: '1px'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-right">
          <div className="stamp-box">
            <div className="crop-marks">
              <span className="crop-tl"></span>
              <span className="crop-tr"></span>
              <span className="crop-bl"></span>
              <span className="crop-br"></span>
            </div>
            <div className="stamp-circle">
              <span className="stamp-text">T26</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPass;
