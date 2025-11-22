// DigitizedBrains Chatbot Integration
// Standalone multilingual AI chatbot widget

// Disable source map warnings and related errors
if (typeof console !== 'undefined' && console.warn) {
  const originalWarn = console.warn;
  console.warn = function(...args) {
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('source map') || 
         args[0].includes('sourcemap') ||
         args[0].includes('Could not read source map') ||
         args[0].includes('marked') ||
         args[0].includes('dompurify') ||
         args[0].includes('ENOENT'))) {
      return; // Suppress source map warnings
    }
    originalWarn.apply(console, args);
  };
}

// Also suppress console errors for source maps
if (typeof console !== 'undefined' && console.error) {
  const originalError = console.error;
  console.error = function(...args) {
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('source map') || 
         args[0].includes('sourcemap') ||
         args[0].includes('Could not read source map') ||
         args[0].includes('marked') ||
         args[0].includes('dompurify') ||
         args[0].includes('ENOENT'))) {
      return; // Suppress these errors
    }
    originalError.apply(console, args);
  };
}

class DigitizedBrainsChatbot {
  constructor(options = {}) {
    this.options = {
      iframeSrc: options.iframeSrc || 'https://ducnguyen1978-digitizedgemini.hf.space',
      widgetTitle: options.widgetTitle || 'Digitized Brains AI Agent',
      position: options.position || { bottom: '30px', right: '30px' },
      size: options.size || { width: '420px', height: '600px' },
      minSize: options.minSize || { width: '350px', height: '450px' },
      maxSize: options.maxSize || { width: '90vw', height: '90vh' },
      hideBranding: options.hideBranding !== false,
      ...options
    };
    
    this.isVisible = false;
    this.isMinimized = false;
    this.isMaximized = false;
    this.currentSize = { ...this.options.size };
    this.normalSize = { ...this.options.size };
    this.normalPosition = { ...this.options.position };
    this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
    
    // Initialize immediately
    this.init();
  }

  // Language texts for the chatbot
  getTexts() {
    const texts = {
      en: {
        title: 'Digitized Brains AI Agent',
        minimize: 'Minimize',
        maximize: 'Maximize',
        restore: 'Restore',
        close: 'Close',
        aiAssistant: '🤖 AI Assistant',
        loading: 'Loading AI Agent...'
      },
      vi: {
        title: 'Digitized Brains AI Agent',
        minimize: 'Thu gọn',
        maximize: 'Phóng to',
        restore: 'Thu nhỏ',
        close: 'Đóng',
        aiAssistant: '🤖 Trợ lý AI',
        loading: 'Đang khởi tạo AI Agent...'
      },
      de: {
        title: 'Digitized Brains KI-Agent',
        minimize: 'Minimieren',
        maximize: 'Maximieren',
        restore: 'Wiederherstellen',
        close: 'Schließen',
        aiAssistant: '🤖 KI-Assistent',
        loading: 'KI-Agent wird geladen...'
      }
    };
    return texts[this.currentLanguage] || texts.en;
  }

  // Language texts for appointment button
  getAppointmentTexts() {
    const texts = {
      en: {
        appointment: '📅 Book Appointment',
        tooltip: 'Schedule your visit',
        subtitle: 'Click to book now!'
      },
      vi: {
        appointment: '📅 Đặt lịch hẹn',
        tooltip: 'Đặt lịch khám',
        subtitle: 'Nhấn để đặt lịch!'
      },
      de: {
        appointment: '📅 Termin buchen',
        tooltip: 'Termin vereinbaren',
        subtitle: 'Klicken Sie hier!'
      },
      ru: {
        appointment: '📅 Запись на прием',
        tooltip: 'Записаться на прием',
        subtitle: 'Нажмите, чтобы записаться!'
      },
      ar: {
        appointment: '📅 حجز موعد',
        tooltip: 'احجز موعدك',
        subtitle: 'انقر للحجز!'
      }
    };
    return texts[this.currentLanguage] || texts.de;
  }

