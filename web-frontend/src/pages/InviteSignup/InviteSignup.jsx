import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Stack
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';

const InviteSignup = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [inviteData, setInviteData] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const verifyInvite = async () => {
            try {
                const token = new URLSearchParams(location.search).get('token');
                if (!token) {
                    setError(t('Invalid invitation link'));
                    setLoading(false);
                    return;
                }

                const response = await axiosInstance.get(`${API_ENDPOINTS.auth.verifyInvite}?token=${token}`);
                if (!response.data.valid) {
                    setError(t('Invalid or expired invitation'));
                    setLoading(false);
                    return;
                }

                setInviteData({
                    ...response.data,
                    token,
                    user_type: response.data.user_type || 'user'
                });
                setLoading(false);
            } catch (err) {
                console.error('Error verifying invite:', err);
                setError(err.response?.data?.error || t('Invalid or expired invitation'));
                setLoading(false);
            }
        };

        verifyInvite();
    }, [location, t]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (formData.password !== formData.confirmPassword) {
                setError(t('Passwords do not match'));
                return;
            }

            if (formData.password.length < 8) {
                setError(t('Password must be at least 8 characters long'));
                return;
            }

            // Register with invite token
            const registerResponse = await axiosInstance.post(API_ENDPOINTS.auth.register, {
                email: inviteData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                password: formData.password,
                invite_token: inviteData.token
            });

            // Log in automatically
            const loginResponse = await axiosInstance.post(API_ENDPOINTS.auth.login, {
                email: inviteData.email,
                password: formData.password
            });

            // Store the token
            localStorage.setItem('token', loginResponse.data.access_token);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.access_token}`;

            // Redirect based on user type
            const userType = registerResponse.data.user.user_type;
            if (userType === 'admin') {
                navigate('/admin');
            } else if (userType === 'coach') {
                navigate('/coach');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Error completing registration:', err);
            setError(err.response?.data?.error || t('Failed to complete registration'));
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate('/login')}
                    sx={{ mt: 2 }}
                >
                    {t('Go to Login')}
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        {t('Complete Your Registration')}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }} align="center">
                        {t('You\'ve been invited to join Train-Sync as a {{role}}', { role: inviteData?.user_type || 'user' })}
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label={t('First Name')}
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label={t('Last Name')}
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                type="password"
                                label={t('Password')}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                type="password"
                                label={t('Confirm Password')}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={!formData.first_name || !formData.last_name || !formData.password || !formData.confirmPassword}
                            >
                                {t('Complete Registration')}
                            </Button>
                        </Stack>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default InviteSignup; 