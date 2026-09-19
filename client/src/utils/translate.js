/**
 * Google Translate Language Switcher for Taleem Ghar - Instant Bidirectional Translation
 */

export function getCurrentLanguage() {
  const saved = localStorage.getItem('site_lang');
  if (saved) return saved;
  const match = document.cookie.match(/googtrans=([^;]+)/);
  if (match && match[1].includes('/ur')) return 'ur';
  return 'en';
}

function ensureOptions(select) {
  if (!select) return;
  if (!select.querySelector('option[value="en"]')) {
    const optEn = document.createElement('option');
    optEn.value = 'en';
    optEn.textContent = 'English';
    select.appendChild(optEn);
  }
  if (!select.querySelector('option[value="ur"]')) {
    const optUr = document.createElement('option');
    optUr.value = 'ur';
    optUr.textContent = 'Urdu';
    select.appendChild(optUr);
  }
}

function triggerLanguage(targetLang) {
  const select = document.querySelector('.goog-te-combo');
  if (select) {
    ensureOptions(select);
    select.value = targetLang;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    select.dispatchEvent(new Event('input', { bubbles: true }));

    // Also trigger iframe restore if returning to English
    if (targetLang === 'en') {
      const restoreButtons = document.querySelectorAll('button[id*="restore"], [id*="restore"], .goog-close-link');
      restoreButtons.forEach(btn => {
        try { btn.click(); } catch(e) {}
      });
      const iframes = document.querySelectorAll('iframe.goog-te-banner-frame, iframe');
      iframes.forEach(frame => {
        try {
          const doc = frame.contentDocument || frame.contentWindow?.document;
          doc?.querySelector('button[id*="restore"], [id*="restore"], .goog-close-link')?.click();
        } catch(e) {}
      });
    }
    return true;
  }
  return false;
}

export function setLanguage(lang) {
  localStorage.setItem('site_lang', lang);

  const host = window.location.hostname;
  const target = lang === 'ur' ? '/en/ur' : '/en/en';

  const domains = ['', host, '.' + host];
  if (host.includes('.')) {
    const mainDomain = host.split('.').slice(-2).join('.');
    domains.push('.' + mainDomain);
  }

  domains.forEach(d => {
    const domainStr = d ? `; domain=${d}` : '';
    if (lang === 'en') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainStr}`;
    }
    document.cookie = `googtrans=${target}; path=/${domainStr}`;
  });

  window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }));

  if (!triggerLanguage(lang)) {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (triggerLanguage(lang) || attempts > 30) {
        clearInterval(interval);
      }
    }, 20);
  }
}

export function toggleLanguage() {
  const current = getCurrentLanguage();
  const next = current === 'ur' ? 'en' : 'ur';
  setLanguage(next);
  return next;
}

