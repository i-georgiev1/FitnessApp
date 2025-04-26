import React, { useState, useCallback, useEffect } from "react";
import "../../../styles/HomePopUp.css";
import { useTranslation } from "react-i18next";
import axiosInstance from '../../../config/axios';
import { API_ENDPOINTS } from '../../../config/api';

const PopUp = ({ onClose }) => {
    const { t } = useTranslation();
    const [isClosing, setIsClosing] = useState(false);
    const [isEntering, setIsEntering] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const [submitStatus, setSubmitStatus] = useState({
        message: '',
        isError: false
    });

    useEffect(() => {
        requestAnimationFrame(() => {
            setIsEntering(true);
        });
    }, []);

    const closePopUp = useCallback(() => {
        setIsEntering(false);
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 500);
    }, [onClose]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.subscribe, formData);

            setSubmitStatus({
                message: t('Successfully subscribed'),
                isError: false
            });
            setFormData({ name: '', email: '' });
            setTimeout(closePopUp, 2000);
        } catch (error) {
            setSubmitStatus({
                message: error.response?.data?.message || t('Subscription failed'),
                isError: true
            });
        }
    };

    return (
        <div className={`popup-overlay ${isEntering ? 'entering' : ''} ${isClosing ? 'closing' : ''}`}>
            <div className="popup-container">
                <button className="close-btn" onClick={closePopUp}>
                    &times;
                </button>
                <h2 className="popup-heading">{t("Grand Opening")}</h2>
                <p className="popup-date">{t("We are opening on:")} <strong>{t("opening.date")}</strong></p>

                <form className="enroll-form" onSubmit={handleSubmit}>
                    <h3>{t("Enroll Now")}</h3>
                    {submitStatus.message && (
                        <div className={`alert ${submitStatus.isError ? 'alert-danger' : 'alert-success'}`}>
                            {submitStatus.message}
                        </div>
                    )}
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={t("Your Name")}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t("Your Email")}
                        required
                    />
                    <button type="submit">{t("Submit")}</button>
                </form>

                <div className="social-buttons">
                    <a href="https://facebook.com/profile.php?id=61571935943086" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://instagram.com/train_sync" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://www.tiktok.com/@trainsync" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-tiktok"></i>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PopUp;
