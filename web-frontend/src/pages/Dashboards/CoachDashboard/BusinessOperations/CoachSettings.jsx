import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel
} from '@mui/material';
import axiosInstance from '../../../../config/axios';
import CoachSidebar from '../CoachSidebar';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../../../config/api';

const CoachSettings = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        profile_image_url: '',
        bio: '',
        specializations: '',
        experience_years: '',
        coach_cost: '',
        availability: '',
        session_duration: 60,
        max_clients: 10,
        auto_accept_clients: false,
        notification_preferences: {
            email: true,
            push: true,
            sms: false
        },
        payment_details: {
            account_holder: '',
            account_number: '',
            bank_name: '',
            swift_code: ''
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchCoachData();
    }, []);

    const fetchCoachData = async () => {
        try {
            setLoading(true);

            // Fetch coach profile data
            const [profileResponse, settingsResponse] = await Promise.all([
                axiosInstance.get(API_ENDPOINTS.auth.me),
                axiosInstance.get(API_ENDPOINTS.coach.settings)
            ]);

            const profileData = profileResponse.data || {};
            const settingsData = settingsResponse.data || {};

            setFormData(prevData => ({
                ...prevData,
                first_name: profileData.first_name || '',
                last_name: profileData.last_name || '',
                email: profileData.email || '',
                profile_image_url: profileData.profile_image_url || '',
                bio: settingsData.bio || '',
                specializations: settingsData.specializations || '',
                experience_years: settingsData.experience_years || '',
                notification_preferences: {
                    ...prevData.notification_preferences
                },
                payment_details: {
                    ...prevData.payment_details
                }
            }));
        } catch (error) {
            console.error('Error fetching coach data:', error);
            setNotification({
                open: true,
                message: 'Failed to load coach settings',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNotificationChange = (type) => (e) => {
        setFormData(prev => ({
            ...prev,
            notification_preferences: {
                ...prev.notification_preferences,
                [type]: e.target.checked
            }
        }));
    };

    const handlePaymentDetailsChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            payment_details: {
                ...prev.payment_details,
                [field]: e.target.value
            }
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // Update coach settings
            await axiosInstance.put(API_ENDPOINTS.coach.settings, formData);

            setNotification({
                open: true,
                message: t('Settings updated successfully'),
                severity: 'success'
            });
        } catch (error) {
            console.error('Error updating settings:', error);
            setNotification({
                open: true,
                message: error.response?.data?.message || t('Failed to update settings'),
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box display="flex">
            <CoachSidebar expanded={sidebarExpanded} onToggle={(expanded) => setSidebarExpanded(expanded)} />
            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - ${sidebarExpanded ? '270px' : '65px'})` },
                ml: { sm: sidebarExpanded ? '270px' : '65px' },
                transition: theme => theme.transitions.create(['width', 'margin-left'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" gutterBottom>
                        {t('Coach Settings')}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? t('Saving...') : t('Save Changes')}
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {/* Personal Information */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Personal Information')}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('First Name')}
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Last Name')}
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label={t('Email')}
                                        name="email"
                                        value={formData.email}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label={t('Profile Image URL')}
                                        name="profile_image_url"
                                        value={formData.profile_image_url}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Professional Information */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Professional Information')}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label={t('Bio')}
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label={t('Specializations')}
                                        name="specializations"
                                        value={formData.specializations}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Years of Experience')}
                                        name="experience_years"
                                        type="number"
                                        value={formData.experience_years}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Coach Cost  (€)')}
                                        name="coach_cost"
                                        type="number"
                                        value={formData.coach_cost}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Business Settings */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Business Settings')}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label={t('Availability')}
                                        name="availability"
                                        value={formData.availability}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={2}
                                        helperText={t('Describe your general availability')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Session Duration (minutes)')}
                                        name="session_duration"
                                        type="number"
                                        value={formData.session_duration}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Maximum Clients')}
                                        name="max_clients"
                                        type="number"
                                        value={formData.max_clients}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.auto_accept_clients}
                                                onChange={(e) => handleInputChange({
                                                    target: {
                                                        name: 'auto_accept_clients',
                                                        value: e.target.checked
                                                    }
                                                })}
                                            />
                                        }
                                        label={t('Auto-accept new clients')}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Notification Preferences */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Notification Preferences')}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.notification_preferences.email}
                                                onChange={handleNotificationChange('email')}
                                            />
                                        }
                                        label={t('Email Notifications')}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.notification_preferences.push}
                                                onChange={handleNotificationChange('push')}
                                            />
                                        }
                                        label={t('Push Notifications')}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.notification_preferences.sms}
                                                onChange={handleNotificationChange('sms')}
                                            />
                                        }
                                        label={t('SMS Notifications')}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Payment Information */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Payment Information')}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Account Holder Name')}
                                        value={formData.payment_details.account_holder}
                                        onChange={handlePaymentDetailsChange('account_holder')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Bank Name')}
                                        value={formData.payment_details.bank_name}
                                        onChange={handlePaymentDetailsChange('bank_name')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Account Number')}
                                        value={formData.payment_details.account_number}
                                        onChange={handlePaymentDetailsChange('account_number')}
                                        type="password"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('SWIFT/BIC Code')}
                                        value={formData.payment_details.swift_code}
                                        onChange={handlePaymentDetailsChange('swift_code')}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>

                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.severity}
                        sx={{ width: '100%' }}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default CoachSettings;
