import React from "react";
import CardItem from './FeatureCard';
import '../../../styles/FeatureCard.css';
import ThisPageHead from '../../../components/Header.jsx';
import { useTranslation } from 'react-i18next';

const SharedFeatures = () => {
    const { t } = useTranslation();

    return (<>
        <ThisPageHead title="TrainSync - Shared Features" />
        <div className="services-area container mt-5">
            <div className="wrapper">
                <div class="section-header">
                    <h1>{t('Shared Features')}</h1>
                </div>
                <div className="items">
                    <CardItem
                        iconClass="fas fa-comments"
                        title={t('Chat System')}
                        description={t('Facilitate seamless communication with a real-time messaging platform for better collaboration.')}
                    />
                    <CardItem
                        iconClass="fas fa-photo-video"
                        title={t('Media Sharing')}
                        description={t('Share images, videos, and documents effortlessly to enhance engagement and collaboration.')}
                    />
                    <CardItem
                        iconClass="fas fa-credit-card"
                        title={t('Payments')}
                        description={t('Manage transactions securely and efficiently with integrated payment processing features.')}
                    />
                </div>
            </div>
        </div>
        <br />
        <br />
    </>);
};

export default SharedFeatures;
