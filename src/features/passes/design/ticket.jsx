/**
 * Reference only: Olympic-style ticket (Tokyo) — not data-driven, not used by app.
 */
import React from 'react';
import './ticket.css';

const OlympicTicket = () => (
  <div className="ticket-container">
    <div className="ticket">
      <div className="ticket-top">
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
        <div className="olympics-title">2020 TOKYO OLYMPICS</div>
        <div className="kanji-container">
          <svg className="tilted-oval" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="150" cy="75" rx="140" ry="50" stroke="#1a1a1a" strokeWidth="1.2" fill="none" transform="rotate(-12 150 75)"/>
          </svg>
          <div className="main-kanji">水泳</div>
        </div>
        <div className="swimming-text">+ SWIMMING +</div>
        <div className="pill-container">
          <span className="pill-text">東京オリンピック</span>
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
          <div className="venue-info">
            <div className="venue-japanese">東京アクアティクス中心</div>
            <div className="venue-english">TOKYO AQUATICS<br/>CENTRE</div>
          </div>
          <div className="date-info">
            <div className="date-day">30<span className="date-colon">:</span></div>
            <div className="date-month">7月<span className="date-colon">:</span></div>
          </div>
        </div>
      </div>
      <div className="solid-divider"></div>
      <div className="ticket-footer">
        <div className="footer-left">
          <div className="barcode-section">
            <div className="checkerboard">
              {[...Array(2)].map((_, row) => (
                <div key={row} className="checker-row">
                  {[...Array(10)].map((_, col) => (
                    <div key={col} className={`checker-cell ${(row + col) % 2 === 0 ? 'black' : 'white'}`}></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-right">
          <div className="stamp-circle">
            <span className="stamp-kanji">水泳</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default OlympicTicket;
