import React, { useState } from "react";
import "../../../styles/HomePartners.css";
import csocLogo from "../../../assets/partners/csoc.png";
import BLifeForULogo from "../../../assets/partners/BLifeForU.png";
import { useTranslation } from "react-i18next";

const partners = [
    { name: "CyberOperations", logo: csocLogo, link: "https://csoc.bg" },
    { name: "BLifeForU", logo: BLifeForULogo, link: "https://blifeforu.com/" },
    { name: "CyberOperations", logo: csocLogo, link: "https://csoc.bg" },
    { name: "BLifeForU", logo: BLifeForULogo, link: "https://blifeforu.com/" },
    { name: "CyberOperations", logo: csocLogo, link: "https://csoc.bg" },
    { name: "BLifeForU", logo: BLifeForULogo, link: "https://blifeforu.com/" },
    { name: "CyberOperations", logo: csocLogo, link: "https://csoc.bg" },
    { name: "BLifeForU", logo: BLifeForULogo, link: "https://blifeforu.com/" },
    { name: "CyberOperations", logo: csocLogo, link: "https://csoc.bg" },
    { name: "BLifeForU", logo: BLifeForULogo, link: "https://blifeforu.com/" },
];

export default function Partners() {

    const { t } = useTranslation();
    const [isPaused, setIsPaused] = useState(false);

    const handleMouseEnter = () => {
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
    };

    return (
        <section className="partners-section">
            <h2 className="partners-title text-center mb-5">{t("Trusted by leading businesses")}</h2>
            <div className={`slider ${isPaused ? "paused" : ""}`}>
                <div className="slide-track">
                    {partners.concat(partners).map((partner, index) => (
                        <div className="slide" key={index}>
                            <a
                                href={partner.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    height="200"
                                    width="250"
                                />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
