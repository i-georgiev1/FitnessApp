import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaClock, FaHandshake, FaShieldAlt, FaCogs } from "react-icons/fa";
import '../../../styles/WhyChooseUs.css';
import { useTranslation } from 'react-i18next';

const WhyChooseUs = () => {
    const { t } = useTranslation();
    const reasons = [
        {
            title: t("Time-Saving"),
            icon: <FaClock className="why-icon" />,
            description: t("Streamline your fitness routine with personalized training plans and real-time feedback."),
        },
        {
            title: t("Expert Coaching"),
            icon: <FaHandshake className="why-icon" />,
            description: t("Connect with expert coaches who provide tailored guidance and motivation every step of the way."),
        },
        {
            title: t("Secure & Reliable"),
            icon: <FaShieldAlt className="why-icon" />,
            description: t("Your data is safe with us. We use industry-leading security protocols to protect your privacy."),
        },
        {
            title: t("Customizable Plans"),
            icon: <FaCogs className="why-icon" />,
            description: t("Create or modify training plans to fit your goals, whether you're an individual or a coach."),
        },
    ];

    return (
        <section className="why-choose-us py-5 bg-dark">
            <Container>
                <h2 className="text-center mb-4 text-light">{t("Why Choose Us?")}</h2>
                <Row className="justify-content-center">
                    {reasons.map((reason, index) => (
                        <Col md={6} lg={3} key={index} className="mb-4">
                            <Card className="why-card bg-dark">
                                <Card.Body className="text-center d-flex flex-column justify-content-between">
                                    <div className="why-icon-wrapper">
                                        {reason.icon}
                                    </div>
                                    <Card.Title>{reason.title}</Card.Title>
                                    <Card.Text className="flex-grow-1">{reason.description}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <div className="text-center mt-4">
                    <Button variant="primary" size="lg" href="/signup">{t("Get Started")}</Button>
                </div>
            </Container>
        </section>
    );
};

export default WhyChooseUs;
