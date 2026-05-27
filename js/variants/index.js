'use strict';
// Auto-loader: dynamically loads all variant plugin scripts.
// Include this single file after core engine scripts to load all plugins.
(function() {
  const base = document.currentScript.src.replace(/index\.js.*/, '');
  const plugins = [
    'torpedo.js',
    'single-check.js',
    'los-alamos.js',
  ];
  plugins.forEach(file => {
    const script = document.createElement('script');
    script.src = base + file;
    document.head.appendChild(script);
  });
})();
