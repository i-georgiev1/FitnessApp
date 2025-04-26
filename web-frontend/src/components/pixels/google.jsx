import { useEffect } from 'react';

const GoogleTagManager = () => {
  useEffect(() => {
    // Dynamically add the gtag.js script
    const script = document.createElement('script');
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-6SDMWS8QK2";
    script.async = true;
    document.head.appendChild(script);

    // Add the gtag configuration script
    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-6SDMWS8QK2');

       gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      regions: [/* Add list of ISO 3166-2 region codes here */],
      });

    // Set default consent for all other regions based on your requirements
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
    `;
    document.head.appendChild(inlineScript);

    // Clean up scripts if needed (optional, depending on your routing strategy)
    return () => {
      document.head.removeChild(script);
      document.head.removeChild(inlineScript);
    };
  }, []);

  

  return null; // This component doesn't render anything
};

export default GoogleTagManager;
