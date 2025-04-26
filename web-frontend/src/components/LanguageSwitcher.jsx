import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = ({ variant = "light", upward = false }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    // Toggle Dropdown Visibility
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Change Language and Save Preference
    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang); // Change language in i18n
        localStorage.setItem("language", lang); // Save to localStorage
        setIsOpen(false); // Close dropdown
    };

    // Language Options
    const languages = [
        { code: "en", label: "English" },
        { code: "bg", label: "Български" },
    ];

    // Set the saved language on component mount
    React.useEffect(() => {
        const savedLanguage = localStorage.getItem("language");
        if (savedLanguage && savedLanguage !== i18n.language) {
            i18n.changeLanguage(savedLanguage); // Apply saved language
        }
    }, [i18n]);

    const buttonClass = variant === "dark"
        ? "btn btn-dark dropdown-toggle d-flex align-items-center w-100 justify-content-between"
        : "btn btn-light dropdown-toggle d-flex align-items-center";

    const dropdownClass = variant === "dark"
        ? "dropdown-menu dropdown-menu-dark"
        : "dropdown-menu";

    return (
        <div className="dropdown" style={{ position: 'relative' }}>
            {/* Trigger Button */}
            <button
                className={buttonClass}
                type="button"
                id="languageDropdown"
                aria-expanded={isOpen}
                onClick={toggleDropdown}
            >
                <span>
                    <i className="fas fa-globe me-2"></i>
                    {i18n.language.toUpperCase()}
                </span>
            </button>

            {/* Dropdown Menu */}
            <ul
                className={`${dropdownClass} ${isOpen ? "show" : ""}`}
                aria-labelledby="languageDropdown"
                style={{
                    position: 'absolute',
                    bottom: upward ? '100%' : 'auto',
                    left: 0,
                    right: 0,
                    marginBottom: upward ? '2px' : '0',
                    transform: 'none'
                }}
            >
                {languages.map((lang) => (
                    <li key={lang.code}>
                        <button
                            className={`dropdown-item ${i18n.language === lang.code ? "active" : ""}`}
                            onClick={() => changeLanguage(lang.code)}
                        >
                            {lang.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LanguageSwitcher;
