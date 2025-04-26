import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Container, Row, Col } from "react-bootstrap";
import { FaUser, FaChalkboardTeacher, FaUsers } from "react-icons/fa";
import '../../../styles/HomeFeatures.css';
import { useTranslation } from 'react-i18next';

const FeaturesOverview = () => {
    const { t } = useTranslation();
    const features = [
        {
            title: t("For Individuals"),
            description: t("Personalized coaching, progress tracking, and real-time feedback tailored for your fitness goals."),
            link: "/features/individuals",
            icon: <FaUser className="feature-icon" />,
        },
        {
            title: t("For Coaches"),
            description: t("Manage clients, create training plans, and gain insights with tools designed for coaches."),
            link: "/features/coaches",
            icon: <FaChalkboardTeacher className="feature-icon" />,
        },
        {
            title: t("Shared Features"),
            description: t("Real-time chat, media sharing, and secure payment integration for all users."),
            link: "/features/shared",
            icon: <FaUsers className="feature-icon" />,
        },
    ];

    const [activeCard, setActiveCard] = useState(0);

    const handleKeyDown = (event) => {
        if (event.key === "ArrowRight") {
            setActiveCard((prev) => (prev + 1) % features.length);
        } else if (event.key === "ArrowLeft") {
            setActiveCard((prev) => (prev - 1 + features.length) % features.length);
        }
    };

    const handleLinkClick = (event, link) => {
        event.preventDefault();
        window.location.href = link;
    };

    React.useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <section id="features-overview" className="features-overview py-5">
            <Container>
                <h2 className="text-center mb-4">{t("Features Overview")}</h2>
                <Row className="justify-content-center">
                    <Col md={8} lg={12} className="d-flex justify-content-center flex-wrap">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className={`feature-card mb-4 ${index === activeCard ? "active" : ""}`}
                                style={{ width: '350px' }} // Increase card size
                            >
                                <Card.Body className="d-flex flex-column">
                                    {feature.icon}
                                    <Card.Title>{feature.title}</Card.Title>
                                    <Card.Text className="text-dark flex-grow-1">{feature.description}</Card.Text>
                                    <Link
                                        to={feature.link}
                                        className="btn btn-primary mt-auto"
                                        onClick={(event) => handleLinkClick(event, feature.link)}
                                    >
                                        {t("Learn More")}
                                    </Link>
                                </Card.Body>
                            </Card>
                        ))}
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default FeaturesOverview;
