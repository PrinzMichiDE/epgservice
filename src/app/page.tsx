'use client';

import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
        background: 'linear-gradient(90deg, #fbbf24 0%, #38bdf8 100%)',
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
        borderBottom: '2px solid #38bdf8',
      }}>
        <span style={{marginRight: 12}}>💌 Unterstütze das Projekt anonym per Gutschein:</span>
        <a
          href="https://forms.gle/y6c3o8v5L9L7Sy79A"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#fff',
            background: '#232629',
            borderRadius: 8,
            padding: '8px 18px',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '1.08rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            marginLeft: 8,
            transition: 'background 0.2s, color 0.2s',
            border: 'none',
            display: 'inline-block',
          }}
        >
          Anonym spenden (Amazon, AirBNB, u.a.)
        </a>
      </div>
      {/* Abstand für Fixed-Banner */}
      <div style={{height: 70}} />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #232629 0%, #2d3748 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          padding: '40px 24px',
          borderRadius: '18px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          minWidth: '320px',
          maxWidth: 420,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(4px)',
        }}>
          <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, marginBottom: 0, letterSpacing: '-1px', textAlign: 'center' }}>free-epg.de</h1>
          <p style={{ color: '#bfc3c7', fontSize: '1.15rem', marginTop: 10, marginBottom: 28, textAlign: 'center', fontWeight: 500 }}>
            Kostenloser EPG für Deutsche TV Kanäle<br />
            <span style={{ color: '#7dd3fc', fontWeight: 600 }}>XMLTV &amp; Rytec-Format</span>
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
            {copied ? 'Kopiert!' : 'Success'}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            <button
              onClick={handleCopy}
              style={{
                marginTop: 8,
                padding: '10px 28px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.08rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                transition: 'background 0.2s',
                letterSpacing: '0.01em',
              }}
            >
              Copy URL
            </button>
            <a
              href={downloadUrl}
              download
              onClick={() => handleDownload('xmltv')}
              style={{
                marginTop: 8,
                padding: '10px 28px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(90deg, #fbbf24 0%, #f472b6 100%)',
                color: '#232629',
                fontWeight: 700,
                fontSize: '1.08rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                textDecoration: 'none',
                display: 'inline-block',
                letterSpacing: '0.01em',
                transition: 'background 0.2s',
              }}
            >
              Download XMLTV
            </a>
            <a
              href={rytecUrl}
              download
              onClick={() => handleDownload('rytec')}
              style={{
                marginTop: 8,
                padding: '10px 28px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(90deg, #a7f3d0 0%, #38bdf8 100%)',
                color: '#232629',
                fontWeight: 700,
                fontSize: '1.08rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                textDecoration: 'none',
                display: 'inline-block',
                letterSpacing: '0.01em',
                transition: 'background 0.2s',
              }}
            >
              Download Rytec XML
            </a>
            <button
              onClick={handleIPTVClick}
              style={{
                marginTop: 8,
                padding: '10px 28px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(90deg, #f87171 0%, #dc2626 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.08rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                textDecoration: 'none',
                display: 'inline-block',
                letterSpacing: '0.01em',
                transition: 'background 0.2s',
              }}
            >
              IPTV Player öffnen
            </button>
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
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '24px',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>Wichtiger Hinweis</h2>
                <p style={{ marginBottom: '16px', color: '#4b5563', lineHeight: '1.5' }}>
                  Die IPTV-Seite wird nicht von free-epg.de betrieben und steht in keinem Zusammenhang mit diesem Projekt. 
                  Wir übernehmen keine Verantwortung für den Inhalt der externen Seite.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleCloseDisclaimer}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      background: '#f3f4f6',
                      color: '#4b5563',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleAcceptDisclaimer}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'linear-gradient(90deg, #f87171 0%, #dc2626 100%)',
                      color: '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
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
            style={{
              marginTop: 24,
              display: 'inline-block',
              background: 'linear-gradient(90deg, #ffc439 0%, #009cde 100%)',
              color: '#232629',
              fontWeight: 700,
              fontSize: '1.08rem',
              borderRadius: 8,
              padding: '12px 32px',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              letterSpacing: '0.01em',
              transition: 'background 0.2s',
              border: 'none',
            }}
          >
            Projekt unterstützen via <span style={{color:'#003087'}}>PayPal</span>
          </a>
          <div style={{
            marginTop: 28,
            color: '#bfc3c7',
            fontSize: '0.98rem',
            textAlign: 'center',
            lineHeight: 1.6,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            padding: '12px 10px 8px 10px',
            maxWidth: 340,
          }}>
            <b>Hinweis:</b> Das XMLTV-Format ist für die meisten IPTV- und Mediacenter-Apps geeignet.<br />
            Das Rytec-Format ist speziell für Enigma2/EPG-Importer und kompatible Receiver optimiert.
            <div style={{ marginTop: 12, fontSize: '0.9rem', color: '#94a3b8' }}>
              Besucher: {stats.visitors.toLocaleString()} | 
              XMLTV Downloads: {stats.downloads.xmltv.toLocaleString()} | 
              Rytec Downloads: {stats.downloads.rytec.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
