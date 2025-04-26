import { useState, useEffect } from "react"
import Container from "react-bootstrap/Container"
import Nav from "react-bootstrap/Nav"
import Navbar from "react-bootstrap/Navbar"
import NavDropdown from "react-bootstrap/NavDropdown"
import Button from "react-bootstrap/Button"
import Headroom from "react-headroom"
import logo from "../../assets/third-eye.png"
import "bootstrap/dist/css/bootstrap.min.css"
import LanguageSwitcher from "../LanguageSwitcher"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import "../../styles/MainNavbar.css"

function AuthNavbar() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [isScrolled, setIsScrolled] = useState(false)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Detect scroll and toggle isScrolled
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Check if user is logged in
    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
        navigate("/login")
    }

    const handleDashboard = () => {
        navigate("/dashboard")
    }

    if (loading) {
        return null // Or a loading spinner
    }

    return (
        <Headroom>
            <Navbar
                collapseOnSelect
                expand="lg"
                className={`futuristic-navbar shadow-lg ${isScrolled ? "scrolled-navbar" : ""}`}
                style={{
                    backgroundColor: "black",
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
                            src={logo || "/placeholder.svg"}
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
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" className="white" />

                    {/* Navbar Links */}
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/home" className="fw-semibold text-white">
                                {t("home_nav")}
                            </Nav.Link>

                            <Nav.Link href="/careers" className="fw-semibold text-white">
                                {t("careers")}
                            </Nav.Link>

                            <Nav.Link href="/resources/updates" className="fw-semibold text-white">
                                {t("news")}
                            </Nav.Link>

                            <Nav.Link href="/pricing" className="fw-semibold text-white">
                                {t("pricing")}
                            </Nav.Link>

                            <Nav.Link href="/contact" className="fw-semibold text-white">
                                {t("contact_us")}
                            </Nav.Link>
                            {/* 
                            <div className="vertical-line"></div>

                            <Nav.Link href="https://blifeforu.com" className="fw-semibold text-white">
                                {t("blife")}
                            </Nav.Link> */}
                        </Nav>

                        <Nav className="d-flex align-items-center">
                            {user ? (
                                <NavDropdown
                                    title={`${user.first_name} ${user.last_name}`}
                                    id="user-dropdown"
                                    menuVariant="dark"
                                    className="fw-semibold text-white"
                                    style={{
                                        color: 'white'
                                    }}
                                >
                                    <style type="text/css">
                                        {`
                                        #user-dropdown {
                                            color: white !important;
                                        }
                                        #user-dropdown:hover {
                                            color: white !important;
                                        }
                                        `}
                                    </style>
                                    <NavDropdown.Item onClick={handleDashboard}>
                                        <i className="fas fa-tachometer-alt me-2"></i>
                                        {t("dashboard")}
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout} className="text-danger">
                                        <i className="fas fa-sign-out-alt me-2"></i>
                                        {t("sign_out")}
                                    </NavDropdown.Item>
                                </NavDropdown>
                            ) : (
                                <>
                                    <Nav.Link href="/login" className="fw-semibold me-2 text-white">
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
                                </>
                            )}
                            <Nav.Link>
                                <LanguageSwitcher />
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </Headroom>
    )
}

export default AuthNavbar

