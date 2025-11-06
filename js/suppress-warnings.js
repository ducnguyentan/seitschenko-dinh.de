// DigitizedBrains - Source Map Warning Suppressor
// Comprehensive solution to suppress all source map related warnings and errors

(function() {
  'use strict';

  // List of keywords to suppress
  const suppressKeywords = [
    'source map',
    'sourcemap',
    'Could not read source map',
    'marked',
    'dompurify',
    'ENOENT',
    'no such file or directory',
    '.map',
    'marked.esm.js.map',
    'purify.es.js.map',
    'node_modules/.pnpm/',
    '@12.0.0',
    '@3.0.3'
  ];

  // Function to check if message should be suppressed
  function shouldSuppress(message) {
    if (typeof message !== 'string') return false;
    return suppressKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Override console.warn
  if (typeof console !== 'undefined' && console.warn) {
    const originalWarn = console.warn;
    console.warn = function(...args) {
      // Check first argument (main message)
      if (args.length > 0 && shouldSuppress(String(args[0]))) {
        return; // Suppress this warning
      }
      // Check all arguments for source map keywords
      const allArgs = args.join(' ');
      if (shouldSuppress(allArgs)) {
        return; // Suppress this warning
      }
      originalWarn.apply(console, args);
    };
  }

  // Override console.error
  if (typeof console !== 'undefined' && console.error) {
    const originalError = console.error;
    console.error = function(...args) {
      // Check first argument (main message)
      if (args.length > 0 && shouldSuppress(String(args[0]))) {
        return; // Suppress this error
      }
      // Check all arguments for source map keywords
      const allArgs = args.join(' ');
      if (shouldSuppress(allArgs)) {
        return; // Suppress this error
      }
      originalError.apply(console, args);
    };
  }

  // Override console.log (in case some warnings come through log)
  if (typeof console !== 'undefined' && console.log) {
    const originalLog = console.log;
    console.log = function(...args) {
      // Check first argument (main message)
      if (args.length > 0 && shouldSuppress(String(args[0]))) {
        return; // Suppress this log
      }
      // Check all arguments for source map keywords
      const allArgs = args.join(' ');
      if (shouldSuppress(allArgs)) {
        return; // Suppress this log
      }
      originalLog.apply(console, args);
    };
  }

  // Global error handler for uncaught errors
  window.addEventListener('error', function(event) {
    if (event.error && shouldSuppress(String(event.error.message))) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    if (event.message && shouldSuppress(event.message)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    if (event.filename && shouldSuppress(event.filename)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  // Global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && shouldSuppress(String(event.reason))) {
      event.preventDefault();
      return false;
    }
  }, true);

  // Override fetch to prevent source map requests
  if (typeof window.fetch !== 'undefined') {
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      // Convert URL to string to check
      const urlString = String(url);
      
      // Block source map requests
      if (urlString.includes('.map') && 
          (urlString.includes('marked') || 
           urlString.includes('dompurify') ||
           urlString.includes('node_modules'))) {
        // Return a rejected promise that gets silently handled
        return Promise.reject(new Error('Source map request blocked'));
      }
      
      return originalFetch.apply(this, arguments);
    };
  }

  // Block XMLHttpRequest for source maps
  if (typeof window.XMLHttpRequest !== 'undefined') {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      const urlString = String(url);
      
      // Block source map requests
      if (urlString.includes('.map') && 
          (urlString.includes('marked') || 
           urlString.includes('dompurify') ||
           urlString.includes('node_modules'))) {
        // Don't make the request
        return;
      }
      
      return originalOpen.apply(this, [method, url, ...args]);
    };
  }

  // Debug: Log that suppressor is active
  console.log('%c🔇 Source Map Warning Suppressor Active', 
    'color: #10b981; font-weight: bold; background: #f0fdf4; padding: 2px 8px; border-radius: 4px;');

})();