  updateLanguage() {
    const newLanguage = localStorage.getItem('preferredLanguage') || 'en';
    if (newLanguage !== this.currentLanguage) {
      this.currentLanguage = newLanguage;
      this.updateTexts();
    }
  }

  updateTexts() {
    const texts = this.getTexts();
    const appointmentTexts = this.getAppointmentTexts();

    // Update appointment button texts
    const appointmentHelpText = document.querySelector('#appointment-widget-btn .help-text');
    const appointmentSubtitle = document.querySelector('#appointment-widget-btn .tooltip-subtitle');
    if (appointmentHelpText) {
      appointmentHelpText.textContent = appointmentTexts.tooltip;
    }
    if (appointmentSubtitle) {
      appointmentSubtitle.textContent = appointmentTexts.subtitle;
    }

    // Update title
    const titleElement = document.querySelector('#chat-widget .widget-title');
    if (titleElement) {
      titleElement.textContent = texts.title;
    }

    // Update help text
    const helpTextElement = document.querySelector('#chat-widget-toggle .help-text');
    if (helpTextElement) {
      helpTextElement.textContent = texts.aiAssistant;
    }

    // Update tooltips
    const minimizeBtn = document.querySelector('#minimize-btn');
    const maximizeBtn = document.querySelector('#maximize-btn');
    const closeBtn = document.querySelector('#close-btn');

    if (minimizeBtn) minimizeBtn.title = texts.minimize;
    if (maximizeBtn) maximizeBtn.title = this.isMaximized ? texts.restore : texts.maximize;
    if (closeBtn) closeBtn.title = texts.close;

    // Update loading text
    const loadingText = document.querySelector('#loading-overlay p');
    if (loadingText) {
      loadingText.textContent = texts.loading;
    }
  }

  init() {
    console.log('Initializing DigitizedBrains Chatbot...');

    // Create elements
    this.createAppointmentButton();
    this.createToggleButton();
    this.createChatWidget();
    this.attachEventListeners();
    this.injectStyles();
    this.startLanguageWatcher();

    console.log('DigitizedBrains Chatbot initialized successfully!');
  }

  startLanguageWatcher() {
    // Watch for language changes every second
    setInterval(() => {
      this.updateLanguage();
    }, 1000);
  }

  createAppointmentButton() {
    // Remove existing button if any
    const existingButton = document.getElementById('appointment-widget-btn');
    if (existingButton) {
      existingButton.remove();
    }

    const texts = this.getAppointmentTexts();

    // Determine correct path to appointment.html based on current location
    const currentPath = window.location.pathname;
    const isInPagesFolder = currentPath.includes('/pages/');
    const appointmentPath = isInPagesFolder ? 'appointment.html' : 'pages/appointment.html';

    // Create orbit container
    let orbitContainer = document.getElementById('orbit-container');
    if (!orbitContainer) {
      orbitContainer = document.createElement('div');
      orbitContainer.id = 'orbit-container';
      orbitContainer.style.cssText = `
        position: fixed;
        bottom: ${this.options.position.bottom};
        right: ${this.options.position.right};
        width: 48px;
        height: 48px;
        z-index: 9999;
      `;
      document.body.appendChild(orbitContainer);
    }

    const appointmentButton = document.createElement('div');
    appointmentButton.id = 'appointment-widget-btn';
    appointmentButton.className = 'orbit-item orbit-appointment';

    appointmentButton.innerHTML = `
      <div class="appointment-btn-container">
        <button class="appointment-btn" onclick="window.location.href='${appointmentPath}'">
          <div class="btn-content">
            <div class="calendar-icon">📅</div>
            <div class="sparkle sparkle-1">✨</div>
            <div class="sparkle sparkle-2">✨</div>
            <div class="sparkle sparkle-3">✨</div>
          </div>
        </button>
        <div class="help-tooltip-appointment">
          <div class="tooltip-arrow-appointment"></div>
          <span class="help-text">${texts.tooltip}</span>
          <div class="tooltip-subtitle">${texts.subtitle}</div>
        </div>
      </div>
    `;

    orbitContainer.appendChild(appointmentButton);
  }

