import React, { useEffect } from 'react';
import '../../../styles/SubscriptionPlans.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

function PricingPlanCard({ planName, price, planDescription, features, buttonText }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }, []);

    const handleGetStarted = () => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard?openSubscription=true');
        } else {
            navigate('/signup');
        }
    };

    return (
        <div className="card shadow-sm d-flex flex-column h-100 hover-effect">
            <div className="card-body d-flex flex-column flex-grow-1">
                <h5 className="card-title">{t(planName)}</h5>
                <h1 className="card-subtitle ">{t(price)}</h1>
                <h4 className="price-description">{t(planDescription)}</h4>
                <ul className="list-unstyled" style={{ borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                    {features.map((feature, index) => (
                        <li key={index} className="mb-2" style={{ borderBottom: '1px solid #ccc' }}>
                            <h5>
                                {t(feature.title)}
                            </h5>
                            <p>
                                {t(feature.description)}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="card-footer mt-auto">
                <button onClick={handleGetStarted} className="btn btn-primary w-100">
                    {t(buttonText)}
                </button>
            </div>
        </div >
    );
}

function SubscriptionPlans() {
    const { t } = useTranslation();

    return (
        <div className="container mt-5 mb-5">
            <div className="row d-flex justify-content-center">
                {/* Basic Plan */}
                <div className="col-md-4 mb-4 hover-effect">
                    <PricingPlanCard
                        planName="first.plan"
                        price="€499"
                        planDescription="Our Core Starter plan is perfect for begginers who want to build a strong foundation and develop healthy habits."
                        features={[
                            {
                                title: "Personalized Training Plan"
                            },
                            {
                                title: "Personalized Meal Plan"
                            },
                            {
                                title: "Progress Tracking"
                            },
                            {
                                title: "Weekly Live Coaching Sessions"
                            }
                        ]}

                        buttonText="Get Started"
                    />
                </div>

                {/* Premium Plan */}
                <div className="col-md-4 mb-4 hover-effect">
                    <PricingPlanCard
                        planName="second.plan"
                        price="€749"
                        planDescription="The Active Balance plan is designed for individuals who want a more advanced program to meet their evolving needs."
                        features={[
                            {
                                title: "Advanced Training Plan Personalization"
                            },
                            {
                                title: "Personalized Meal Plan"
                            },
                            {
                                title: "Progress Tracking"
                            },
                            {
                                title: "Live Coaching Sessions every 3 days"
                            },
                            {
                                title: "Progress Analytics"
                            }
                        ]}
                        buttonText="Get Started"
                    />
                </div>

                {/* Ultimate Plan */}
                <div className="col-md-4 mb-4 hover-effect">
                    <PricingPlanCard
                        planName="third.plan"
                        price="€979"
                        planDescription="Out Peak Performance Plan is the gold standard for achieving elite-level results. This Plan is for those who won't settle for anything less then their best."
                        features={[
                            {
                                title: "Advanced Training Plan Personalization"
                            },
                            {
                                title: "Advanced Meal Plan Personalization"
                            },
                            {
                                title: "Advanced Progress Tracking"
                            },
                            {
                                title: "Daily Live Coaching Sessions"
                            },
                            {
                                title: "Enhanced Progress Analytics"
                            },
                            {
                                title: "Community Access"
                            },
                            {
                                title: "Exclusive Content"
                            },
                            {
                                title: "Priority Support"
                            }
                        ]}
                        buttonText="Get Started"
                    />
                </div>
            </div>
        </div>
    );
}

export default SubscriptionPlans;