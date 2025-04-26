import React, { useState } from 'react';
import ThisPageHead from '../../components/Header.jsx';
import { useTranslation } from 'react-i18next';

function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');

    const handleForgotPassword = (e) => {
        e.preventDefault();
        // Call your backend to send a password reset email
        alert(t(`Password reset link sent to ${email}`));
    };

    return (<>
        <ThisPageHead title="TrainSync - Forgot Password" />
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card card-2 shadow-lg p-4" style={{ width: '400px' }}>
                <h1 className="text-center mb-4">{t('Forgot Password')}</h1>
                <form onSubmit={handleForgotPassword}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            {t('Enter your email address')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        {t('Send Reset Link')}
                    </button>
                </form>
            </div>
        </div>
    </>);
}

export default ForgotPasswordPage;
