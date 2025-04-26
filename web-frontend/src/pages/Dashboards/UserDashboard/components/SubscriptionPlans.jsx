import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';


function SubscriptionPlans() {
    const { i18n } = useTranslation();

    const getPricingTableId = () => {
        return i18n.language === 'bg'
            ? 'prctbl_1RAlUi2c1f60L2yDD8kiZge0'
            : 'prctbl_1RAlUi2c1f60L2yDD8kiZge0';
    };

    useEffect(() => {
        // Load Stripe Pricing Table script
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/pricing-table.js';
        script.async = true;
        document.body.appendChild(script);

        // Cleanup
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    
    return (
        <div className="container mt-5 mb-5">
            <stripe-pricing-table
                pricing-table-id={getPricingTableId()}
                publishable-key={import.meta.env.VITE_PK_LIVE_STRIPE}>
            </stripe-pricing-table>
        </div>
    );
}

export default SubscriptionPlans;
