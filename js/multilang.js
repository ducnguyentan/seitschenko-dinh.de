(function() {
  "use strict";
  
  // Language configuration
  const languageConfig = {
    en: { flag: "https://flagcdn.com/24x18/us.png", code: "EN", alt: "English" },
    vi: { flag: "https://flagcdn.com/24x18/vn.png", code: "VI", alt: "Tiếng Việt" },
    de: { flag: "https://flagcdn.com/24x18/de.png", code: "DE", alt: "Deutsch" }
  };
  
  // Common translations
  const commonTranslations = {
    en: {
      nav: { 
        home: "Home", 
        about: "About", 
        digitalTransformation: "Digital Transformation", 
        aiAgent: "AI Agent", 
        blog: "Blog", 
        resources: "Resources", 
        contact: "Contact" 
      },
      language: { current: "Language:" },
      footer: { 
        description: "Leading digital transformation solutions for Vietnamese enterprises.", 
        quickLinks: "Quick Links", 
        contact: "Contact", 
        location: "Ho Chi Minh City, Vietnam", 
        copyright: "© 2025 DigitizedBrains. All rights reserved." 
      },
      chatbot: {
        title: "AI Assistant",
        placeholder: "Type your message...",
        send: "Send"
      },
      cookie: {
        title: "Privacy Settings",
        description1: "We use cookies on our website. Some of them are essential, while others help us improve this website and your experience.",
        description2: "If you are under 16 years old and want to give your consent to voluntary services, you must ask your parents or guardians for permission.",
        description3: "We use cookies and other technologies on our website. Some of them are essential, while others help us improve this website and your experience. Personal data may be processed (e.g. IP addresses), e.g. for personalized ads and content or ad and content measurement. For more information about how we use your data, please see our",
        privacy_link: "Privacy Policy",
        settings_link: "Settings",
        essential: "Essential",
        external_media: "External Media",
        accept_all: "Accept All",
        save: "Save",
        individual: "Individual Privacy Settings",
        cookie_details: "Cookie Details",
        privacy_policy: "Privacy Policy",
        imprint: "Imprint"
      }
    },
    vi: {
      nav: { 
        home: "Trang chủ", 
        about: "Giới thiệu", 
        digitalTransformation: "Chuyển đổi số", 
        aiAgent: "AI Agent", 
        blog: "Blog", 
        resources: "Tài nguyên", 
        contact: "Liên hệ" 
      },
      language: { current: "Ngôn ngữ:" },
      footer: { 
        description: "Giải pháp chuyển đổi số hàng đầu cho doanh nghiệp Việt Nam.", 
        quickLinks: "Liên kết nhanh", 
        contact: "Liên hệ", 
        location: "Thành phố Hồ Chí Minh, Việt Nam", 
        copyright: "© 2025 DigitizedBrains. Tất cả quyền được bảo lưu." 
      },
      chatbot: {
        title: "Trợ lý AI",
        placeholder: "Nhập tin nhắn của bạn...",
        send: "Gửi"
      },
      cookie: {
        title: "Cài đặt quyền riêng tư",
        description1: "Chúng tôi sử dụng cookie trên trang web. Một số là cần thiết, trong khi những cookie khác giúp chúng tôi cải thiện trang web này và trải nghiệm của bạn.",
        description2: "Nếu bạn dưới 16 tuổi và muốn đồng ý với các dịch vụ tự nguyện, bạn phải xin phép cha mẹ hoặc người giám hộ.",
        description3: "Chúng tôi sử dụng cookie và các công nghệ khác trên trang web của chúng tôi. Một số là cần thiết, trong khi những cookie khác giúp chúng tôi cải thiện trang web này và trải nghiệm của bạn. Dữ liệu cá nhân có thể được xử lý (ví dụ: địa chỉ IP), ví dụ: để hiển thị quảng cáo và nội dung được cá nhân hóa hoặc đo lường quảng cáo và nội dung. Để biết thêm thông tin về cách chúng tôi sử dụng dữ liệu của bạn, vui lòng xem",
        privacy_link: "Chính sách bảo mật",
        settings_link: "Cài đặt",
        essential: "Cần thiết",
        external_media: "Phương tiện bên ngoài",
        accept_all: "Chấp nhận tất cả",
        save: "Lưu",
        individual: "Cài đặt quyền riêng tư cá nhân",
        cookie_details: "Chi tiết Cookie",
        privacy_policy: "Chính sách bảo mật",
        imprint: "Thông tin pháp lý"
      }
    },
    de: {
      nav: { 
        home: "Startseite", 
        about: "Über uns", 
        digitalTransformation: "Digitale Transformation", 
        aiAgent: "KI-Agent", 
        blog: "Blog", 
        resources: "Ressourcen", 
        contact: "Kontakt" 
      },
      language: { current: "Sprache:" },
      footer: { 
        description: "Führende digitale Transformationslösungen für vietnamesische Unternehmen.", 
        quickLinks: "Schnelle Links", 
        contact: "Kontakt", 
        location: "Ho-Chi-Minh-Stadt, Vietnam", 
        copyright: "© 2025 DigitizedBrains. Alle Rechte vorbehalten." 
      },
      chatbot: {
        title: "KI-Assistent",
        placeholder: "Geben Sie Ihre Nachricht ein...",
        send: "Senden"
      },
      cookie: {
        title: "Datenschutzeinstellungen",
        description1: "Wir nutzen Cookies auf unserer Website. Einige von ihnen sind essenziell, während andere uns helfen, diese Website und Ihre Erfahrung zu verbessern.",
        description2: "Wenn Sie unter 16 Jahre alt sind und Ihre Zustimmung zu freiwilligen Diensten geben möchten, müssen Sie Ihre Erziehungsberechtigten um Erlaubnis bitten.",
        description3: "Wir verwenden Cookies und andere Technologien auf unserer Website. Einige von ihnen sind essenziell, während andere uns helfen, diese Website und Ihre Erfahrung zu verbessern. Personenbezogene Daten können verarbeitet werden (z. B. IP-Adressen), z. B. für personalisierte Anzeigen und Inhalte oder Anzeigen- und Inhaltsmessung. Weitere Informationen über die Verwendung Ihrer Daten finden Sie in unserer",
        privacy_link: "Datenschutzerklärung",
        settings_link: "Einstellungen",
        essential: "Essenziell",
        external_media: "Externe Medien",
        accept_all: "Alle akzeptieren",
        save: "Speichern",
        individual: "Individuelle Datenschutzeinstellungen",
        cookie_details: "Cookie-Details",
        privacy_policy: "Datenschutzerklärung",
        imprint: "Impressum"
      }
    }
  };
  
  // Current language
  let currentLanguage = localStorage.getItem("preferredLanguage") || "vi";
  let currentTranslations = {};
  
  // Function to merge translations
  function mergeTranslations(pageTranslations) {
    const merged = {};
    for (const lang in commonTranslations) {
      merged[lang] = Object.assign({}, commonTranslations[lang], pageTranslations[lang] || {});
    }
    return merged;
  }
  
  // Function to update language display
  function updateLanguageDisplay() {
    const config = languageConfig[currentLanguage];
    
    // Update desktop language switcher
    const currentLangSpan = document.getElementById('current-lang');
    const currentFlag = document.getElementById('current-flag');
    const mobileLangSpan = document.getElementById('mobile-current-lang');
    const mobileFlag = document.getElementById('mobile-current-flag');
    
    if (currentLangSpan) currentLangSpan.textContent = config.code;
    if (currentFlag) {
      currentFlag.src = config.flag;
      currentFlag.alt = config.alt;
    }
    if (mobileLangSpan) mobileLangSpan.textContent = config.code;
    if (mobileFlag) {
      mobileFlag.src = config.flag;
      mobileFlag.alt = config.alt;
    }
    
    // Update active state for options
    document.querySelectorAll('.language-option, .language-option-mobile').forEach(option => {
      option.classList.remove('active');
      if (option.dataset.lang === currentLanguage) {
        option.classList.add('active');
      }
    });
  }
  
  // Function to translate content
  function translateContent(targetLanguage, translations) {
    const data = translations[targetLanguage];
    if (!data) {
      console.error('Language data not found for ' + targetLanguage + ', falling back to English');
      if (targetLanguage !== 'en') {
        translateContent('en', translations);
      }
      return;
    }

    // Add transition effect
    if (document.body) {
      document.body.classList.add('lang-transition', 'changing');
    }

    setTimeout(function() {
      try {
        // Update meta tags
        const htmlRoot = document.getElementById('html-root');
        const pageTitle = document.getElementById('page-title');
        const pageDescription = document.getElementById('page-description');
        
        if (htmlRoot) {
          htmlRoot.lang = targetLanguage === 'vi' ? 'vi' : targetLanguage === 'de' ? 'de' : 'en';
        }
        if (pageTitle && data.meta && data.meta.title) {
          pageTitle.textContent = data.meta.title;
        }
        if (pageDescription && data.meta && data.meta.description) {
          pageDescription.content = data.meta.description;
        }

        // Update all translatable elements
        document.querySelectorAll('[data-translate]').forEach(function(element) {
          const key = element.getAttribute('data-translate');
          const keys = key.split('.');
          let value = data;
          
          for (let i = 0; i < keys.length; i++) {
            value = value[keys[i]];
            if (!value) break;
          }
          
          if (value) {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
              element.placeholder = value;
            } else {
              element.textContent = value;
            }
          }
        });

        // Update placeholder attributes
        document.querySelectorAll('[data-translate-placeholder]').forEach(function(element) {
          const key = element.getAttribute('data-translate-placeholder');
          const keys = key.split('.');
          let value = data;
          
          for (let i = 0; i < keys.length; i++) {
            value = value[keys[i]];
            if (!value) break;
          }
          
          if (value) {
            element.placeholder = value;
          }
        });

        // Remove transition effect
        if (document.body) {
          document.body.classList.remove('changing');
        }
      } catch (error) {
        console.error('Error during content translation:', error);
        if (document.body) {
          document.body.classList.remove('changing');
        }
      }
    }, 150);

    setTimeout(function() {
      if (document.body) {
        document.body.classList.remove('lang-transition');
      }
    }, 450);
  }
  
  // Function to change language (global)
  function changeLanguageGlobal(newLanguage) {
    if (newLanguage === currentLanguage) return;
    
    currentLanguage = newLanguage;
    localStorage.setItem("preferredLanguage", newLanguage);
    
    updateLanguageDisplay();
    translateContent(newLanguage, currentTranslations);
    
    // Close dropdowns
    document.querySelectorAll('.language-menu, .language-menu-mobile').forEach(function(menu) {
      menu.classList.remove('show');
    });
    
    console.log("Language changed to:", newLanguage);
  }
  
  // Initialize multilingual system
  function initializeMultilingual(pageTranslations) {
    pageTranslations = pageTranslations || {};
    currentTranslations = mergeTranslations(pageTranslations);
    
    // Set up event listeners
    const languageBtn = document.getElementById('language-btn');
    const mobileLanguageBtn = document.getElementById('mobile-language-btn');
    
    if (languageBtn) {
      languageBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const menu = document.getElementById('language-menu');
        if (menu) menu.classList.toggle('show');
      });
    }

    if (mobileLanguageBtn) {
      mobileLanguageBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const menu = document.getElementById('mobile-language-menu');
        if (menu) menu.classList.toggle('show');
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
      document.querySelectorAll('.language-menu, .language-menu-mobile').forEach(function(menu) {
        menu.classList.remove('show');
      });
    });

    // Prevent dropdown from closing when clicking inside options
    document.querySelectorAll('.language-menu, .language-menu-mobile').forEach(function(menu) {
      menu.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', function() {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
          mobileMenu.classList.toggle('hidden');
        }
      });
    }

    // Validate and set current language
    const supportedLanguages = ['en', 'vi', 'de'];
    if (!supportedLanguages.includes(currentLanguage)) {
      console.warn('Unsupported language ' + currentLanguage + ', defaulting to Vietnamese');
      currentLanguage = 'vi';
      localStorage.setItem("preferredLanguage", 'vi');
    }
    
    // Initialize UI
    updateLanguageDisplay();
    translateContent(currentLanguage, currentTranslations);
    
    console.log("DigitizedBrains Multilingual System initialized");
    console.log("Current language:", currentLanguage);
  }
  
  // Export functions globally
  window.initializeMultilingual = initializeMultilingual;
  window.changeLanguage = changeLanguageGlobal;
  window.languageConfig = languageConfig;
  window.commonTranslations = commonTranslations;
  
  console.log("Multilingual system loaded successfully");
})();