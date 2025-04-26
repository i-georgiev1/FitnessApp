import React from 'react';
import SubscriptionPlans from './SubscriptionPlans.jsx';
import FAQs from './FAQs';
import ThisPageHead from '../../../components/Header.jsx';
import { useTranslation } from 'react-i18next';
import "../../../styles/PrisingPage.css"

function PricingPage() {
    const { t } = useTranslation();

    return (<>
        <ThisPageHead title="TrainSync - Pricing" />
        <div >
            {/* Header Section */}
            <div className="card-2 text-center py-2">
                <h1>{t('Choose the Right Plan for You')}</h1>
                <p>{t('Our pricing plans are designed to fit your needs. Explore them below and get started!')}</p>
            </div>

            {/* Subscription Plans Section */}
            <SubscriptionPlans />

            <div className="mb-5">
                <FAQs />
            </div>
        </div>
    </>);
}

export default PricingPage;
