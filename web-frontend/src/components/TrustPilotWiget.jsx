import React, { useEffect } from "react";

const TrustpilotWidget = () => {
  useEffect(() => {
    // Dynamically load Trustpilot script
    const script = document.createElement("script");
    script.src = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="trustpilot-widget">
      <div
        className="trustpilot-widget"
        data-locale="en-US" // Adjust locale if needed
        data-template-id="677d6738708ec05e88169812" // Replace with your template ID
        data-businessunit-id="YOUR_BUSINESS_UNIT_ID" // Replace with your Business Unit ID
        data-style-height="150px"
        data-style-width="100%"
        data-theme="light"
      >
        <a href="https://www.trustpilot.com/review/YOUR_BUSINESS_URL" target="_blank" rel="noopener noreferrer">
          Check out our reviews on Trustpilot
        </a>
      </div>
    </div>
  );
};

export default TrustpilotWidget;
