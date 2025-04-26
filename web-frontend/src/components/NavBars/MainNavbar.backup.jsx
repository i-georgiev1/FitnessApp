import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import Headroom from "react-headroom";
import logo from "../../assets/third-eye.png";
import "bootstrap/dist/css/bootstrap.min.css";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslation } from "react-i18next";
import "../../styles/MainNavbar.css"

function FuturisticNavbar() {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll and toggle isScrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Headroom>
      <Navbar
        collapseOnSelect
        expand="lg"
        className={`futuristic-navbar shadow-lg ${
          isScrolled ? "scrolled-navbar" : ""
        }`}
        style={{
          backgroundColor: "#495057",
          color: "white",
          position: "fixed",
          top: "10px",
          left: isScrolled ? "20px" : "10px",
          right: isScrolled ? "20px" : "10px",
          zIndex: "1050",
          transition: "all 0.3s ease-in-out",
          borderRadius: "12px",
        }}
      >
        <Container>
          {/* Brand Logo */}
          <Navbar.Brand href="/home" className="d-flex align-items-center">
            <img
              src={logo}
              alt="Logo"
              className="me-2"
              style={{
                width: isScrolled ? "3rem" : "3.5rem",
                filter: "drop-shadow(0 0 10px white)",
                transition: "width 0.3s ease-in-out",
              }}
            />
            <span className="fw-bold" style={{ color: "white" }}>
              {t("brand_name")}
            </span>
          </Navbar.Brand>

          {/* Responsive Toggle */}
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />

          {/* Navbar Links */}
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/home" className="fw-semibold text-white">
                {t("home")}
              </Nav.Link>

              <NavDropdown
                title={t("features")}
                id="features-dropdown"
                menuVariant="dark"
                className="fw-semibold text-white"
              >
                <NavDropdown.Item href="/features/individuals">
                  {t("for_individuals")}
                </NavDropdown.Item>
                <NavDropdown.Item href="/features/coaches">
                  {t("for_coaches")}
                </NavDropdown.Item>
                <NavDropdown.Item href="/features/shared">
                  {t("shared_features")}
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown
                title={t("about_us")}
                id="about-us-dropdown"
                menuVariant="whiteq"
                className="fw-semibold text-white"
              >
                <NavDropdown.Item href="/about/mission">
                  {t("mission_statement")}
                </NavDropdown.Item>
                <NavDropdown.Item href="/about/team">
                  {t("team_introduction")}
                </NavDropdown.Item>
                <NavDropdown.Item href="/about/partners">
                  {t("partners")}
                </NavDropdown.Item>
              </NavDropdown>

              <Nav.Link href="/pricing" className="fw-semibold text-white">
                {t("pricing")}
              </Nav.Link>

              <NavDropdown
                title={t("resources")}
                id="resources-dropdown"
                menuVariant="dark"
                className="fw-semibold text-white"
              >
                <NavDropdown.Item href="/resources/tips">
                  {t("fitness_tips")}
                </NavDropdown.Item>
                <NavDropdown.Item href="/resources/coaches">
                  {t("guides_for_coaches")}
                </NavDropdown.Item>
                <NavDropdown.Item href="/resources/updates">
                  {t("platform_updates")}
                </NavDropdown.Item>
              </NavDropdown>

              <Nav.Link href="/contact" className="fw-semibold text-white">
                {t("contact_us")}
              </Nav.Link>
            </Nav>

            <Nav className="d-flex align-items-center">
              <Nav.Link
                href="/login"
                className="fw-semibold me-2 text-white"
              >
                {t("login")}
              </Nav.Link>
              <Button
                variant="outline-light"
                href="/signup"
                className="fw-bold text-uppercase"
                style={{ borderRadius: "20px" }}
              >
                {t("sign_up")}
              </Button>
              <Nav.Link>
                <LanguageSwitcher />
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Custom Styles */}
      
    </Headroom>
  );
}

export default FuturisticNavbar;
