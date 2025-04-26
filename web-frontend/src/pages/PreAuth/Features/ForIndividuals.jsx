import React from "react";
import CardItem from './FeatureCard';
import '../../../styles/FeatureCard.css';
import ThisPageHead from '../../../components/Header.jsx';
import { useTranslation } from 'react-i18next';

const ForIndividuals = () => {
    const { t } = useTranslation();

    return (<>
        <ThisPageHead title="TrainSync - Features For Individuals" />
        <div className="services-area container mt-5">
            <div className="wrapper">
                <div className="section-header">
                    <h1>{t('Features For Individuals')}</h1>
                </div>
                <div className="items">
                    <CardItem
                        iconClass="fas fa-user-plus"
                        title={t('Onboarding')}
                        description={t('Seamlessly guide new users or team members through the setup process with intuitive steps.')}
                    />
                    <CardItem
                        iconClass="fas fa-dumbbell"
                        title={t('Training Plans')}
                        description={t('Provide structured and customized plans to help achieve personal or team goals.')}
                    />
                    <CardItem
                        iconClass="fas fa-comments"
                        title={t('Live Feedback')}
                        description={t('Enable real-time communication and constructive feedback to enhance performance.')}
                    />
                    <CardItem
                        iconClass="fas fa-chart-line"
                        title={t('Analytics & Insights')}
                        description={t('Access detailed metrics and insights to track progress and inform decision-making.')}
                    />
                    <CardItem
                        iconClass="fas fa-bell"
                        title={t('Notifications')}
                        description={t('Stay updated with timely alerts and reminders for important events or updates.')}
                    />

                </div>
            </div>
        </div>
        <br />
        <br />
    </>);
};

export default ForIndividuals;
