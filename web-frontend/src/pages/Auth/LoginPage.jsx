import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axios';
import '../../styles/AuthPage.css'; // Optional for additional custom styling
import ThisPageHead from '../../components/Header.jsx';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../config/api';

function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axiosInstance.post(API_ENDPOINTS.auth.login, {
                email,
                password
            });

            if (!response.data.access_token) {
                throw new Error('No access token received from server');
            }

            // Store the token with Bearer prefix
            const token = response.data.access_token;
            localStorage.setItem('token', `Bearer ${token}`);

            // Store user data if available
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            // Add token to axios default headers
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Check user type and redirect accordingly
            const userType = response.data.user?.user_type;
            if (userType === 'admin') {
                navigate('/admin');
            } else if (userType === 'coach') {
                navigate('/coach');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Login failed';
            setError(t(errorMessage));
        }
    };

    const handleOAuthLogin = (provider) => {
        window.location.href = `/api/oauth2/${provider}`;
    };

    return (<>
        <ThisPageHead title="TrainSync - Log In" />
        <main className="auth-page" style={{ marginTop: '80px', marginBottom: '40px' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-6 col-lg-5 col-xl-4">
                        <div className="card card-2 shadow-lg p-4 mx-auto">
                            <h1 className="text-center mb-4">{t("Login")}</h1>
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        {t('Email address')}
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
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        {t('Password')}
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            className="form-control"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    {t('Login')}
                                </button>
                            </form>
                            <div className="text-center mt-3">
                                <Link to="/forgot-password">{t('Forgot Password?')}</Link>
                                <p className="mt-2">
                                    {t("Don't have an account?")} <Link to="/signup">{t('Sign Up')}</Link>
                                </p>
                            </div>
                            <hr />
                            <div className="text-center">
                                <p className="mb-3">{t('Or login with:')}</p>
                                <div className="d-flex justify-content-around">
                                    {/* Google Login */}
                                    <button
                                        onClick={() => handleOAuthLogin('google')}
                                        className="btn btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '50px', height: '50px' }}
                                    >
                                        <i className="fab fa-google" style={{ fontSize: '24px' }}></i>
                                    </button>

                                    {/* Facebook Login */}
                                    <button
                                        onClick={() => handleOAuthLogin('facebook')}
                                        className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '50px', height: '50px' }}
                                    >
                                        <i className="fab fa-facebook-f" style={{ fontSize: '24px' }}></i>
                                    </button>

                                    {/* Apple Login */}
                                    <button
                                        onClick={() => handleOAuthLogin('apple')}
                                        className="btn btn-outline-dark rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '50px', height: '50px' }}
                                    >
                                        <i className="fab fa-apple" style={{ fontSize: '24px' }}></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </>);
}

export default LoginPage;
