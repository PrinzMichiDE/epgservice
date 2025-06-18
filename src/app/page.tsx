'use client';

import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import AuthButton from '@/components/AuthButton';

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [rytecUrl, setRytecUrl] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [stats, setStats] = useState({ visitors: 0, downloads: { xmltv: 0, rytec: 0 } });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setDownloadUrl(window.location.origin + '/api/epg/download');
      setRytecUrl(window.location.origin + '/api/epg/rytec');
      
      // Lade Statistiken
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error);

      // Erhöhe Besucherzahl
      fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'visitor' })
      }).catch(console.error);
    }
  }, []);

  const handleCopy = async () => {
    if (downloadUrl) {
      await navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleIPTVClick = () => {
    setShowDisclaimer(true);
  };

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
    window.open('https://vavuu.2kool4u.net/', '_blank');
  };

  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
  };

  const handleDownload = async (type: 'xmltv' | 'rytec') => {
    try {
      await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: `download_${type}` })
      });
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Statistiken:', error);
    }
  };

  return (
    <>
      {/* Spenden-Banner */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%)',
        color: '#232629',
        fontWeight: 700,
        fontSize: '1.18rem',
        padding: '18px 0',
        textAlign: 'center',
        letterSpacing: '0.01em',
        boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)',
        marginBottom: 32,
        zIndex: 100,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        borderBottom: '2px solid var(--primary)',
        animation: 'fadeIn 1.2s cubic-bezier(.4,0,.2,1)'
      }}>
        <span style={{marginRight: 12}}>💌 Unterstütze das Projekt anonym per Gutschein:</span>
        <a
          href="https://forms.gle/y6c3o8v5L9L7Sy79A"
          target="_blank"
          rel="noopener noreferrer"
          className="button"
          style={{
            color: '#fff',
            background: '#232629',
            marginLeft: 8,
            fontWeight: 800,
            fontSize: '1.08rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            border: 'none',
            display: 'inline-block',
          }}
        >
          Anonym spenden (Amazon, AirBNB, u.a.)
        </a>
      </div>
      {/* Abstand für Fixed-Banner */}
      <div style={{height: 70}} />
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #232629 0%, #2d3748 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}>
        {/* Auth Button */}
        <div style={{
          position: 'absolute',
          top: 90,
          right: 20,
          zIndex: 10,
        }}>
          <AuthButton />
        </div>
        
        <section className="card fade-in" style={{
          padding: '48px 32px',
          borderRadius: '22px',
          minWidth: '320px',
          maxWidth: 440,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid rgba(255,255,255,0.10)',
          marginBottom: 32,
        }}>
          <h1 style={{ color: '#fff', fontSize: '2.7rem', fontWeight: 900, marginBottom: 0, letterSpacing: '-1px', textAlign: 'center', textShadow: '0 2px 16px #23262955' }}>free-epg.de</h1>
          <p style={{ color: '#bfc3c7', fontSize: '1.18rem', marginTop: 12, marginBottom: 32, textAlign: 'center', fontWeight: 500 }}>
            Kostenloser EPG für deutsche TV-Kanäle<br />
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>XMLTV &amp; Rytec-Format</span>
          </p>
          <input
            type="text"
            value={downloadUrl}
            readOnly
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#232629',
              fontSize: '1.08rem',
              marginBottom: '18px',
              textAlign: 'center',
              fontWeight: 500,
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          />
          <div style={{
            width: '100%',
            background: copied ? '#bbf7d0' : '#e0e7ef',
            color: copied ? '#166534' : '#334155',
            borderRadius: '6px',
            padding: '13px 0',
            textAlign: 'center',
            fontWeight: 500,
            fontSize: '1.08rem',
            marginBottom: '18px',
            transition: 'background 0.3s, color 0.3s',
            opacity: copied ? 1 : 0.92
          }}>
            {copied ? 'Kopiert!' : 'URL kopieren'}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            <button
              onClick={handleCopy}
              className="button"
              style={{
                marginTop: 8,
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
                color: '#fff',
              }}
            >
              URL kopieren
            </button>
            <a
              href={downloadUrl}
              download
              onClick={() => handleDownload('xmltv')}
              className="button"
              style={{
                marginTop: 8,
                background: 'linear-gradient(90deg, var(--secondary) 0%, #f472b6 100%)',
                color: '#232629',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Download XMLTV
        </a>
        <a
              href={rytecUrl}
              download
              onClick={() => handleDownload('rytec')}
              className="button"
              style={{
                marginTop: 8,
                background: 'linear-gradient(90deg, #a7f3d0 0%, var(--primary) 100%)',
                color: '#232629',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Download Rytec XML
            </a>
            <button
              onClick={handleIPTVClick}
              className="button"
              style={{
                marginTop: 8,
                background: 'linear-gradient(90deg, #f87171 0%, var(--danger) 100%)',
                color: '#fff',
              }}
            >
              IPTV Player öffnen
            </button>
            <a
              href="/player"
              className="button"
              style={{
                marginTop: 8,
                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              📺 Eingebauter Player
            </a>
          </div>
          
          {/* Premium Features Info */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            textAlign: 'center',
          }}>
            <h4 style={{
              color: '#f59e0b',
              fontSize: '1.1rem',
              margin: '0 0 8px 0',
              fontWeight: 600,
            }}>
              🔓 Premium-Features im Player
            </h4>
            <p style={{
              color: '#f59e0b',
              fontSize: '0.9rem',
              margin: '0 0 12px 0',
              lineHeight: 1.4,
            }}>
              Anonyme Benutzer: iptv-org Playlist (alle Kanäle)<br />
              <strong>Eingeloggte Benutzer: +200 deutsche Premium-Kanäle</strong>
            </p>
            <a
              href="/login"
              className="button"
              style={{
                background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                color: '#fff',
                textDecoration: 'none',
                padding: '8px 20px',
                fontSize: '0.9rem',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              Anmelden für Premium-Zugang
            </a>
          </div>
          {showDisclaimer && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              animation: 'fadeIn 0.5s cubic-bezier(.4,0,.2,1)'
            }}>
              <div className="card fade-in" style={{
                background: 'rgba(255, 255, 255, 0.98)',
                padding: '28px',
                borderRadius: '16px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 4px 16px -1px rgba(0, 0, 0, 0.13)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <h2 style={{ marginBottom: '16px', color: '#1f2937', fontWeight: 800 }}>Wichtiger Hinweis</h2>
                <p style={{ marginBottom: '16px', color: '#4b5563', lineHeight: '1.5' }}>
                  Die IPTV-Seite wird nicht von free-epg.de betrieben und steht in keinem Zusammenhang mit diesem Projekt. 
                  Wir übernehmen keine Verantwortung für den Inhalt der externen Seite.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleCloseDisclaimer}
                    className="button"
                    style={{
                      background: '#f3f4f6',
                      color: '#4b5563',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleAcceptDisclaimer}
                    className="button"
                    style={{
                      background: 'linear-gradient(90deg, #f87171 0%, var(--danger) 100%)',
                      color: '#fff',
                    }}
                  >
                    Weiter zur IPTV-Seite
                  </button>
                </div>
              </div>
            </div>
          )}
          <a
            href="https://www.paypal.com/paypalme/michelfritzsch/5"
          target="_blank"
          rel="noopener noreferrer"
            className="button"
            style={{
              marginTop: 28,
              background: 'linear-gradient(90deg, #ffc439 0%, #009cde 100%)',
              color: '#232629',
              borderRadius: 8,
              padding: '12px 32px',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              letterSpacing: '0.01em',
              border: 'none',
              fontWeight: 700,
              fontSize: '1.08rem',
              display: 'inline-block',
            }}
          >
            Projekt unterstützen via <span style={{color:'#003087'}}>PayPal</span>
        </a>
          <div style={{
            marginTop: 32,
            padding: '24px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '2px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            animation: 'pulse 2s infinite',
          }}>
            <h3 style={{
              color: '#fff',
              fontSize: '1.4rem',
              marginBottom: '16px',
              fontWeight: 700,
            }}>
              🎁 Unterstütze das Projekt mit einem Geschenk
            </h3>
            <a
              href="https://www.amazon.de/hz/wishlist/ls/2K3UPHK4UWCXP?ref_=wl_share"
          target="_blank"
          rel="noopener noreferrer"
              className="button"
              style={{
                background: 'linear-gradient(90deg, #ff9900 0%, #e47911 100%)',
                color: '#fff',
                borderRadius: 12,
                padding: '16px 40px',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(255, 153, 0, 0.3)',
                letterSpacing: '0.02em',
                border: 'none',
                fontWeight: 800,
                fontSize: '1.2rem',
                display: 'inline-block',
                transform: 'scale(1)',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 153, 0, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 153, 0, 0.3)';
              }}
            >
              <span style={{color:'#fff', textShadow: '0 1px 2px rgba(0,0,0,0.1)'}}>Amazon</span> Wunschliste öffnen
            </a>
          </div>
          <div style={{
            marginTop: 32,
            color: '#bfc3c7',
            fontSize: '1.02rem',
            textAlign: 'center',
            lineHeight: 1.7,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            padding: '14px 12px 10px 12px',
            maxWidth: 340,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}>
            <b>Hinweis:</b> Das XMLTV-Format ist für die meisten IPTV- und Mediacenter-Apps geeignet.<br />
            Das Rytec-Format ist speziell für Enigma2/EPG-Importer und kompatible Receiver optimiert.
            <div style={{ marginTop: 14, fontSize: '0.95rem', color: '#94a3b8', fontWeight: 500 }}>
              Besucher: {stats.visitors.toLocaleString()} &nbsp;|&nbsp; 
              XMLTV Downloads: {stats.downloads.xmltv.toLocaleString()} &nbsp;|&nbsp; 
              Rytec Downloads: {stats.downloads.rytec.toLocaleString()}
            </div>
    </div>
        </section>
      </main>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
