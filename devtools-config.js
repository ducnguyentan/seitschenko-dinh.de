// DevTools Configuration to suppress source map warnings
// This file helps configure development environment settings

// Disable source map loading in development
if (typeof window !== 'undefined' && window.location) {
  // Override source map URL resolution
  const originalSourceMapURL = window.sourceMapURL;
  if (originalSourceMapURL) {
    window.sourceMapURL = function() {
      return null; // Disable source map loading
    };
  }
}

// Configure DevTools console filtering
if (typeof console !== 'undefined') {
  console.info('DevTools: Source map warnings can be filtered in Console settings');
  console.info('To hide these warnings: DevTools > Console > Settings > Hide network messages');
}

export default {
  sourceMaps: false,
  devtool: false
};