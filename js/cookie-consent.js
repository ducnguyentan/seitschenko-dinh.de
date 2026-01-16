/**
 * Cookie Consent Manager
 * Handles cookie consent preferences and modal display
 */

(function() {
  'use strict';

  const COOKIE_NAME = 'cookie_consent';
  const COOKIE_EXPIRY_DAYS = 365;

  // Cookie consent state
  let consentState = {
    essential: true,
    externalMedia: false,
    timestamp: null
  };

  /**
   * Get cookie value by name
   */
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  }

  /**
   * Set cookie
   */
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }

  /**
   * Load consent state from cookie
   */
  function loadConsentState() {
    const savedConsent = getCookie(COOKIE_NAME);
    if (savedConsent) {
      try {
        consentState = JSON.parse(decodeURIComponent(savedConsent));
        return true;
      } catch (e) {
        console.error('Error parsing cookie consent:', e);
      }
    }
    return false;
  }

  /**
   * Save consent state to cookie
   */
  function saveConsentState() {
    consentState.timestamp = new Date().toISOString();
    const consentString = encodeURIComponent(JSON.stringify(consentState));
    setCookie(COOKIE_NAME, consentString, COOKIE_EXPIRY_DAYS);
  }

  /**
   * Show cookie consent modal with animation
   */
  function showConsentModal() {
    const modal = document.getElementById('cookie-consent-modal');
    if (modal) {
      modal.style.display = 'flex';
      // Remove hiding class if present
      modal.classList.remove('hiding');
      const modalContent = modal.querySelector('.cookie-consent-modal');
      if (modalContent) {
        modalContent.classList.remove('hiding');
      }
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Hide cookie consent modal with animation
   */
  function hideConsentModal() {
    const modal = document.getElementById('cookie-consent-modal');
    if (modal) {
      // Add hiding class to trigger fade out animation
      modal.classList.add('hiding');
      const modalContent = modal.querySelector('.cookie-consent-modal');
      if (modalContent) {
        modalContent.classList.add('hiding');
      }

      // Wait for animation to complete before hiding (increased to 500ms for rotate effect)
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('hiding');
        if (modalContent) {
          modalContent.classList.remove('hiding');
        }
        // Restore body scroll
        document.body.style.overflow = '';
      }, 500);
    }
  }

  /**
   * Delete all cookies except consent cookie
   */
  function deleteAllCookies() {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      // Don't delete the consent cookie itself
      if (name !== COOKIE_NAME) {
        // Delete cookie for current domain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        // Also try to delete for parent domain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${location.hostname};`;
        // Try with leading dot
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${location.hostname};`;
      }
    }
  }

  /**
   * Clear storage if user doesn't consent
   */
  function clearNonEssentialStorage() {
    try {
      // Clear localStorage (keep only essential items)
      const essentialKeys = ['preferredLanguage', 'cookie_consent'];
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !essentialKeys.includes(key)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage completely
      sessionStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  }

  /**
   * Apply consent preferences
   */
  function applyConsent() {
    // If user rejected external media, delete all non-essential cookies
    if (!consentState.externalMedia) {
      deleteAllCookies();
      clearNonEssentialStorage();
      disableExternalMedia();
      disableTracking();
    } else {
      // Enable external media (YouTube, Google Maps, etc.)
      enableExternalMedia();
      enableTracking();
    }

    // Trigger custom event for other scripts to listen
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
      detail: consentState
    }));
  }

  /**
   * Enable external media embeds
   */
  function enableExternalMedia() {
    // Restore iframes that were replaced with placeholders
    const placeholders = document.querySelectorAll('.external-media-blocked[data-replaced-frame="true"]');

    placeholders.forEach(placeholder => {
      if (placeholder.dataset.frameSrc) {
        // Recreate iframe from saved src
        const iframe = document.createElement('iframe');
        iframe.src = placeholder.dataset.frameSrc;
        iframe.style.cssText = 'width: 100%; height: 400px; border: 0; border-radius: 8px;';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';

        // Replace placeholder with iframe
        placeholder.parentNode.replaceChild(iframe, placeholder);
      }
    });

    // Also handle iframes that were only disabled (data-src approach)
    const youtubeFrames = document.querySelectorAll('iframe[data-src*="youtube.com"]');
    youtubeFrames.forEach(frame => {
      if (!frame.src && frame.dataset.src) {
        frame.src = frame.dataset.src;
      }
    });

    const mapFrames = document.querySelectorAll('iframe[data-src*="google.com/maps"]');
    mapFrames.forEach(frame => {
      if (!frame.src && frame.dataset.src) {
        frame.src = frame.dataset.src;
      }
    });
  }

  /**
   * Disable external media embeds
   */
  function disableExternalMedia() {
    // Find all external media iframes
    const externalFrames = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="google.com/maps"], iframe[src*="vimeo.com"], iframe[src*="facebook.com"]');

    externalFrames.forEach(frame => {
      // Save original src
      if (frame.src && !frame.dataset.originalSrc) {
        frame.dataset.originalSrc = frame.src;
      }

      // Create placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'external-media-blocked';
      placeholder.style.cssText = `
        width: 100%;
        height: ${frame.offsetHeight || 400}px;
        background: #f0f0f0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        font-family: Arial, sans-serif;
      `;

      // Determine content type
      let contentType = 'externe Inhalte';
      if (frame.src.includes('google.com/maps')) {
        contentType = 'Google Maps';
      } else if (frame.src.includes('youtube.com')) {
        contentType = 'YouTube Video';
      }

      placeholder.innerHTML = `
        <div style="color: #666; margin-bottom: 1rem;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 9l6 6M15 9l-6 6"/>
          </svg>
        </div>
        <h3 style="color: #333; margin: 0 0 0.5rem 0; font-size: 1.25rem;">
          ${contentType} wurde blockiert
        </h3>
        <p style="color: #666; margin: 0 0 1rem 0; font-size: 0.9rem; max-width: 400px;">
          Um diesen Inhalt anzuzeigen, müssen Sie externe Medien in den Cookie-Einstellungen akzeptieren.
        </p>
        <button onclick="window.CookieConsent.show()" style="
          background: #2d7a3e;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        " onmouseover="this.style.background='#1f5a2b'" onmouseout="this.style.background='#2d7a3e'">
          Cookie-Einstellungen ändern
        </button>
      `;

      // Replace iframe with placeholder
      frame.parentNode.replaceChild(placeholder, frame);
      // Store reference to placeholder for later restoration
      placeholder.dataset.replacedFrame = 'true';
      placeholder.dataset.frameSrc = frame.dataset.originalSrc;
    });
  }

  /**
   * Disable tracking scripts (Google Analytics, Facebook Pixel, etc.)
   */
  function disableTracking() {
    // Disable Google Analytics
    window['ga-disable-UA-XXXXX-Y'] = true; // Replace with your GA ID
    window['ga-disable-G-XXXXXXXXXX'] = true; // Replace with your GA4 ID

    // Disable Google Tag Manager dataLayer
    if (window.dataLayer) {
      window.dataLayer = [];
    }

    // Disable Facebook Pixel
    if (window.fbq) {
      window.fbq = function() {};
    }

    // Block tracking scripts from loading
    const trackingScripts = document.querySelectorAll('script[src*="google-analytics"], script[src*="googletagmanager"], script[src*="facebook.net"], script[src*="doubleclick"]');
    trackingScripts.forEach(script => {
      script.remove();
    });
  }

  /**
   * Enable tracking scripts
   */
  function enableTracking() {
    // Re-enable Google Analytics
    window['ga-disable-UA-XXXXX-Y'] = false; // Replace with your GA ID
    window['ga-disable-G-XXXXXXXXXX'] = false; // Replace with your GA4 ID

    // Note: Scripts removed by disableTracking() won't auto-reload
    // You may need to reload the page for full tracking functionality
  }

  /**
   * Accept all cookies
   */
  function acceptAll() {
    consentState.essential = true;
    consentState.externalMedia = true;
    saveConsentState();
    applyConsent();
    hideConsentModal();
  }

  /**
   * Save individual preferences
   */
  function savePreferences() {
    const externalMediaCheckbox = document.getElementById('cookie-external-media');

    consentState.essential = true; // Always true
    consentState.externalMedia = externalMediaCheckbox ? externalMediaCheckbox.checked : false;

    saveConsentState();
    applyConsent();
    hideConsentModal();
  }

  /**
   * Show individual settings - Opens detailed modal
   */
  function showIndividualSettings() {
    hideConsentModal();
    // Wait for main modal to hide before showing detailed modal (increased to 550ms for rotate effect)
    setTimeout(() => {
      showDetailedModal();
    }, 550);
  }

  /**
   * Show detailed settings modal with animation
   */
  function showDetailedModal() {
    const modal = document.getElementById('cookie-detailed-modal');
    if (modal) {
      // Sync checkbox state
      const mainCheckbox = document.getElementById('cookie-external-media');
      const detailedCheckbox = document.getElementById('detailed-external-media');
      if (mainCheckbox && detailedCheckbox) {
        detailedCheckbox.checked = mainCheckbox.checked;
      }
      modal.style.display = 'flex';
      // Remove hiding class if present
      modal.classList.remove('hiding');
      const modalContent = modal.querySelector('.cookie-consent-modal');
      if (modalContent) {
        modalContent.classList.remove('hiding');
      }
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Close detailed modal with animation
   */
  function closeDetailedModal() {
    const modal = document.getElementById('cookie-detailed-modal');
    if (modal) {
      // Add hiding class to trigger fade out animation
      modal.classList.add('hiding');
      const modalContent = modal.querySelector('.cookie-consent-modal');
      if (modalContent) {
        modalContent.classList.add('hiding');
      }

      // Wait for animation to complete before hiding (increased to 500ms for rotate effect)
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('hiding');
        if (modalContent) {
          modalContent.classList.remove('hiding');
        }
        document.body.style.overflow = '';
        // Show main modal again after detailed modal is hidden
        showConsentModal();
      }, 500);
    }
  }

  /**
   * Save detailed settings with animation
   */
  function saveDetailedSettings() {
    const detailedCheckbox = document.getElementById('detailed-external-media');
    const mainCheckbox = document.getElementById('cookie-external-media');

    // Sync back to main modal
    if (detailedCheckbox && mainCheckbox) {
      mainCheckbox.checked = detailedCheckbox.checked;
    }

    consentState.essential = true;
    consentState.externalMedia = detailedCheckbox ? detailedCheckbox.checked : false;

    saveConsentState();
    applyConsent();

    const modal = document.getElementById('cookie-detailed-modal');
    if (modal) {
      // Add hiding class to trigger fade out animation
      modal.classList.add('hiding');
      const modalContent = modal.querySelector('.cookie-consent-modal');
      if (modalContent) {
        modalContent.classList.add('hiding');
      }

      // Wait for animation to complete before hiding (increased to 500ms for rotate effect)
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('hiding');
        if (modalContent) {
          modalContent.classList.remove('hiding');
        }
        document.body.style.overflow = '';
      }, 500);
    }
  }

  /**
   * Toggle cookie detail section
   */
  function toggleCookieDetail(section) {
    const content = document.getElementById(`content-${section}`);
    const expand = document.getElementById(`expand-${section}`);

    if (content && expand) {
      content.classList.toggle('open');
      expand.classList.toggle('open');
    }
  }

  /**
   * Block cookie setting if user hasn't consented
   */
  function setupCookieInterceptor() {
    // Intercept document.cookie setter
    const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');

    Object.defineProperty(document, 'cookie', {
      get: function() {
        return originalCookieDescriptor.get.call(document);
      },
      set: function(value) {
        // Allow only consent cookie and essential cookies
        const cookieName = value.split('=')[0].trim();
        const essentialCookies = [COOKIE_NAME, 'preferredLanguage'];

        // If user hasn't consented to external media, block all non-essential cookies
        if (!consentState.externalMedia && !essentialCookies.includes(cookieName)) {
          console.warn(`Cookie blocked: ${cookieName} (user hasn't consented)`);
          return;
        }

        // Allow cookie to be set
        originalCookieDescriptor.set.call(document, value);
      },
      configurable: true
    });
  }

  /**
   * Initialize cookie consent
   */
  function init() {
    console.log('[Cookie Consent] Initializing...');

    // Load existing consent state
    const hasConsent = loadConsentState();
    console.log('[Cookie Consent] Has existing consent:', hasConsent);
    console.log('[Cookie Consent] Current consent state:', consentState);

    // Block all cookies by default until user consents
    setupCookieInterceptor();

    // Only show modal if user hasn't made a choice yet
    if (!hasConsent) {
      setTimeout(() => {
        console.log('[Cookie Consent] No consent found, showing modal');
        showConsentModal();
      }, 500);
    } else {
      console.log('[Cookie Consent] Consent already given, applying preferences');
      // Apply existing consent preferences
      applyConsent();
    }

    // Set up event listeners
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const saveBtn = document.getElementById('cookie-save-preferences');
    const individualBtn = document.getElementById('cookie-individual-settings');

    console.log('[Cookie Consent] Setting up event listeners');
    console.log('Accept All Button:', acceptAllBtn);
    console.log('Save Button:', saveBtn);
    console.log('Individual Settings Button:', individualBtn);

    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', acceptAll);
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', savePreferences);
    }

    if (individualBtn) {
      individualBtn.addEventListener('click', showIndividualSettings);
    }

    // Update checkbox states based on saved preferences
    const externalMediaCheckbox = document.getElementById('cookie-external-media');
    if (externalMediaCheckbox) {
      externalMediaCheckbox.checked = consentState.externalMedia;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  window.CookieConsent = {
    show: showConsentModal,
    hide: hideConsentModal,
    getState: () => ({ ...consentState }),
    acceptAll,
    savePreferences
  };

  // Expose functions for HTML onclick handlers
  window.toggleCookieDetail = toggleCookieDetail;
  window.saveDetailedSettings = saveDetailedSettings;
  window.closeDetailedModal = closeDetailedModal;

})();
