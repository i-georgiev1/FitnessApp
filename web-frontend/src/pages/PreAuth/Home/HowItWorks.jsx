import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../../../styles/HowItWorks.css";
import { FaUserPlus, FaClipboardList, FaChartLine } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
    const { t } = useTranslation();

    const steps = [
        {
            icon: <FaUserPlus className="step-icon" />,
            title: t("Sign Up"),
            description: t("Create your account and set your fitness goals to get started."),
        },
        {
            icon: <FaClipboardList className="step-icon" />,
            title: t("Choose a Plan"),
            description: t("Select or customize a training plan that fits your needs."),
        },
        {
            icon: <FaChartLine className="step-icon" />,
            title: t("Track Progress"),
            description: t("Monitor your progress and stay connected with your coach."),
        },
    ];

    return (
        <section className="how-it-works bg-light py-5">
            <Container>
                <h2 className="text-center mb-4">{t("How It Works")}</h2>
                <Row className="justify-content-center">
                    {steps.map((step, index) => (
                        <Col md={4} key={index} className="text-center mb-4">
                            <div className="step-card">
                                {step.icon}
                                <h3 className="step-title">{step.title}</h3>
                                <p className="step-description">{step.description}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default HowItWorks;
