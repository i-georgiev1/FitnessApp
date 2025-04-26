import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axios';
import '../../styles/AuthPage.css'; // Optional for additional custom styling
import ThisPageHead from '../../components/Header.jsx';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../config/api';
import { Modal, Box, Typography, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

function SignUpPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [userType, setUserType] = useState(null);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError(t('Passwords do not match'));
            return;
        }

        try {
            const response = await axiosInstance.post(API_ENDPOINTS.auth.register, {
                first_name: firstName,
                last_name: lastName,
                email,
                password
            });

            // Store the token with Bearer prefix
            const token = response.data.access_token;
            localStorage.setItem('token', `Bearer ${token}`);

            // Store user data
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            // Add token to axios default headers
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Set user type and show success modal
            setUserType(response.data.user?.user_type);
            setShowSuccessModal(true);

        } catch (err) {
            console.error('Signup error:', err.response?.data || err.message);
            setError(err.response?.data?.error || t('Signup failed.'));
        }
    };

    const handleNavigateToDashboard = () => {
        if (userType === 'admin') {
            navigate('/admin');
        } else if (userType === 'coach') {
            navigate('/coach');
        } else {
            navigate('/dashboard');
        }
    };

    const handleOAuthSignUp = (provider) => {
        window.location.href = `${API_ENDPOINTS.auth.oauth}/${provider}`;
    };

    return (<>
        <ThisPageHead title="TrainSync - Sign Up" />
        <main className="auth-page" style={{ marginTop: '80px', marginBottom: '40px' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-6 col-lg-5 col-xl-4">
                        <div className="card card-2 shadow-lg p-4 mx-auto">
                            <h1 className="text-center mb-4">{t('Sign Up')}</h1>
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSignup}>
                                <div className="row mb-3">
                                    <div className="col">
                                        <label htmlFor="firstName" className="form-label">
                                            {t('First Name')}
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            className="form-control"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col">
                                        <label htmlFor="lastName" className="form-label">
                                            {t('Last Name')}
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            className="form-control"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
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
                                    <input
                                        type="password"
                                        id="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="confirmPassword" className="form-label">
                                        {t('Confirm Password')}
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        className="form-control"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    {t('Sign Up')}
                                </button>
                            </form>
                            <div className="text-center mt-3">
                                <p>
                                    {t('Already have an account?')} <Link to="/login">{t('Login')}</Link>
                                </p>
                            </div>
                            <hr />
                            <div className="text-center">
                                <p className="mb-3">{t('Or sign up with:')}</p>
                                <div className="d-flex justify-content-around">
                                    {/* Google Sign Up */}
                                    <button
                                        onClick={() => handleOAuthSignUp('google')}
                                        className="btn btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '50px', height: '50px' }}
                                    >
                                        <i className="fab fa-google" style={{ fontSize: '24px' }}></i>
                                    </button>

                                    {/* Facebook Sign Up */}
                                    <button
                                        onClick={() => handleOAuthSignUp('facebook')}
                                        className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '50px', height: '50px' }}
                                    >
                                        <i className="fab fa-facebook-f" style={{ fontSize: '24px' }}></i>
                                    </button>

                                    {/* Apple Sign Up */}
                                    <button
                                        onClick={() => handleOAuthSignUp('apple')}
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

            {/* Success Modal */}
            <Modal
                open={showSuccessModal}
                aria-labelledby="signup-success-modal"
                disableEscapeKeyDown
                disableAutoFocus
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    textAlign: 'center'
                }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" component="h2" gutterBottom>
                        {t('Account Created Successfully!')}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {t('Welcome to Train-Sync! Your fitness journey begins now.')}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleNavigateToDashboard}
                        size="large"
                    >
                        {t('Go to Dashboard')}
                    </Button>
                </Box>
            </Modal>
        </main>
    </>);
}

export default SignUpPage;
