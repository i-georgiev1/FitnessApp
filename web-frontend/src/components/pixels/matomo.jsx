import React, { useEffect } from 'react';

const MatomoTracker = () => {
  useEffect(() => {
    const _paq = (window._paq = window._paq || []);
    /* Tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);

    const matomoUrl = "//matomo.train-sync.com/";
    _paq.push(['setTrackerUrl', matomoUrl + 'matomo.php']);
    _paq.push(['setSiteId', '1']);

    const scriptElement = document.createElement('script');
    scriptElement.async = true;
    scriptElement.src = matomoUrl + 'matomo.js';

    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(scriptElement, firstScript);

    return () => {
      // Cleanup if necessary (e.g., remove the script)
      if (scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, []);

  return null; // This component doesn't render any UI
};

export default MatomoTracker;
