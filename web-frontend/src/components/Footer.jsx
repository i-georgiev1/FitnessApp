import "../styles/Footer.css";
import GoogleTagManager from "./pixels/google.jsx";
import MatomoTracker from "./pixels/matomo.jsx";
import {
    GooglePlayButton,
    AppGalleryButton,
    ButtonsContainer,
    AppStoreButton,
} from "react-mobile-app-button";
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    var app_btn_width = window.innerWidth;
    var direction = "row";
    var gap = 10;

    if (app_btn_width <= 999) {
        direction = "column";
        gap = 50;
    }

    const APKUrl = "https://play.google.com/store/apps/details?id=host";
    const IOSUrl = "https://apps.apple.com/us/app/expo-go/id982107779";

    return (
        <>
            <footer className="footer">
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ButtonsContainer gap={gap} direction={direction} className="buttons-container" style={{ display: 'flex', alignItems: 'center' }}>
                        <GooglePlayButton
                            url={APKUrl}
                            theme={"dark"}
                            className={"custom-style"}
                        />
                        <AppGalleryButton
                            url={"#hero"}
                            theme={"dark"}
                            className={"custom-style"}
                        />
                        <AppStoreButton
                            url={IOSUrl}
                            theme={"dark"}
                            className={"custom-style"}
                        />
                    </ButtonsContainer>
                    <h3 className="sub">{t('Subscribe to our Newsletter')}</h3>
                </div>
                <div className="container">
                    <div className="footer-columns">
                        <div className="column">
                            <h4>{t('Company')}</h4>
                            <ul className="footer-links">
                                <li><a href="/about">{t('About')}</a></li>
                                <li><a href="/features">{t('Features')}</a></li>
                                <li><a href="/pricing">{t('Pricing')}</a></li>
                            </ul>
                        </div>
                        <div className="column">
                            <h4>{t('Help')}</h4>
                            <ul className="footer-links">
                                <li><a href="/#">{t('Customer Support')}</a></li>
                                <li><a href="/terms">{t('Terms & Conditions')}</a></li>
                                <li><a href="/privacy">{t('Privacy Policy')}</a></li>
                            </ul>
                        </div>
                        <div className="column">
                            <h4>{t('Resources')}</h4>
                            <ul className="footer-links">
                                <li><a href="/resources/tips">{t('Fitness Tips')}</a></li>
                                <li><a href="/resources/coaches">{t('Guide for Coaches')}</a></li>
                                <li><a href="/resources/updates">{t('News')}</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-subscribe">
                        <h3 className="sub-mobile">{t('Subscribe to our Newsletter')}</h3>
                        <form>
                            <input type="email" placeholder={t('Enter your email')} />
                            <button>{t('Subscribe')}</button>
                        </form>
                        <div className="footer-contact">
                            <div>

                            </div>
                            <div>
                                <h4>{t('Email us')}</h4>
                                <p><a href="mailto:office@train-sync.com">office@train-sync.com</a></p>
                                <p><a href="mailto:support@train-sync.com">support@train-sync.com</a></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="divider"></div> {/* Add a line between the containers */}
                <div className="bottom-container">
                    <p>© 2025 Train Sync. {t("All rights reserved.")}</p>
                    <div className="social-buttons">
                        <a href="https://www.facebook.com/profile.php?id=61571935943086" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://www.instagram.com/train_sync" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="https://www.tiktok.com/@trainsync" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-tiktok"></i>
                        </a>
                    </div>
                </div>
            </footer>

            <GoogleTagManager />
            <MatomoTracker />
        </>
    );
};

export default Footer;
