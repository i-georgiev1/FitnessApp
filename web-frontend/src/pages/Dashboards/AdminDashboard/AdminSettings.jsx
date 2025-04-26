import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress,
    Divider,
    Snackbar
} from '@mui/material';
import axiosInstance from '../../../config/axios';
import AdminSidebar from './AdminSidebar';
import { API_ENDPOINTS } from '../../../config/api';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [settings, setSettings] = useState({
        siteName: '',
        siteDescription: '',
        maintenanceMode: false,
        allowNewRegistrations: true,
        maxUsersPerTrainer: 10,
        defaultUserQuota: 5,
        emailNotifications: true,
        autoBackup: true,
        backupFrequency: 'daily',
        analyticsEnabled: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.admin.settings);
            setSettings(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching settings:', err);
            setError('Failed to load settings');
            setLoading(false);
        }
    };

    const handleChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            await axiosInstance.put(API_ENDPOINTS.admin.settings, settings);
            setSuccess('Settings saved successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Failed to save settings');
        }
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
                    System Settings
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={3}>
                    {/* General Settings */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                General Settings
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Site Name"
                                        value={settings.siteName}
                                        onChange={handleChange('siteName')}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Site Description"
                                        value={settings.siteDescription}
                                        onChange={handleChange('siteDescription')}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* System Controls */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                System Controls
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.maintenanceMode}
                                        onChange={handleChange('maintenanceMode')}
                                    />
                                }
                                label="Maintenance Mode"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.allowNewRegistrations}
                                        onChange={handleChange('allowNewRegistrations')}
                                    />
                                }
                                label="Allow New Registrations"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.analyticsEnabled}
                                        onChange={handleChange('analyticsEnabled')}
                                    />
                                }
                                label="Enable Analytics"
                            />
                        </Paper>
                    </Grid>

                    {/* User Limits */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                User Limits
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                label="Max Users per Trainer"
                                value={settings.maxUsersPerTrainer}
                                onChange={handleChange('maxUsersPerTrainer')}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                type="number"
                                label="Default User Quota"
                                value={settings.defaultUserQuota}
                                onChange={handleChange('defaultUserQuota')}
                            />
                        </Paper>
                    </Grid>

                    {/* Notifications */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Notifications
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.emailNotifications}
                                        onChange={handleChange('emailNotifications')}
                                    />
                                }
                                label="Email Notifications"
                            />
                        </Paper>
                    </Grid>

                    {/* Backup Settings */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Backup Settings
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.autoBackup}
                                        onChange={handleChange('autoBackup')}
                                    />
                                }
                                label="Automatic Backup"
                            />
                            <TextField
                                fullWidth
                                select
                                label="Backup Frequency"
                                value={settings.backupFrequency}
                                onChange={handleChange('backupFrequency')}
                                SelectProps={{
                                    native: true
                                }}
                                sx={{ mt: 2 }}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </TextField>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        size="large"
                    >
                        Save Settings
                    </Button>
                </Box>

                <Snackbar
                    open={!!success}
                    autoHideDuration={3000}
                    onClose={() => setSuccess('')}
                    message={success}
                />
            </Box>
        </Box>
    );
};

export default AdminSettings;