  createToggleButton() {
    // Remove existing button if any
    const existingButton = document.getElementById('chat-widget-toggle');
    if (existingButton) {
      existingButton.remove();
    }

    const texts = this.getTexts();

    // Get or create orbit container
    let orbitContainer = document.getElementById('orbit-container');
    if (!orbitContainer) {
      orbitContainer = document.createElement('div');
      orbitContainer.id = 'orbit-container';
      orbitContainer.style.cssText = `
        position: fixed;
        bottom: ${this.options.position.bottom};
        right: ${this.options.position.right};
        width: 48px;
        height: 48px;
        z-index: 9999;
      `;
      document.body.appendChild(orbitContainer);
    }

    const toggleButton = document.createElement('div');
    toggleButton.id = 'chat-widget-toggle';
    toggleButton.className = 'orbit-item orbit-ai';

    toggleButton.innerHTML = `
      <div class="chatbot-toggle-container">
        <button class="chatbot-toggle-btn" onclick="window.digitizedBrainsChatbot.toggle()">
          <div class="btn-content">
            <div class="brain-icon">🧠</div>
            <div class="pulse-ring"></div>
            <div class="pulse-ring pulse-ring-delay"></div>
          </div>
          <span class="notification-badge">AI</span>
        </button>
        <div class="help-tooltip">
          <div class="tooltip-arrow"></div>
          <span class="help-text">${texts.aiAssistant}</span>
          <div class="tooltip-subtitle">Nhấn để chat ngay!</div>
        </div>
      </div>
    `;

    orbitContainer.appendChild(toggleButton);
  }

  createChatWidget() {
    // Remove existing widget if any
    const existingWidget = document.getElementById('chat-widget');
    if (existingWidget) {
      existingWidget.remove();
    }
    
    const texts = this.getTexts();
    const chatWidget = document.createElement('div');
    chatWidget.id = 'chat-widget';
    chatWidget.style.cssText = `
      position: fixed;
      bottom: ${this.options.position.bottom};
      right: ${this.options.position.right};
      width: ${this.options.size.width};
      height: ${this.options.size.height};
      z-index: 9998;
      display: none;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;
    
    chatWidget.innerHTML = `
      <div class="chat-header">
        <div class="header-bg-animation"></div>
        <div class="header-content">
          <div class="ai-avatar">
            <div class="avatar-inner">🧠</div>
            <div class="status-indicator"></div>
          </div>
          <div class="ai-info">
            <span class="widget-title">${texts.title}</span>
            <span class="ai-status">🟢 Đang hoạt động</span>
          </div>
        </div>
        <div class="header-controls">
          <button id="minimize-btn" onclick="window.digitizedBrainsChatbot.minimizeWidget()" title="${texts.minimize}">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </button>
          <button id="maximize-btn" onclick="window.digitizedBrainsChatbot.toggleMaximize()" title="${texts.maximize}">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
            </svg>
          </button>
          <button id="close-btn" onclick="window.digitizedBrainsChatbot.toggle()" title="${texts.close}">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      <div id="chat-content" class="chat-content">
        <iframe id="chat-iframe" 
                src="${this.options.iframeSrc}" 
                style="width: 100%; height: 100%; border: none;"
                allow="microphone; camera">
        </iframe>
        <div id="loading-overlay" class="loading-overlay">
          <div class="loading-animation">
            <div class="brain-loading">
              <div class="brain-emoji">🧠</div>
              <div class="loading-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div class="loading-text">
              <h3>${texts.loading}</h3>
              <p>Đang kết nối với AI Agent...</p>
            </div>
          </div>
        </div>
      </div>
      <div id="resize-handle" class="resize-handle">
        <div class="resize-icon"></div>
      </div>
      <div class="chatbot-footer">
        <div class="footer-content">
          <div class="powered-by">
            <span class="powered-text">Powered by</span>
            <div class="brand-logo">
              <div class="brand-icon">🧠</div>
              <span class="brand-name">Digitized Brains</span>
            </div>
          </div>
          <div class="ai-version">
            <span class="version-badge">AI v2.0</span>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(chatWidget);
  }

