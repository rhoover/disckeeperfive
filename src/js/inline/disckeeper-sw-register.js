(() => {
  'use strict';
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/disckeeper-service-worker-min.js');
    });
  };
})();