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
    useTheme,
    Tabs,
    Tab
} from '@mui/material';
import axiosInstance from '../../../config/axios';
import DashboardSidebar from './DashboardSidebar';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../../config/api';

const Settings = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        profile_image_url: '',
        bio: '',
        age: '',
        gender: '',
        location: '',
        fitness_level: '',
        goals: '',
        preferences: '',
        timezone: '',
        contact_number: '',
        emergency_contact: '',
        health_conditions: '',
        height: '',
        weight: '',
        activity_level: '',
        workout_preferences: '',
        dietary_preferences: '',
        allergies: '',
        injury_history: ''
    });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [tabValue, setTabValue] = useState(0);
    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        const savedState = localStorage.getItem('userSidebarState');
        return savedState ? JSON.parse(savedState) : true;
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const userResponse = await axiosInstance.get(API_ENDPOINTS.auth.me);
            const profileResponse = await axiosInstance.get(API_ENDPOINTS.profile.get);
            setFormData({
                ...userResponse.data,
                ...profileResponse.data
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            setNotification({
                open: true,
                message: t('Failed to load user data'),
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

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // Separate user and profile data
            const userData = {
                first_name: formData.first_name || '',
                last_name: formData.last_name || '',
                profile_image_url: formData.profile_image_url || ''
            };

            // Create profile data with all fields
            const profileData = {
                bio: formData.bio || '',
                age: formData.age ? parseInt(formData.age) : null,
                gender: formData.gender || '',
                location: formData.location || '',
                fitness_level: formData.fitness_level || '',
                goals: formData.goals || '',
                preferences: formData.preferences || '',
                timezone: formData.timezone || '',
                contact_number: formData.contact_number || '',
                emergency_contact: formData.emergency_contact || '',
                health_conditions: formData.health_conditions || '',
                height: formData.height ? parseFloat(formData.height) : null,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                activity_level: formData.activity_level || '',
                workout_preferences: formData.workout_preferences || '',
                dietary_preferences: formData.dietary_preferences || '',
                allergies: formData.allergies || '',
                injury_history: formData.injury_history || ''
            };

            // Log the data being sent
            console.log('Sending user data:', userData);
            console.log('Sending profile data:', profileData);

            // Update user data
            const userResponse = await axiosInstance.put(API_ENDPOINTS.user.update, userData);
            console.log('User update response:', userResponse);

            // Update profile data
            try {
                const profileResponse = await axiosInstance.put(API_ENDPOINTS.profile.update, profileData);
                console.log('Profile update response:', profileResponse);

                if (!profileResponse.data) {
                    throw new Error('No data received from profile update');
                }
            } catch (profileError) {
                console.error('Profile update error:', profileError);
                console.error('Profile error response:', profileError.response?.data);
                throw profileError;
            }

            // Update localStorage with user data
            localStorage.setItem('user', JSON.stringify({
                ...userData,
                email: formData.email
            }));

            // Refresh user data to ensure we have the latest
            await fetchUserData();

            setNotification({
                open: true,
                message: t('Settings updated successfully'),
                severity: 'success'
            });
        } catch (error) {
            console.error('Error updating settings:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error headers:', error.response?.headers);

            // More specific error message
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                t('Failed to update settings');

            setNotification({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const handleSidebarToggle = (expanded) => {
        setSidebarExpanded(expanded);
        localStorage.setItem('userSidebarState', JSON.stringify(expanded));
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
            <DashboardSidebar expanded={sidebarExpanded} onToggle={handleSidebarToggle} />
            <Container maxWidth="lg" sx={{
                mt: 4,
                ml: sidebarExpanded ? '270px' : '65px',
                width: { sm: `calc(100% - ${sidebarExpanded ? '270px' : '65px'})` },
                transition: theme.transitions.create(['width', 'margin-left'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                mb: 4
            }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" gutterBottom>
                        {t('Settings')}
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

                <Paper sx={{ p: 3 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
                    >
                        <Tab label={t('Personal Info')} />
                        <Tab label={t('Health Info')} />
                    </Tabs>

                    {tabValue === 0 && (
                        <Grid container spacing={3}>
                            {/* Personal Information */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                    {t('Basic Information')}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label={t('First Name')}
                                            name="first_name"
                                            value={formData.first_name || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label={t('Last Name')}
                                            name="last_name"
                                            value={formData.last_name || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Email')}
                                            name="email"
                                            value={formData.email || ''}
                                            disabled
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label={t('Age')}
                                            name="age"
                                            type="number"
                                            value={formData.age || ''}
                                            onChange={handleInputChange}
                                            inputProps={{ min: "13", max: "120" }}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>{t('Gender')}</InputLabel>
                                            <Select
                                                name="gender"
                                                value={formData.gender || ''}
                                                onChange={handleInputChange}
                                                label={t('Gender')}
                                            >
                                                <MenuItem value="male">{t('Male')}</MenuItem>
                                                <MenuItem value="female">{t('Female')}</MenuItem>
                                                <MenuItem value="other">{t('Other')}</MenuItem>
                                                <MenuItem value="prefer not to say">{t('Prefer not to say')}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Location')}
                                            name="location"
                                            value={formData.location || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Timezone')}
                                            name="timezone"
                                            value={formData.timezone || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Profile Image URL')}
                                            name="profile_image_url"
                                            value={formData.profile_image_url || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Contact Information */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                    {t('Contact Information')}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Contact Number')}
                                            name="contact_number"
                                            value={formData.contact_number || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Emergency Contact')}
                                            name="emergency_contact"
                                            value={formData.emergency_contact || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Goals and Bio */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                    {t('Goals & Bio')}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Goals')}
                                            name="goals"
                                            value={formData.goals || ''}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={3}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Bio')}
                                            name="bio"
                                            value={formData.bio || ''}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={3}
                                            margin="normal"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}

                    {tabValue === 1 && (
                        <Grid container spacing={3}>
                            {/* Physical Measurements */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                    {t('Physical Measurements')}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label={t('Height (cm)')}
                                            name="height"
                                            type="number"
                                            value={formData.height || ''}
                                            onChange={handleInputChange}
                                            inputProps={{ min: "100", max: "250", step: "0.1" }}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label={t('Weight (kg)')}
                                            name="weight"
                                            type="number"
                                            value={formData.weight || ''}
                                            onChange={handleInputChange}
                                            inputProps={{ min: "30", max: "300", step: "0.1" }}
                                            margin="normal"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Fitness Profile */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                    {t('Fitness Profile')}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>{t('Fitness Level')}</InputLabel>
                                            <Select
                                                name="fitness_level"
                                                value={formData.fitness_level || ''}
                                                onChange={handleInputChange}
                                            >
                                                <MenuItem value="beginner">{t('Beginner')}</MenuItem>
                                                <MenuItem value="intermediate">{t('Intermediate')}</MenuItem>
                                                <MenuItem value="advanced">{t('Advanced')}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>{t('Activity Level')}</InputLabel>
                                            <Select
                                                name="activity_level"
                                                value={formData.activity_level || ''}
                                                onChange={handleInputChange}
                                            >
                                                <MenuItem value="sedentary">{t('Sedentary')}</MenuItem>
                                                <MenuItem value="light">{t('Light')}</MenuItem>
                                                <MenuItem value="moderate">{t('Moderate')}</MenuItem>
                                                <MenuItem value="very active">{t('Very Active')}</MenuItem>
                                                <MenuItem value="extra active">{t('Extra Active')}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Workout Preferences')}
                                            name="workout_preferences"
                                            value={formData.workout_preferences || ''}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={3}
                                            margin="normal"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Health Information */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                    {t('Health Information')}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Health Conditions')}
                                            name="health_conditions"
                                            value={formData.health_conditions || ''}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={2}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Allergies')}
                                            name="allergies"
                                            value={formData.allergies || ''}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={2}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Injury History')}
                                            name="injury_history"
                                            value={formData.injury_history || ''}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={2}
                                            margin="normal"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Dietary Information */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                    {t('Dietary Information')}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Dietary Preferences')}
                                            name="dietary_preferences"
                                            value={formData.dietary_preferences || ''}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={2}
                                            margin="normal"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </Paper>

                {/* Notification */}
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
            </Container>
        </Box>
    );
};

export default Settings; 