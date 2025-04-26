import React, { useState } from 'react';
import '../../../styles/ContactPage.css';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../../config/axios';
import { API_ENDPOINTS } from '../../../config/api';

const SupportForm = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        setErrorMessage('');

        try {
            const response = await axiosInstance.post(API_ENDPOINTS.contact.sendMessage, {
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message
            });

            // Check response status
            if (response.data.status === 'success') {
                setSubmitStatus('success');
                // Clear form data on success
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
            } else if (response.data.status === 'partial_success') {
                // Handle partial success (auto-reply sent but support email failed)
                setSubmitStatus('partial_success');
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
            } else {
                // Handle other statuses
                setSubmitStatus('error');
                setErrorMessage(response.data.message || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setSubmitStatus('error');

            // Extract error message from response if available
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Failed to send message. Please try again later.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="row clearfix">
            <div className="form-column col-md-8 col-sm-12 col-xs-12">
                <div className="inner-column">
                    <div className="contact-form">
                        <form onSubmit={handleSubmit} id="contact-form">
                            <div className="row clearfix">
                                <div className="form-group col-md-6 col-sm-6 co-xs-12">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={t("Name")}
                                        required
                                    />
                                </div>
                                <div className="form-group col-md-6 col-sm-6 co-xs-12">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder={t("Email")}
                                        required
                                    />
                                </div>
                                <div className="form-group col-md-12 col-sm-6 co-xs-12">
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder={t("Subject")}
                                        required
                                    />
                                </div>
                                <div className="form-group col-md-12 col-sm-12 co-xs-12">
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder={t("Message")}
                                        required
                                    ></textarea>
                                </div>
                                <div className="form-group col-md-12 col-sm-12 co-xs-12">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? t("Sending...") : t("Send Now")}
                                    </button>

                                    {submitStatus === 'success' && (
                                        <div className="alert alert-success mt-3">
                                            {t("Message sent successfully!")}
                                        </div>
                                    )}

                                    {submitStatus === 'partial_success' && (
                                        <div className="alert alert-warning mt-3">
                                            {t("Your message was received. We'll respond as soon as possible.")}
                                        </div>
                                    )}

                                    {submitStatus === 'error' && (
                                        <div className="alert alert-danger mt-3">
                                            {errorMessage || t("Failed to send message. Please try again.")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="info-column col-md-4 col-sm-12 col-xs-12">
                <div className="inner-column">
                    <h2>{t("Contact Info")}</h2>
                    <ul className="list-info">
                        <li><i className="fas fa-globe"></i>{t("Bulgaria")}</li>
                        <li><i className="far fa-envelope"></i>{t("office@train-sync.com")}</li>
                        <li><i className="far fa-envelope"></i>{t("support@train-sync.com")}</li>
                    </ul>
                    <ul className="social-icon-four">
                        <li className="follow">{t("Follow us on: ")}</li>
                        <li><a href="https://www.facebook.com/profile.php?id=61571935943086"><i className="fab fa-facebook-f"></i></a></li>
                        <li><a href="https://www.instagram.com/train_sync"><i className="fab fa-instagram"></i></a></li>
                        <li><a href="https://www.tiktok.com/@trainsync"><i className="fab fa-tiktok"></i></a></li>
                        <li><a href="#"><i className="fab fa-linkedin"></i></a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SupportForm;