  toggle() {
    this.isVisible = !this.isVisible;
    const widget = document.getElementById('chat-widget');
    const toggleButton = document.getElementById('chat-widget-toggle');
    
    if (this.isVisible) {
      // Hide toggle button when chat widget is visible
      toggleButton.style.display = 'none';
      
      widget.style.display = 'block';
      widget.style.transform = 'scale(0.8) translateY(20px)';
      widget.style.opacity = '0';
      
      setTimeout(() => {
        widget.style.transform = 'scale(1) translateY(0)';
        widget.style.opacity = '1';
      }, 10);
      
      this.hideLoadingAfterDelay();
    } else {
      widget.style.transform = 'scale(0.8) translateY(20px)';
      widget.style.opacity = '0';
      
      setTimeout(() => {
        widget.style.display = 'none';
        widget.style.transform = '';
        widget.style.opacity = '';
        
        // Show toggle button when chat widget is hidden
        toggleButton.style.display = 'block';
      }, 300);
    }
  }

  minimizeWidget() {
    const widget = document.getElementById('chat-widget');
    const content = document.getElementById('chat-content');
    const footer = document.querySelector('.chatbot-footer');
    
    this.isMinimized = !this.isMinimized;
    
    if (this.isMinimized) {
      content.style.display = 'none';
      if (footer) footer.style.display = 'none';
      widget.style.height = '60px';
    } else {
      content.style.display = 'block';
      if (footer) footer.style.display = 'flex';
      widget.style.height = this.currentSize.height;
    }
  }

  toggleMaximize() {
    const widget = document.getElementById('chat-widget');
    const texts = this.getTexts();
    
    this.isMaximized = !this.isMaximized;
    
    if (this.isMaximized) {
      widget.style.width = this.options.maxSize.width;
      widget.style.height = this.options.maxSize.height;
      widget.style.bottom = '10px';
      widget.style.right = '10px';
      this.currentSize = { ...this.options.maxSize };
    } else {
      widget.style.width = this.normalSize.width;
      widget.style.height = this.normalSize.height;
      widget.style.bottom = this.normalPosition.bottom;
      widget.style.right = this.normalPosition.right;
      this.currentSize = { ...this.normalSize };
    }
    
    this.updateTexts();
  }

