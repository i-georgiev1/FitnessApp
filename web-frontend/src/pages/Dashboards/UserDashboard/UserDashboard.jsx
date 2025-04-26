import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Avatar,
    Typography,
    Alert,
    Grid,
    Paper,
    CircularProgress,
    useTheme,
    Button,
    Modal,
    TextField,
    Stack,
    IconButton,
    Tabs,
    Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance from '../../../config/axios';
import DashboardSidebar from './DashboardSidebar';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../../config/api';
import SubscriptionPlans from './components/SubscriptionPlans';
import { useLocation } from 'react-router-dom';
import SettingsSetUp from './components/SettingsSetUp';
import SetupPassword from './components/SetupPassword';

const UserDashboard = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const location = useLocation();
    const [userData, setUserData] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openBalanceModal, setOpenBalanceModal] = useState(false);
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const [openCanceledModal, setOpenCanceledModal] = useState(false);
    const [openSubscriptionModal, setOpenSubscriptionModal] = useState(false);
    const [openSettingsSetupModal, setOpenSettingsSetupModal] = useState(false);
    const [balanceAmount, setBalanceAmount] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        const savedState = localStorage.getItem('userSidebarState');
        return savedState ? JSON.parse(savedState) : true;
    });
    const [showPasswordSetup, setShowPasswordSetup] = useState(false);

    // Handle sidebar toggle
    const handleSidebarToggle = (expanded) => {
        setSidebarExpanded(expanded);
        localStorage.setItem('userSidebarState', JSON.stringify(expanded));
    };

    // Check URL parameters on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const canceled = urlParams.get('canceled');

        if (success === 'true') {
            setOpenSuccessModal(true);
            // Clear the URL parameters
            window.history.replaceState({}, '', window.location.pathname);
        } else if (canceled === 'true') {
            setOpenCanceledModal(true);
            // Clear the URL parameters
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);


    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('openSubscription') === 'true') {
            setOpenSubscriptionModal(true);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [location]);

    const handleAddBalance = async () => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.profile.addBalance, {
                amount: parseFloat(balanceAmount)
            });

            // Redirect to Stripe checkout
            window.location.href = response.data.checkout_url;

            setBalanceAmount('');
            setOpenBalanceModal(false);
        } catch (err) {
            console.error('Error adding balance:', err);
            setError('Error adding balance');
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Check for required fields
    const checkRequiredFields = (profile) => {
        const requiredFields = ['contact_number', 'age', 'gender', 'height', 'weight', 'fitness_level'];
        return requiredFields.some(field => !profile?.[field]);
    };

    // Fetch user data and profile data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const userResponse = await axiosInstance.get(API_ENDPOINTS.auth.me);
                setUserData(userResponse.data);

                // Fetch profile data
                const profileResponse = await axiosInstance.get(API_ENDPOINTS.profile.get);
                setProfileData(profileResponse.data);

                // Check if required fields are missing
                if (checkRequiredFields(profileResponse.data)) {
                    setOpenSettingsSetupModal(true);
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Error loading user data');

                // Fallback to localStorage if API fails
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUserData(JSON.parse(storedUser));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleProfileUpdate = (updatedData) => {
        setProfileData(prev => ({
            ...prev,
            ...updatedData
        }));
    };

    // Check if user needs to set up password (invited user)
    useEffect(() => {
        const checkInvitedUser = async () => {
            try {
                const response = await axiosInstance.get(API_ENDPOINTS.auth.me);
                if (response.data.needs_password_setup) {
                    setShowPasswordSetup(true);
                }
            } catch (err) {
                console.error('Error checking user status:', err);
            }
        };

        checkInvitedUser();
    }, []);

    const handlePasswordSetupSuccess = () => {
        // Refresh user data after password setup
        fetchData();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!userData && error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">{t(error)}</Alert>
            </Container>
        );
    }

    return (
        <Box display="flex">
            <DashboardSidebar expanded={sidebarExpanded} onToggle={handleSidebarToggle} />

            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - ${sidebarExpanded ? '270px' : '65px'})` },
                ml: { sm: sidebarExpanded ? '270px' : '65px' },
                transition: theme.transitions.create(['width', 'margin-left'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }}>
                <Grid container spacing={3}>
                    {/* User Profile Card */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                            <Avatar
                                sx={{ width: 100, height: 100, mb: 2 }}
                                alt={userData?.first_name}
                                src={userData?.profile_image_url || "/default-avatar.png"}
                            />
                            <Typography variant="h5">
                                {userData?.first_name} {userData?.last_name}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                {userData?.email}
                            </Typography>
                            <Typography variant="body2" mt={1}>
                                {t('Member since')}: {new Date(userData?.created_at).toLocaleDateString()}
                            </Typography>
                            {userData?.last_login && (
                                <Typography variant="body2">
                                    {t('Last login')}: {new Date(userData?.last_login).toLocaleString()}
                                </Typography>
                            )}
                        </Paper>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Subscription Plan')}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setOpenSubscriptionModal(true)}
                                sx={{ mb: 3 }}
                            >
                                {t('Buy Subscription')}
                            </Button>
                        </Paper>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Balance')}
                            </Typography>
                            <Typography variant="h4" paragraph>
                                {userData?.balance || t('No balance')}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setOpenBalanceModal(true)}
                                sx={{ mb: 3 }}
                            >
                                {t('Add Balance')}
                            </Button>
                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                {t('Balance History')}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {t('No balance history available')}
                            </Typography>
                        </Paper>

                        <Modal
                            open={openBalanceModal}
                            onClose={() => setOpenBalanceModal(false)}
                            aria-labelledby="add-balance-modal"
                        >
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 400,
                                bgcolor: 'background.paper',
                                boxShadow: 24,
                                p: 4,
                                borderRadius: 2
                            }}>
                                <IconButton
                                    aria-label="close"
                                    onClick={() => setOpenBalanceModal(false)}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: 8,
                                        color: (theme) => theme.palette.grey[500]
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                                <Typography variant="h6" component="h2" gutterBottom>
                                    {t('Add Balance')}
                                </Typography>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        label={t('Amount')}
                                        type="number"
                                        value={balanceAmount}
                                        onChange={(e) => setBalanceAmount(e.target.value)}
                                        InputProps={{
                                            inputProps: { min: 0, step: "0.01" }
                                        }}
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleAddBalance}
                                        disabled={!balanceAmount || parseFloat(balanceAmount) <= 0}
                                    >
                                        {t('Add')}
                                    </Button>
                                </Stack>
                            </Box>
                        </Modal>
                    </Grid>

                    {/* Profile Details */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                                {t('Profile Details')}
                            </Typography>

                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
                            >
                                <Tab label={t('Personal Info')} />
                                <Tab label={t('Health Info')} />
                            </Tabs>

                            {tabValue === 0 && (
                                <>
                                    {/* Basic Information Section */}
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                            {t('Basic Information')}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Age')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.age || t('Not specified')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Gender')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.gender || t('Not specified')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Location')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.location || t('Not specified')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Timezone')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.timezone || t('Not specified')}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* Contact Information Section */}
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                            {t('Contact Information')}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Contact Number')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.contact_number || t('Not provided')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Emergency Contact')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.emergency_contact || t('Not provided')}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* Goals and Bio Section */}
                                    <Box>
                                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                            {t('Goals & Bio')}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Goals')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.goals || t('No goals specified')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Bio')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.bio || t('No bio provided')}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </>
                            )}

                            {tabValue === 1 && (
                                <>
                                    {/* Physical Measurements Section */}
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                            {t('Physical Measurements')}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Height')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.height ? `${profileData.height} cm` : t('Not specified')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Weight')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.weight ? `${profileData.weight} kg` : t('Not specified')}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* Fitness Profile Section */}
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                            {t('Fitness Profile')}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Fitness Level')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.fitness_level || t('Not specified')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Activity Level')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.activity_level || t('Not specified')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Workout Preferences')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.workout_preferences || t('Not specified')}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* Health Information Section */}
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                            {t('Health Information')}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Health Conditions')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.health_conditions || t('None specified')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Allergies')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.allergies || t('None specified')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Injury History')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.injury_history || t('None specified')}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* Dietary Information Section */}
                                    <Box>
                                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                            {t('Dietary Information')}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {t('Dietary Preferences')}
                                                </Typography>
                                                <Typography variant="body1" paragraph>
                                                    {profileData?.dietary_preferences || t('Not specified')}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Success Modal */}
            <Modal
                open={openSuccessModal}
                onClose={() => setOpenSuccessModal(false)}
                aria-labelledby="success-modal"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2
                }}>
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpenSuccessModal(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500]
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" component="h2" gutterBottom>
                        {t('Payment Successful')}
                    </Typography>
                    <Typography variant="body1">
                        {t('Your balance has been updated successfully.')}
                    </Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => setOpenSuccessModal(false)}
                        sx={{ mt: 2 }}
                    >
                        {t('Close')}
                    </Button>
                </Box>
            </Modal>

            {/* Canceled Modal */}
            <Modal
                open={openCanceledModal}
                onClose={() => setOpenCanceledModal(false)}
                aria-labelledby="canceled-modal"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2
                }}>
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpenCanceledModal(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500]
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" component="h2" gutterBottom>
                        {t('Payment Canceled')}
                    </Typography>
                    <Typography variant="body1">
                        {t('Your payment was canceled. No charges were made.')}
                    </Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => setOpenCanceledModal(false)}
                        sx={{ mt: 2 }}
                    >
                        {t('Close')}
                    </Button>
                </Box>
            </Modal>

            {/* Subscription Modal */}
            <Modal
                open={openSubscriptionModal}
                onClose={() => setOpenSubscriptionModal(false)}
                aria-labelledby="subscription-modal"
                sx={{
                    '& .MuiModal-root': {
                        overflow: 'auto',
                    },
                }}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: 1200,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    maxHeight: '90vh',
                    overflow: 'auto'
                }}>
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpenSubscriptionModal(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500]
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" component="h2" gutterBottom>
                        {t('Choose Your Subscription Plan')}
                    </Typography>
                    <SubscriptionPlans />
                </Box>
            </Modal>

            {/* Settings Setup Modal */}
            <SettingsSetUp
                open={openSettingsSetupModal}
                onClose={() => setOpenSettingsSetupModal(false)}
                profileData={profileData}
                onUpdate={handleProfileUpdate}
            />

            {/* SetupPassword component */}
            <SetupPassword
                open={showPasswordSetup}
                onClose={() => setShowPasswordSetup(false)}
                onSuccess={handlePasswordSetupSuccess}
            />
        </Box>
    );
};

export default UserDashboard;
