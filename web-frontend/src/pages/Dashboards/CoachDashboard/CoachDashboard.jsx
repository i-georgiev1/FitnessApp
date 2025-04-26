import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import axiosInstance from '../../../config/axios';
import { useNavigate } from 'react-router-dom';
import CoachSidebar from './CoachSidebar';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../../config/api';
import { LineGraph } from '../../../components/services/Line';
import { BarGraph } from '../../../components/services/Bar';
import { PieGraph } from '../../../components/services/Pie';

const CoachDashboard = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [stats, setStats] = useState({
        totalClients: 0,
        training_plans: 0,
        meal_plans: 0,
        average_rating: 0,
        experience_years: 0,
        specializations: [],
        previousMonthSteps: [],
        twoMonthsAgoSteps: [],
        trainingDistribution: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        const checkCoachAccess = async () => {
            try {
                console.log('Checking coach access...');
                // Verify coach status
                const response = await axiosInstance.get(API_ENDPOINTS.auth.me);
                console.log('Auth response:', response.data);

                if (!response.data) {
                    throw new Error('No data received from auth endpoint');
                }

                if (response.data.user_type !== 'coach') {
                    console.log('Not a coach, redirecting...', response.data.user_type);
                    setError(t('Unauthorized: Coach access required'));
                    navigate('/');
                    return;
                }

                // Fetch all required data in parallel
                const [statsResponse, trainingPlansResponse, mealPlansResponse] = await Promise.all([
                    axiosInstance.get(API_ENDPOINTS.coach.stats),
                    axiosInstance.get(API_ENDPOINTS.coach.trainingPlans),
                    axiosInstance.get(API_ENDPOINTS.coach.mealPlans)
                ]);

                console.log('Stats response:', statsResponse.data);
                console.log('Training plans response:', trainingPlansResponse.data);
                console.log('Meal plans response:', mealPlansResponse.data);

                if (!statsResponse.data) {
                    throw new Error('No data received from stats endpoint');
                }

                setStats({
                    ...statsResponse.data,
                    training_plans: trainingPlansResponse.data.length || 0,
                    meal_plans: mealPlansResponse.data.length || 0
                });
                setLoading(false);
            } catch (err) {
                console.error('Dashboard data fetch failed:', err);
                console.error('Error details:', {
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                    message: err.message,
                    url: err.config?.url
                });

                if (err.response?.status === 401) {
                    // Only redirect to login if unauthorized
                    console.log('Unauthorized, redirecting to login...');
                    navigate('/login');
                } else {
                    const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
                    setError(errorMessage || t('Failed to load dashboard data'));
                    setLoading(false);
                }
            }
        };

        checkCoachAccess();
    }, [navigate, t]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
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
                <Typography variant="h4" gutterBottom>
                    {t('Coach Dashboard')}
                </Typography>

                <Grid container spacing={3}>
                    {/* Statistics Cards */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">{t('Total Clients')}</Typography>
                            <Typography variant="h4">{stats.totalClients}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">{t('All Training Plans')}</Typography>
                            <Typography variant="h4">{stats.training_plans}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">{t('All Meal Plans')}</Typography>
                            <Typography variant="h4">{stats.meal_plans}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">{t('Average Rating')}</Typography>
                            <Typography variant="h4">{stats.average_rating}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">{t('Experience Years')}</Typography>
                            <Typography variant="h4">{stats.experience_years}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">{t('Specializations')}</Typography>
                            <Typography variant="h4">{Array.isArray(stats.specializations) ? stats.specializations.join(', ') : stats.specializations || '-'}</Typography>
                        </Paper>
                    </Grid>

                    {/* Bar Charts Row */}
                    <Grid item xs={12}>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            {/* First Chart */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, mt: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Monthly Revenue')}
                                    </Typography>
                                    <Box sx={{ height: 400, width: '100%' }}>
                                        <BarGraph updateInterval={4000} />
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Second Chart */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, mt: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Client Growth')}
                                    </Typography>
                                    <Box sx={{ height: 400, width: '100%' }}>
                                        <BarGraph updateInterval={4500} />
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Line Charts Row */}
                    <Grid item xs={12}>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            {/* First Chart */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, mt: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Client Progress')}
                                    </Typography>
                                    <Box sx={{ height: 400, width: '100%' }}>
                                        <LineGraph updateInterval={5000} />
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Second Chart */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, mt: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Performance Metrics')}
                                    </Typography>
                                    <Box sx={{ height: 400, width: '100%' }}>
                                        <LineGraph updateInterval={5500} />
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Pie Chart Row */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, mt: 2, mb: 4 }}>
                            <Typography variant="h6" gutterBottom textAlign="center">
                                {t('Training Distribution')}
                            </Typography>
                            <Box sx={{
                                height: 400,
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Box sx={{
                                    width: '50%',
                                    maxWidth: '600px',
                                    minWidth: '300px',
                                }}>
                                    <PieGraph />
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default CoachDashboard;
