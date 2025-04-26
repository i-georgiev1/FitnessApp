import React from 'react';
import '../../../styles/ContactPage.css';
import FAQs from './FAQs';
import ThisPageHead from '../../../components/Header.jsx';
import { useTranslation } from 'react-i18next';
import SupportForm from './SupportForm';

const ContactPage = () => {
    const { t } = useTranslation();

    return (
        <>
            <ThisPageHead title="TrainSync - Contact Us" />
            <section className="contact-page-section">
                <div className="container">
                    <div className="sec-title">
                        <h2>{t("Let's Get in Touch.")}</h2>
                    </div>
                    <div className="inner-container">
                        <SupportForm />
                    </div>
                </div>
                <FAQs />
            </section>
        </>
    );
};

export default ContactPage;