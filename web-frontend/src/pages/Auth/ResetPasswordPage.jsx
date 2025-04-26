import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function ResetPasswordPage() {
    const { t } = useTranslation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            setError(t('Passwords do not match!'));
            return;
        }

        try {
            // Call backend to reset password
            await axios.post('/api/auth/reset-password', {
                token,
                new_password: newPassword
            });

            setSuccess(true);
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || t('Failed to reset password. Please try again.'));
        }
    };

    if (!token) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="card card-2 shadow-lg p-4" style={{ width: '400px' }}>
                    <h1 className="text-center mb-4">{t('Invalid Reset Link')}</h1>
                    <p className="text-center">{t('This password reset link is invalid or has expired.')}</p>
                    <button 
                        className="btn btn-primary w-100"
                        onClick={() => navigate('/forgot-password')}
                    >
                        {t('Request New Reset Link')}
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="card card-2 shadow-lg p-4" style={{ width: '400px' }}>
                    <h1 className="text-center mb-4">{t('Password Reset Successful')}</h1>
                    <p className="text-center">{t('Your password has been reset successfully. Redirecting to login...')}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="card card-2 shadow-lg p-4" style={{ width: '400px' }}>
                    <h1 className="text-center mb-4">{t('Reset Password')}</h1>
                    <form onSubmit={handleResetPassword}>
                        <div className="mb-3">
                            <label htmlFor="newPassword" className="form-label">
                                {t('New Password')}
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                className="form-control"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label">
                                {t('Confirm New Password')}
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <button type="submit" className="btn btn-primary w-100">
                            {t('Reset Password')}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ResetPasswordPage;
