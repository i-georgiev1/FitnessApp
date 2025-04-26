import React from 'react';
import { Accordion } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function FAQs() {
    const { t } = useTranslation();

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">{t('Frequently Asked Questions')}</h2>
            <Accordion defaultActiveKey="null">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>{t('How to buy subscription plan?')}</Accordion.Header>
                    <Accordion.Body>
                        {t('When you make a registration in the platform, the BUY SUBSCRIPTION button will be waiting for you in your dashboard.')}
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                    <Accordion.Header>{t('Question 2?')}</Accordion.Header>
                    <Accordion.Body>
                        {t('Answer')}
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                    <Accordion.Header>{t('Question 3?')}</Accordion.Header>
                    <Accordion.Body>
                        {t('Answer')}
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="3">
                    <Accordion.Header>{t('Question 4?')}</Accordion.Header>
                    <Accordion.Body>
                        {t('Answer')}
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="4">
                    <Accordion.Header>{t('Question 5?')}</Accordion.Header>
                    <Accordion.Body>
                        {t('Answer')}
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}

export default FAQs;
