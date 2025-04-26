import React from 'react';
import ThisPageHead from '../../../components/Header.jsx';
import '../../../styles/privacy-policy.css';

const PrivacyPolicy = () => {

    return (<>
        <ThisPageHead title="TrainSync - Privacy Policy" />
        <div className="privacy-policy">
            <div className="container">
                <div className="sidebar">
                    <nav>
                        <ul>
                            <li><a href="#information-we-collect">1. Information We Collect</a></li>
                            <li><a href="#how-we-use-information">2. How We Use Your Information</a></li>
                            <li><a href="#sharing-information">3. Sharing Your Information</a></li>
                            <li><a href="#data-security">4. Data Security</a></li>
                            <li><a href="#your-rights">5. Your Rights</a></li>
                            <li><a href="#cookies-tracking">6. Cookies and Tracking</a></li>
                            <li><a href="#data-retention">7. Data Retention</a></li>
                            <li><a href="#changes-policy">8. Changes to This Privacy Policy</a></li>
                            <li><a href="#contact-us">9. Contact Us</a></li>
                        </ul>
                    </nav>
                </div>

                <div className="content">
                    <h1>Privacy Policy</h1>
                    <p><strong>Effective Date:</strong> January 04, 2025</p>
                    <p>
                        Welcome to Train Sync! Your privacy is of utmost importance to us. This Privacy Policy
                        explains how we collect, use, and protect your information when you use our app, website,
                        and services. By accessing or using Train Sync, you agree to the terms outlined in this policy.
                    </p>

                    <h2 id="information-we-collect">1. Information We Collect</h2>
                    <p>We collect the following types of information to provide and improve our services:</p>
                    <h3>a. Personal Information</h3>
                    <ul>
                        <li>Name, email address, and contact details provided during signup.</li>
                        <li>Payment information when purchasing subscriptions or services.</li>
                    </ul>
                    <h3>b. Fitness and Health Data</h3>
                    <ul>
                        <li>User-input data such as goals, workout preferences, and progress metrics (e.g., steps, weight, calories burned).</li>
                        <li>Usage patterns of the app to optimize recommendations.</li>
                    </ul>
                    <h3>c. Technical Information</h3>
                    <ul>
                        <li>Device information, such as IP address, browser type, and operating system.</li>
                        <li>Cookies and similar technologies to track usage patterns and preferences.</li>
                    </ul>

                    <h2 id="how-we-use-information">2. How We Use Your Information</h2>
                    <p>We use your information to:</p>
                    <ul>
                        <li>Personalize your fitness experience and suggest training plans.</li>
                        <li>Monitor progress and provide insights into your fitness journey.</li>
                        <li>Facilitate communication between you and your coach (if applicable).</li>
                        <li>Process payments securely.</li>
                        <li>Improve and develop our app and services.</li>
                    </ul>

                    <h2 id="sharing-information">3. Sharing Your Information</h2>
                    <p>We do not sell or rent your information. However, we may share your data in the following circumstances:</p>
                    <ul>
                        <li><strong>With Coaches:</strong> If you are paired with a coach, they may access your fitness data to provide guidance.</li>
                        <li><strong>Service Providers:</strong> Trusted third-party vendors (e.g., payment processors, hosting providers) that assist in delivering our services.</li>
                        <li><strong>Legal Requirements:</strong> If required by law, we may share your information with regulatory or enforcement authorities.</li>
                    </ul>

                    <h2 id="data-security">4. Data Security</h2>
                    <p>
                        We employ industry-standard security measures to protect your data, including:
                    </p>
                    <ul>
                        <li>Encryption of sensitive information (e.g., passwords, payment data).</li>
                        <li>Regular security audits and updates.</li>
                        <li>Access controls to restrict unauthorized data access.</li>
                    </ul>

                    <h2 id="your-rights">5. Your Rights</h2>
                    <p>You have the following rights regarding your information:</p>
                    <ul>
                        <li><strong>Access and Portability:</strong> Request a copy of your data in a machine-readable format.</li>
                        <li><strong>Correction:</strong> Update or correct inaccuracies in your data.</li>
                        <li><strong>Deletion:</strong> Request deletion of your account and personal information, subject to legal or contractual obligations.</li>
                        <li><strong>Withdraw Consent:</strong> Opt-out of certain data uses (e.g., marketing emails).</li>
                    </ul>
                    <p>To exercise these rights, contact us at <a href="mailto:support@trainsync.com">support@trainsync.com</a>.</p>

                    <h2 id="cookies-tracking">6. Cookies and Tracking Technologies</h2>
                    <p>
                        Train Sync uses cookies and similar technologies to:
                    </p>
                    <ul>
                        <li>Save your preferences.</li>
                        <li>Analyze app usage for performance improvements.</li>
                        <li>Provide targeted recommendations.</li>
                    </ul>
                    <p>You can manage your cookie preferences through your browser settings.</p>

                    <h2 id="data-retention">7. Data Retention</h2>
                    <p>
                        We retain your data only for as long as necessary to provide our services and comply with legal obligations. After account deletion, we securely delete or anonymize your data.
                    </p>

                    <h2 id="changes-policy">8. Changes to This Privacy Policy</h2>
                    <p>
                        We may update this policy from time to time. Significant changes will be communicated via email or in-app notifications. The latest version will always be available on our website.
                    </p>

                    <h2 id="contact-us">9. Contact Us</h2>
                    <p>
                        If you have questions, concerns, or feedback about this Privacy Policy, feel free to contact us:
                    </p>
                    <ul>
                        <li><strong>Email:</strong> <a href="mailto:support@train-sync.com">support@train-sync.com</a></li>
                        <li><strong>Mailing Address:</strong> Train Sync, [Insert Address], [Insert City, State, Zip Code]</li>
                    </ul>
                    <p>Thank you for trusting Train Sync with your fitness journey!</p>
                </div>
            </div>
        </div>
    </>);
};

export default PrivacyPolicy;