  hideLoadingAfterDelay() {
    setTimeout(() => {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
          loadingOverlay.style.display = 'none';
        }, 500);
      }
    }, 3000);
  }

  attachEventListeners() {
    const widget = document.getElementById('chat-widget');
    const resizeHandle = document.getElementById('resize-handle');
    
    if (!resizeHandle) return;
    
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(window.getComputedStyle(widget).width, 10);
      startHeight = parseInt(window.getComputedStyle(widget).height, 10);
      
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', stopResize);
      e.preventDefault();
    });

    const handleResize = (e) => {
      if (!isResizing) return;
      
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);
      
      const minWidth = parseInt(this.options.minSize.width);
      const minHeight = parseInt(this.options.minSize.height);
      const maxWidth = parseInt(this.options.maxSize.width);
      const maxHeight = parseInt(this.options.maxSize.height);
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        widget.style.width = newWidth + 'px';
        this.currentSize.width = newWidth + 'px';
      }
      
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        widget.style.height = newHeight + 'px';
        this.currentSize.height = newHeight + 'px';
      }
    };

    const stopResize = () => {
      isResizing = false;
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', stopResize);
    };
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Orbit Container - Central point for rotation */
      #orbit-container {
        pointer-events: none;
        transform-origin: center center;
        position: relative;
      }

      /* Orbit trail path - visible circular path */
      #orbit-container::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 80px;
        height: 80px;
        border: 2px dashed rgba(94, 179, 179, 0.15);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: orbitTrailRotate 6s linear infinite;
      }

      #orbit-container::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: radial-gradient(
          circle at center,
          rgba(94, 179, 179, 0.05) 0%,
          rgba(251, 191, 36, 0.05) 50%,
          transparent 70%
        );
        transform: translate(-50%, -50%);
        animation: orbitGlow 3s ease-in-out infinite alternate;
      }

      .orbit-item {
        position: absolute;
        pointer-events: auto;
        top: 0;
        left: 0;
      }

      /* Appointment orbits clockwise */
      .orbit-appointment {
        animation: orbitClockwise 6s linear infinite;
      }

      /* AI orbits counter-clockwise */
      .orbit-ai {
        animation: orbitCounterClockwise 6s linear infinite;
      }

      /* Enhanced Chatbot Styles */
      .chatbot-toggle-container {
        position: relative;
        z-index: 10000;
      }

      .appointment-btn-container {
        position: relative;
        z-index: 10000;
      }
      
      .chatbot-toggle-btn {
        background: linear-gradient(135deg, #5eb3b3 0%, #4a9d9d 50%, #3d8a8a 100%);
        border: 2px solid rgba(255,255,255,0.4);
        border-radius: 50%;
        width: 48px;
        height: 48px;
        color: white;
        cursor: pointer;
        box-shadow:
          0 4px 16px rgba(94, 179, 179, 0.35),
          0 0 0 0 rgba(94, 179, 179, 0.7);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }

      .chatbot-toggle-btn::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%);
        transform: rotate(45deg);
        animation: shimmerSweep 3s linear infinite;
      }

      .btn-content {
        position: relative;
        z-index: 2;
      }

      .brain-icon {
        font-size: 20px;
        animation: brainCollision 3s ease-in-out infinite;
        filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
      }

      .pulse-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 48px;
        height: 48px;
        border: 2px solid rgba(94, 179, 179, 0.4);
        border-radius: 50%;
        animation: pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
      }

      .pulse-ring-delay {
        animation-delay: 1s;
      }

      .notification-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        background: linear-gradient(135deg, #FF6B6B, #FF8E53);
        color: white;
        font-size: 9px;
        font-weight: bold;
        padding: 3px 6px;
        border-radius: 10px;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(255, 107, 107, 0.4);
        animation: badgeBounce 2s ease-in-out infinite;
      }
      
      .chatbot-toggle-btn:hover {
        transform: scale(1.1) translateY(-2px);
        box-shadow:
          0 12px 40px rgba(94, 179, 179, 0.6),
          0 0 0 10px rgba(94, 179, 179, 0.1);
      }
      
      .help-tooltip {
        position: absolute;
        right: 58px;
        top: 50%;
        transform: translateY(-50%);
        background: linear-gradient(135deg, #5eb3b3 0%, #4a9d9d 100%);
        color: white;
        padding: 8px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 4px 16px rgba(94, 179, 179, 0.3);
        animation: tooltipFloat 3s ease-in-out infinite;
      }
      
      .chatbot-toggle-container:hover .help-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateY(-50%) translateX(-10px);
      }
      
      .tooltip-arrow {
        position: absolute;
        right: -8px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid #4a9d9d;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
      }
      
      .tooltip-subtitle {
        font-size: 10px;
        opacity: 0.8;
        margin-top: 2px;
        font-style: italic;
      }
      
      #chat-widget {
        background: white;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(102, 126, 234, 0.1);
        backdrop-filter: blur(10px);
        box-shadow: 
          0 25px 50px -12px rgba(0, 0, 0, 0.25),
          0 0 0 1px rgba(255, 255, 255, 0.05);
      }
      
      .chat-header {
        background: linear-gradient(135deg, #5eb3b3 0%, #4a9d9d 50%, #3d8a8a 100%);
        color: white;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        overflow: hidden;
        min-height: 60px;
      }
      
      .header-bg-animation {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, 
          rgba(255,255,255,0.1) 0%, 
          rgba(255,255,255,0.05) 25%,
          rgba(255,255,255,0.1) 50%,
          rgba(255,255,255,0.05) 75%,
          rgba(255,255,255,0.1) 100%);
        animation: headerFlow 4s linear infinite;
      }
      
      .header-content {
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 2;
        position: relative;
      }
      
      .ai-avatar {
        position: relative;
        width: 40px;
        height: 40px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid rgba(255,255,255,0.3);
      }
      
      .avatar-inner {
        font-size: 20px;
        animation: avatarBounce 2s ease-in-out infinite;
      }
      
      .status-indicator {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 12px;
        height: 12px;
        background: #4CAF50;
        border-radius: 50%;
        border: 2px solid white;
        animation: statusPulse 1.5s ease-in-out infinite;
      }
      
      .ai-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .widget-title {
        font-weight: 700;
        font-size: 16px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      
      .ai-status {
        font-size: 11px;
        opacity: 0.9;
        font-weight: 500;
      }
      
      .header-controls {
        display: flex;
        gap: 6px;
        z-index: 2;
        position: relative;
      }
      
      .header-controls button {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 6px;
        color: white;
        padding: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .header-controls button:hover {
        background: rgba(255,255,255,0.3);
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      
      .chat-content {
        height: calc(100% - 60px - 50px);
        position: relative;
      }
      
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 30px;
        z-index: 10;
      }
      
      .loading-animation {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }
      
      .brain-loading {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
      }
      
      .brain-emoji {
        font-size: 48px;
        animation: brainProcess 2s ease-in-out infinite;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
      }
      
      .loading-dots {
        display: flex;
        gap: 8px;
      }
      
      .loading-dots span {
        width: 8px;
        height: 8px;
        background: #5eb3b3;
        border-radius: 50%;
        animation: dotPulse 1.4s ease-in-out infinite both;
      }
      
      .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
      .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
      .loading-dots span:nth-child(3) { animation-delay: 0s; }
      
      .loading-text h3 {
        color: #334155;
        font-size: 20px;
        font-weight: 600;
        margin: 0;
      }
      
      .loading-text p {
        color: #64748b;
        font-size: 14px;
        margin: 8px 0 0 0;
        font-weight: 500;
      }
      
      .resize-handle {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #5eb3b3 0%, #4a9d9d 100%);
        cursor: se-resize;
        opacity: 0.6;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .resize-handle:hover {
        opacity: 1;
        transform: scale(1.1);
      }
      
      .resize-icon {
        width: 8px;
        height: 8px;
        border-right: 2px solid white;
        border-bottom: 2px solid white;
        opacity: 0.8;
      }
      
      /* Chatbot Footer Banner */
      .chatbot-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 50px;
        background: linear-gradient(135deg, #5eb3b3 0%, #4a9d9d 50%, #3d8a8a 100%);
        border-top: 1px solid rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        z-index: 15;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      }
      
      .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0 15px;
      }
      
      .powered-by {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .powered-text {
        font-size: 11px;
        color: rgba(255,255,255,0.8);
        font-weight: 500;
      }
      
      .brand-logo {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .brand-icon {
        font-size: 16px;
        animation: brandPulse 3s ease-in-out infinite;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
      }
      
      .brand-name {
        font-size: 13px;
        font-weight: 700;
        color: white;
        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      }
      
      .ai-version {
        display: flex;
        align-items: center;
      }
      
      .version-badge {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        font-size: 10px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 12px;
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        animation: versionGlow 2s ease-in-out infinite alternate;
      }
      
      /* Enhanced Animations */
      
      @keyframes pulseRing {
        0% {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) scale(1.4);
          opacity: 0;
        }
      }
      
      @keyframes brainThink {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(-2deg); }
        75% { transform: scale(1.05) rotate(2deg); }
      }
      
      @keyframes badgeBounce {
        0%, 100% { transform: scale(1) translateY(0); }
        50% { transform: scale(1.1) translateY(-2px); }
      }
      
      @keyframes tooltipFloat {
        0%, 100% { transform: translateY(-50%) translateY(0); }
        50% { transform: translateY(-50%) translateY(-3px); }
      }
      
      @keyframes shimmerSweep {
        0% { transform: translateX(-100%) rotate(45deg); }
        100% { transform: translateX(100%) rotate(45deg); }
      }
      
      @keyframes headerFlow {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
      
      @keyframes avatarBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      @keyframes statusPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.2); }
      }
      
      @keyframes brainProcess {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(-5deg); }
        75% { transform: scale(1.05) rotate(5deg); }
      }
      
      @keyframes dotPulse {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      @keyframes brandPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      @keyframes versionGlow {
        0% { 
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          background: rgba(255,255,255,0.2);
        }
        100% { 
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          background: rgba(255,255,255,0.3);
        }
      }
      
      /* Appointment Button Styles */
      .appointment-btn-container {
        position: relative;
        z-index: 10000;
      }

      .appointment-btn {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
        border: 2px solid rgba(255,255,255,0.4);
        border-radius: 50%;
        width: 48px;
        height: 48px;
        color: white;
        cursor: pointer;
        box-shadow:
          0 4px 16px rgba(251, 191, 36, 0.35),
          0 0 0 0 rgba(251, 191, 36, 0.5);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: visible;
      }

      .appointment-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
        animation: rotateGlow 3s linear infinite;
      }


      .calendar-icon {
        font-size: 20px;
        animation: calendarBounce 3s ease-in-out infinite;
        filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
        position: relative;
        z-index: 2;
      }

      .sparkle {
        position: absolute;
        font-size: 10px;
        animation: sparkleFloat 2s ease-in-out infinite;
        pointer-events: none;
        opacity: 0;
      }

      .sparkle-1 {
        top: -6px;
        right: 6px;
        animation-delay: 0s;
      }

      .sparkle-2 {
        bottom: -4px;
        left: 4px;
        animation-delay: 0.7s;
      }

      .sparkle-3 {
        top: 4px;
        left: -8px;
        animation-delay: 1.4s;
      }

      .appointment-btn:hover {
        transform: scale(1.15) translateY(-3px) rotate(5deg);
        box-shadow:
          0 10px 30px rgba(251, 191, 36, 0.6),
          0 0 0 12px rgba(251, 191, 36, 0.15);
      }

      .appointment-btn:hover .sparkle {
        animation-play-state: paused;
        opacity: 1 !important;
      }

      .help-tooltip-appointment {
        position: absolute;
        right: 58px;
        top: 50%;
        transform: translateY(-50%);
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        padding: 8px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
        z-index: 9999;
      }

      .appointment-btn-container:hover .help-tooltip-appointment {
        opacity: 1;
        transform: translateY(-50%) translateX(-8px);
      }

      .tooltip-arrow-appointment {
        position: absolute;
        right: -8px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid #f59e0b;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
      }

      .help-tooltip-appointment .tooltip-subtitle {
        display: block;
        font-size: 10px;
        opacity: 0.9;
        margin-top: 2px;
        font-weight: 400;
      }

      /* Orbit Clockwise - Appointment circles around center */
      @keyframes orbitClockwise {
        0% {
          transform: translate(0px, -30px) rotate(0deg);
        }
        25% {
          transform: translate(30px, 0px) rotate(90deg);
        }
        50% {
          transform: translate(0px, 30px) rotate(180deg);
        }
        75% {
          transform: translate(-30px, 0px) rotate(270deg);
        }
        100% {
          transform: translate(0px, -30px) rotate(360deg);
        }
      }

      /* Orbit Counter-Clockwise - AI circles around center in opposite direction */
      @keyframes orbitCounterClockwise {
        0% {
          transform: translate(0px, 30px) rotate(0deg);
        }
        25% {
          transform: translate(-30px, 0px) rotate(-90deg);
        }
        50% {
          transform: translate(0px, -30px) rotate(-180deg);
        }
        75% {
          transform: translate(30px, 0px) rotate(-270deg);
        }
        100% {
          transform: translate(0px, 30px) rotate(-360deg);
        }
      }

      /* Orbit trail rotation */
      @keyframes orbitTrailRotate {
        0% {
          transform: translate(-50%, -50%) rotate(0deg);
        }
        100% {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }

      /* Orbit glow pulse */
      @keyframes orbitGlow {
        0% {
          opacity: 0.3;
          transform: translate(-50%, -50%) scale(0.95);
        }
        100% {
          opacity: 0.6;
          transform: translate(-50%, -50%) scale(1.05);
        }
      }

      @keyframes rotateGlow {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes calendarBounce {
        0%, 100% {
          transform: translateY(0) scale(1);
        }
        45% {
          transform: translateY(-2px) scale(1.05);
        }
        50% {
          /* Collision - squash effect */
          transform: translateY(0) scale(1.15, 0.9);
        }
        55% {
          transform: translateY(-2px) scale(0.95, 1.1);
        }
        70% {
          transform: translateY(0) scale(1.02, 0.98);
        }
      }

      @keyframes sparkleFloat {
        0%, 100% {
          opacity: 0;
          transform: translateY(0) scale(0.5);
        }
        50% {
          opacity: 1;
          transform: translateY(-10px) scale(1);
        }
      }

      @keyframes brainCollision {
        0%, 100% {
          transform: translateY(0) scale(1);
        }
        45% {
          transform: translateY(-2px) scale(1.05);
        }
        50% {
          /* Collision - squash effect */
          transform: translateY(0) scale(1.15, 0.9);
        }
        55% {
          transform: translateY(-2px) scale(0.95, 1.1);
        }
        70% {
          transform: translateY(0) scale(1.02, 0.98);
        }
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .appointment-btn {
          width: 42px;
          height: 42px;
        }

        .calendar-icon {
          font-size: 18px;
        }

        .sparkle {
          font-size: 8px;
        }

        .help-tooltip-appointment {
          display: none;
        }

        #appointment-widget-btn {
          bottom: 78px !important;
        }

        .chatbot-toggle-btn {
          width: 42px;
          height: 42px;
          bottom: 12px;
          right: 12px;
        }

        .brain-icon {
          font-size: 18px;
        }

        .notification-badge {
          font-size: 8px;
          padding: 2px 5px;
          top: -4px;
          right: -4px;
        }

        .pulse-ring {
          width: 42px;
          height: 42px;
        }

        .help-tooltip {
          display: none;
        }

        #chat-widget-toggle {
          bottom: 12px !important;
          right: 12px !important;
        }

        #chat-widget {
          width: 100vw !important;
          height: 100vh !important;
          bottom: 0 !important;
          right: 0 !important;
          border-radius: 0 !important;
        }

        .chat-header {
          border-radius: 0 !important;
        }
      }
      
      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .chatbot-toggle-btn {
          border: 3px solid #000;
        }
        
        .chat-header {
          border-bottom: 2px solid #000;
        }
      }
      
      /* Hide iframe branding and override Gradio footer */
      iframe[src*="huggingface"] {
        filter: contrast(1.1) brightness(1.05);
        margin-bottom: -50px !important;
      }
      
      /* Ensure footer covers Gradio elements */
      .chatbot-footer::before {
        content: '';
        position: absolute;
        top: -10px;
        left: 0;
        right: 0;
        height: 10px;
        background: linear-gradient(to bottom, transparent, rgba(102, 126, 234, 0.1));
      }
    `;
    document.head.appendChild(style);
  }
}

// Global variables and initialization
let digitizedBrainsChatbot;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing chatbot...');
  
  try {
    digitizedBrainsChatbot = new DigitizedBrainsChatbot({
      iframeSrc: 'https://ducnguyen1978-digitizedgemini.hf.space',
      widgetTitle: 'Digitized Brains AI Agent',
      size: { width: '420px', height: '600px' },
      minSize: { width: '370px', height: '450px' },
      maxSize: { width: '95vw', height: '95vh' },
      hideBranding: true
    });
    
    // Make globally available
    window.digitizedBrainsChatbot = digitizedBrainsChatbot;
    
    console.log('Chatbot initialized and available globally');
  } catch (error) {
    console.error('Error initializing chatbot:', error);
  }
});

// Backward compatibility function
function toggleChatWidget() {
  if (window.digitizedBrainsChatbot) {
    window.digitizedBrainsChatbot.toggle();
  } else {
    console.warn('Chatbot not initialized yet');
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DigitizedBrainsChatbot;
}
