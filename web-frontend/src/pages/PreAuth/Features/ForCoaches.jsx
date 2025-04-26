import React from "react";
import CardItem from './FeatureCard';
import '../../../styles/FeatureCard.css';
import ThisPageHead from '../../../components/Header.jsx';
import { useTranslation } from 'react-i18next';

const ForCoaches = () => {
    const { t } = useTranslation();

    return (<>
        <ThisPageHead title="TrainSync - Features For Coaches" />
        <div className="services-area container mt-5">
            <div className="wrapper">
                <div className="section-header">
                    <h1>{t('Features For Coaches')}</h1>
                </div>
                <div className="items">
                    <CardItem
                        iconClass="fas fa-tachometer-alt"
                        title={t('Dashboard')}
                        description={t('Monitor and manage key metrics at a glance with a centralized and intuitive dashboard.')}
                    />
                    <CardItem
                        iconClass="fas fa-tasks"
                        title={t('Training Plan Management')}
                        description={t('Organize, assign, and track personalized training plans to help individuals or teams succeed.')}
                    />
                    <CardItem
                        iconClass="fas fa-users"
                        title={t('Group Management')}
                        description={t('Efficiently manage groups, track their progress, and foster collaborative interactions.')}
                    />
                    <CardItem
                        iconClass="fas fa-file-alt"
                        title={t('Feedback & Reports')}
                        description={t('Generate detailed reports and provide constructive feedback to support growth and improvement.')}
                    />
                </div>
            </div>
        </div>
        <br />
        <br />
    </>);
};

export default ForCoaches;
