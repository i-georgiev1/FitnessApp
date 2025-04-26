import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Container, Row, Col } from "react-bootstrap";
import { FaUser, FaChalkboardTeacher, FaUsers } from "react-icons/fa";
import '../../../styles/FeaturesPage.css';
import ThisPageHead from '../../../components/Header.jsx';

const FeaturesPage = () => {
    const features = [
        {
            title: "For Individuals",
            description: "",
            link: "/features/individuals",
            icon: <FaUser className="feature-icon" />
        },
        {
            title: "For Coaches",
            description: "",
            link: "/features/coaches",
            icon: <FaChalkboardTeacher className="feature-icon" />
        },
        {
            title: "Shared Features",
            description: "",
            link: "/features/shared",
            icon: <FaUsers className="feature-icon" />
        }
    ];

    // State to track active card
    const [activeCard, setActiveCard] = useState(0);

    // Handle key press events
    const handleKeyDown = (event) => {
        if (event.key === "ArrowRight") {
            setActiveCard((prev) => (prev + 1) % features.length); // move right
        } else if (event.key === "ArrowLeft") {
            setActiveCard((prev) => (prev - 1 + features.length) % features.length); // move left
        }
    };

    // Add keydown event listener when the component is mounted
    React.useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (<>
        <ThisPageHead title="TrainSync - Features" />
        <Container className="features-container">
            <h1 className="text-center mb-5">Features</h1>
            <Row className="justify-content-center">
                <Col md={8} lg={12} className="d-flex justify-content-center flex-wrap">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className={`feature-card mb-4 ${index === activeCard ? "active" : ""}`}
                        >
                            <Card.Body>
                                {feature.icon}
                                <Card.Title>{feature.title}</Card.Title>
                                <Card.Text>{feature.description}</Card.Text>
                                <Link to={feature.link} className="btn btn-primary">Learn More</Link>
                            </Card.Body>
                        </Card>
                    ))}
                </Col>
            </Row>
        </Container>
    </>);
};

export default FeaturesPage;
