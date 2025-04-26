import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../../../styles/Testimonials.css";
import { FaQuoteLeft } from "react-icons/fa";

const Testimonials = () => {
    //TODO Заменете фалшивите данни!!!
    const testimonials = [
        {
            name: "Иван Петров",
            role: "Бодибилдър",
            feedback: "Тази платформа напълно трансформира моя фитнес път. Персонализираните планове са невероятни!",
            image: "https://via.placeholder.com/100", // Заменете с реални URL адреси на изображения
        },
        {
            name: "Мария Георгиева",
            role: "Личен треньор",
            feedback: "Управлението на клиентите ми никога не е било по-лесно. Обичам функциите за обратна връзка в реално време и проследяване на напредъка.",
            image: "https://via.placeholder.com/100", // Заменете с реални URL адреси на изображения
        },
        {
            name: "Димитър Иванов",
            role: "Собственик на фитнес зала",
            feedback: "Функциите за групово обучение са революционни за нашите членове на фитнес залата. Горещо препоръчвам тази платформа!",
            image: "https://via.placeholder.com/100", // Заменете с реални URL адреси на изображения
        },
    ];

    return (
        <section className="testimonials-section bg-dark text-light py-5">
            <Container>
                <h2 className="text-center mb-5">What Our Users Say</h2>
                <Row className="justify-content-center">
                    {testimonials.map((testimonial, index) => (
                        <Col md={6} lg={4} key={index} className="mb-4">
                            <div className="testimonial-card p-4 text-center">
                                <FaQuoteLeft className="quote-icon mb-3" />
                                <p className="testimonial-feedback">{testimonial.feedback}</p>
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="testimonial-image rounded-circle my-3"
                                />
                                <h5 className="testimonial-name">{testimonial.name}</h5>
                                <p className="testimonial-role">{testimonial.role}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default Testimonials;
