import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import heroimage from "../../../assets/mobile-app-hero-img.png";
import { MobileButton } from "./MobileApp.jsx";
import { useTranslation } from 'react-i18next';
import '../../../styles/HeroSection.css';

const HeroSection = ({ scrollToFeatures }) => {
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    const element = document.querySelector(".fade-in-right");
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        setIsVisible(true);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="hero-section bg-dark text-light relative">
      <div className="container relative z-10">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="display-4">{t('Transform Your Fitness Journey')}</h1>
            <p className="lead">
              {t('Personalized coaching, real-time feedback, and progress tracking at your fingertips.')}
            </p>
            <a href="/signup" className="btn btn-primary me-2">
              {t('Get Started')}
            </a>
            <button onClick={scrollToFeatures} className="btn btn-outline-light">
              {t('Learn More')}
            </button>
            <MobileButton />
            {/* <TrustpilotWidget /> */}
          </div>
          <div
            className={`fade-in-right col-lg-6 ${isVisible ? "active" : ""}`}
          >
            <img
              src={heroimage}
              className="img-fluid"
              alt="Hero Illustration"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

