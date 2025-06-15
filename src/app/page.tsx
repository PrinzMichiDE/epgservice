'use client';

import React, { useState } from 'react';

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setDownloadUrl(window.location.origin + '/api/epg/download');
    }
  }, []);

  const handleCopy = async () => {
    if (downloadUrl) {
      await navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#232629',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'none',
        padding: '40px 32px',
        borderRadius: '12px',
        boxShadow: 'none',
        minWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h1 style={{ color: '#fff', fontSize: '2.8rem', fontWeight: 700, marginBottom: 0 }}>free-epg.de</h1>
        <p style={{ color: '#bfc3c7', fontSize: '1.2rem', marginTop: 8, marginBottom: 32 }}>Kostenloser EPG für Deutsche TV Kanäle</p>
        <input
          type="text"
          value={downloadUrl}
          readOnly
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            background: '#e9ecef',
            color: '#232629',
            fontSize: '1.1rem',
            marginBottom: '18px',
            textAlign: 'center',
            fontWeight: 500
          }}
        />
        <div style={{
          width: '100%',
          background: '#d4ede1',
          color: '#2d4739',
          borderRadius: '6px',
          padding: '14px 0',
          textAlign: 'center',
          fontWeight: 500,
          fontSize: '1.1rem',
          marginBottom: '18px',
          transition: 'opacity 0.3s',
          opacity: copied ? 1 : 0.8
        }}>
          {copied ? 'Kopiert!' : 'Success'}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleCopy}
            style={{
              marginTop: 8,
              padding: '10px 32px',
              borderRadius: '6px',
              border: 'none',
              background: '#fff',
              color: '#232629',
              fontWeight: 600,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            Copy URL
          </button>
          <a
            href={downloadUrl}
            download
            style={{
              marginTop: 8,
              padding: '10px 32px',
              borderRadius: '6px',
              border: 'none',
              background: '#fff',
              color: '#232629',
              fontWeight: 600,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
