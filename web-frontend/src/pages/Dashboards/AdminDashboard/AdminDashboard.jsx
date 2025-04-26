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
import AdminSidebar from './AdminSidebar';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../../config/api';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        totalWorkouts: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdminAccess = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error(t('No authentication token found'));
                }

                // Verify admin status
                const response = await axiosInstance.get(API_ENDPOINTS.auth.me);
                if (response.data.user_type !== 'admin') {
                    throw new Error(t('Unauthorized: Admin access required'));
                }

                // Fetch admin dashboard statistics
                const statsResponse = await axiosInstance.get(API_ENDPOINTS.admin.stats);
                setStats(statsResponse.data);
                setLoading(false);

            } catch (err) {
                console.error('Access verification failed:', err);
                setError(err.message || t('Access denied'));
                navigate('/login'); // Redirect to login if unauthorized
            }
        };

        checkAdminAccess();
    }, [navigate, t]);

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
            </Container>
        );
    }

    return (
        <Box display="flex">
            <AdminSidebar onToggle={(expanded) => setSidebarExpanded(expanded)} />

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
                    {t('Admin Dashboard')}
                </Typography>

                <Grid container spacing={3}>
                    {/* Statistics Cards */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">{t('Total Users')}</Typography>
                            <Typography variant="h4">{stats.totalUsers}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">{t('Active Users')}</Typography>
                            <Typography variant="h4">{stats.activeUsers}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">{t('New Users')}</Typography>
                            <Typography variant="h4">{stats.newUsersThisMonth}</Typography>
                            <Typography variant="caption">{t('This Month')}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">{t('Total Workouts')}</Typography>
                            <Typography variant="h4">{stats.totalWorkouts}</Typography>
                        </Paper>
                    </Grid>

                    {/* Quick Actions Section */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, mt: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Quick Actions')}
                            </Typography>
                            <Typography variant="body1">
                                {t('Use the sidebar menu to:')}
                            </Typography>
                            <ul>
                                <li>{t('Manage users and their permissions')}</li>
                                <li>{t('View detailed analytics and reports')}</li>
                                <li>{t('Configure system settings')}</li>
                                <li>{t('Monitor platform activity')}</li>
                            </ul>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default AdminDashboard;
