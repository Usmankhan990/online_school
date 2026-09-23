import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCurrentLanguage, toggleLanguage } from '../utils/translate';
import logoImg from '../assets/logo.jpg';

export default function LanguageToggle({ className = '', style = {} }) {
  const [lang, setLang] = useState(getCurrentLanguage());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLangChange = (e) => {
      setLang(e.detail?.lang || getCurrentLanguage());
    };
    window.addEventListener('language-changed', handleLangChange);
    return () => window.removeEventListener('language-changed', handleLangChange);
  }, []);

  const handleToggle = () => {
    setLoading(true);
    const current = getCurrentLanguage();
    const next = current === 'ur' ? 'en' : 'ur';
    setLang(next);
    toggleLanguage();

    if (next === 'en') {
      setTimeout(() => {
        window.location.reload();
      }, 150);
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 400);
    }
  };

  const isUrdu = lang === 'ur';

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        className={`lang-toggle-btn ${className}`}
        title={isUrdu ? 'Switch to English' : 'اردو میں تبدیل کریں (Switch to Urdu)'}
        style={{
          ...style,
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
        </svg>
        <span>{isUrdu ? 'English' : 'Urdu'}</span>
      </button>

      {loading && createPortal(
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999999,
            animation: 'fadeIn 0.12s ease-out'
          }}
        >
          <div style={{ position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src={logoImg} 
              alt="Taleem Ghar" 
              style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', background: '#ffffff', padding: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }} 
            />
            <div 
              style={{ 
                position: 'absolute', 
                inset: -4, 
                borderRadius: 16, 
                border: '2.5px solid transparent', 
                borderTopColor: '#10b981', 
                borderRightColor: '#10b981', 
                animation: 'spin 0.9s linear infinite' 
              }} 
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
