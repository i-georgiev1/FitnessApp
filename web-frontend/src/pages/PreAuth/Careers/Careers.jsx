import '../../../styles/Careers.css';
import React from "react";
import { useTranslation } from "react-i18next";

function Careers() {
  const { t } = useTranslation();

  const careerOptions = [
    {
      icon: "🛠️",
      title: t("Platform Administrators"),
      description:
        t("Are you passionate about managing systems and ensuring everything runs smoothly? Join us today!"),
      buttonText: t("Join as Platform Admin"),
    },
    {
      icon: "🏋️",
      title: t("Coaches"),
      description:
        t("Do you have a passion for training and mentoring people? We need skilled English-speaking coaches worldwide."),
      buttonText: t("Join as a Coach"),
    },
  ];

  return (<>
    <div className="careers-container">
      <h1 className=" careers-title">{t("careers.title")}</h1>
      <p className="careers-subtitle">
        {t("careers.subtitle")}
      </p>
      <div className="careers-cards">
        {careerOptions.map((option, index) => (
          <div className="career-card" key={index}>
            <div className="career-icon">{option.icon}</div>
            <h3 className="career-title">{option.title}</h3>
            <p className="career-description">{option.description}</p>
            <button className="career-button">{option.buttonText}</button>
          </div>
        ))}
      </div>
    </div>
  </>);
}

export default Careers;
