(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    window.StarMemory?.init();
    window.StarAnomaly?.init();
    window.StarVisuals?.init();
    window.StarTerminal?.init();

    const breachButton = document.getElementById('breachButton');
    breachButton?.addEventListener('click', () => {
      window.StarTerminal?.breach();
    });

    console.log('%cSTARORIGIN // ORACLE', 'color:#4dffce;font-family:monospace;font-size:18px');
    console.log('%cStatic ritual active. No backend. No witnesses.', 'color:#8c5cff;font-family:monospace');
  });
})();
