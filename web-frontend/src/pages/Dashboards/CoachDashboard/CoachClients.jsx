import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Avatar
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Message as MessageIcon,
    Assignment as AssignmentIcon,
    FitnessCenter as FitnessCenterIcon,
    Person as PersonIcon,
    Restaurant as RestaurantIcon
} from '@mui/icons-material';
import axiosInstance from '../../../config/axios';
import CoachSidebar from './CoachSidebar';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../../config/api';
import { ClientJoinChart } from '../../../components/services/Bar';
import { useNavigate } from 'react-router-dom';

const CoachClients = () => {
    const { t } = useTranslation();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [totalClients, setTotalClients] = useState(0);
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [trainingPlans, setTrainingPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [assignPlanDialogOpen, setAssignPlanDialogOpen] = useState(false);
    const [mealPlans, setMealPlans] = useState([]);
    const [selectedMealPlan, setSelectedMealPlan] = useState('');
    const [assignMealPlanDialogOpen, setAssignMealPlanDialogOpen] = useState(false);
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [clientDetails, setClientDetails] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClients();
        fetchTrainingPlans();
        fetchMealPlans();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.coach.clients);
            const clientsData = response.data.clients || [];
            setClients(clientsData);
            setTotalClients(response.data.total_count || clientsData.length);
        } catch (error) {
            console.error('Error fetching clients:', error);
            setError(t('Failed to load clients'));
        } finally {
            setLoading(false);
        }
    };

    const fetchTrainingPlans = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.coach.trainingPlans);
            setTrainingPlans(response.data || []);
        } catch (error) {
            console.error('Error fetching training plans:', error);
        }
    };

    const fetchMealPlans = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.coach.mealPlans);
            setMealPlans(response.data || []);
        } catch (error) {
            console.error('Error fetching meal plans:', error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                url: error.config?.url
            });
            setError(prevError =>
                prevError ? `${prevError}\n${t('Failed to load meal plans')}` : t('Failed to load meal plans')
            );
        }
    };

    const handleEditNotes = (client) => {
        setSelectedClient(client);
        setNotes(client.notes || '');
        setDialogOpen(true);
    };

    const handleSaveNotes = async () => {
        try {
            await axiosInstance.put(`${API_ENDPOINTS.coach.clients}/${selectedClient.id}/notes`, {
                notes: notes
            });

            setClients(prevClients =>
                prevClients.map(client =>
                    client.id === selectedClient.id
                        ? { ...client, notes: notes }
                        : client
                )
            );

            setDialogOpen(false);
        } catch (error) {
            console.error('Error saving notes:', error);
            setError(error.response?.data?.message || t('Failed to save notes'));
        }
    };

    const handleDeleteClient = async (clientId) => {
        if (window.confirm(t('Are you sure you want to remove this client?'))) {
            try {
                await axiosInstance.delete(`${API_ENDPOINTS.coach.clients}/${clientId}`);
                setClients(prevClients => prevClients.filter(client => client.id !== clientId));
            } catch (error) {
                console.error('Error deleting client:', error);
                setError(error.response?.data?.message || t('Failed to delete client'));
            }
        }
    };

    const handleAssignPlan = (client) => {
        setSelectedClient(client);
        setSelectedPlan(client.assigned_plan_id || '');
        setAssignPlanDialogOpen(true);
    };

    const handleSaveAssignedPlan = async () => {
        try {
            await axiosInstance.post(`${API_ENDPOINTS.coach.clients}/${selectedClient.client_id}/assign-plan`, {
                plan_id: selectedPlan
            });

            // Update the client's assigned plan in the state
            setClients(prevClients =>
                prevClients.map(client =>
                    client.client_id === selectedClient.client_id
                        ? { ...client, assigned_plan_id: selectedPlan }
                        : client
                )
            );

            setAssignPlanDialogOpen(false);
        } catch (error) {
            console.error('Error assigning training plan:', error);
            setError(error.response?.data?.message || t('Failed to assign training plan'));
        }
    };

    const handleAssignMealPlan = (client) => {
        setSelectedClient(client);
        setSelectedMealPlan(client.assigned_meal_plan_id || '');
        setAssignMealPlanDialogOpen(true);
    };

    const handleMealPlanChange = (event) => {
        setSelectedMealPlan(event.target.value);
    };

    const handleSaveAssignedMealPlan = async () => {
        try {

            const response = await axiosInstance.post(
                API_ENDPOINTS.coach.assignMealPlan(selectedClient.client_id),
                {
                    meal_plan_id: selectedMealPlan
                }
            );

            // Update the client's assigned meal plan in the state
            setClients(prevClients =>
                prevClients.map(client =>
                    client.client_id === selectedClient.client_id
                        ? { ...client, assigned_meal_plan_id: selectedMealPlan }
                        : client
                )
            );

            setAssignMealPlanDialogOpen(false);
            setError(''); // Clear any existing errors
        } catch (error) {
            console.error('Error assigning meal plan:', error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                url: error.config?.url
            });
            setError(error.response?.data?.message || t('Failed to assign meal plan'));
        }
    };

    const handleViewProgress = (clientId) => {
        navigate(`/coach/clients/${clientId}/progress`);
    };

    const handleViewProfile = async (client) => {
        setSelectedClient(client);
        setProfileDialogOpen(true);
        setLoadingProfile(true);

        try {
            const [infoResponse, metricsResponse, progressResponse] = await Promise.all([
                axiosInstance.get(API_ENDPOINTS.coach.clientInfo(client.client_id)),
                axiosInstance.get(API_ENDPOINTS.coach.clientMetrics(client.client_id)),
                axiosInstance.get(API_ENDPOINTS.coach.clientProgress(client.client_id))
            ]);

            // Extract data from responses
            const userInfo = infoResponse.data || {};
            const metrics = metricsResponse.data || {};
            const progress = progressResponse.data || {};


            // Create the combined data object
            const combinedData = {
                // Basic user info
                first_name: client.first_name,
                last_name: client.last_name,
                email: client.email,
                profile_image_url: client.profile_image_url,
                created_at: client.assigned_at,

                // Profile data - access from userInfo.profile
                age: userInfo.profile?.age,
                gender: userInfo.profile?.gender,
                location: userInfo.profile?.location,
                timezone: userInfo.profile?.timezone,
                contact_number: userInfo.profile?.contact_number,
                emergency_contact: userInfo.profile?.emergency_contact,
                bio: userInfo.profile?.bio,
                goals: userInfo.profile?.goals,
                fitness_level: userInfo.profile?.fitness_level,
                activity_level: userInfo.profile?.activity_level,
                workout_preferences: userInfo.profile?.workout_preferences,
                dietary_preferences: userInfo.profile?.dietary_preferences,
                health_conditions: userInfo.profile?.health_conditions,
                allergies: userInfo.profile?.allergies,
                injury_history: userInfo.profile?.injury_history,
                height: userInfo.profile?.height,
                weight: userInfo.profile?.weight,

                // Metrics data
                ...metrics,

                // Progress data
                ...progress,

                // Training info
                assigned_plan_id: client.assigned_plan_id,
                assigned_meal_plan_id: client.assigned_meal_plan_id
            };

            setClientDetails(combinedData);
        } catch (error) {
            console.error('Error fetching client details:', error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                url: error.config?.url
            });
            setError(t('Failed to load client details'));
        } finally {
            setLoadingProfile(false);
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
                    {t('My Clients')}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box mb={4}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {t('Client Join Pattern by Day of Week')}
                        </Typography>
                        <ClientJoinChart clients={clients} />
                    </Paper>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('Name')}</TableCell>
                                <TableCell>{t('Email')}</TableCell>
                                <TableCell>{t('Join Date')}</TableCell>
                                <TableCell>{t('Status')}</TableCell>
                                <TableCell>{t('Training Plan')}</TableCell>
                                <TableCell>{t('Actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clients.map((client) => (
                                <TableRow key={client.client_id}>
                                    <TableCell>
                                        {`${client.first_name} ${client.last_name}`}
                                    </TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>
                                        {client.assigned_at ? new Date(client.assigned_at).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell>{client.status || 'active'}</TableCell>
                                    <TableCell>
                                        {trainingPlans.find(plan => plan.plan_id === client.assigned_plan_id)?.title || t('No plan assigned')}
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={t('Edit Notes')}>
                                            <IconButton
                                                onClick={() => handleEditNotes(client)}
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('Assign Training Plan')}>
                                            <IconButton
                                                onClick={() => handleAssignPlan(client)}
                                                size="small"
                                                color={client.assigned_plan_id ? "primary" : "default"}
                                            >
                                                <FitnessCenterIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('Assign Meal Plan')}>
                                            <IconButton
                                                onClick={() => handleAssignMealPlan(client)}
                                                size="small"
                                                color={client.assigned_meal_plan_id ? "primary" : "default"}
                                            >
                                                <RestaurantIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('View Program')}>
                                            <IconButton
                                                onClick={() => handleViewProgress(client.client_id)}
                                                size="small"
                                            >
                                                <AssignmentIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('Send Message')}>
                                            <IconButton
                                                onClick={() => {/* Handle message */ }}
                                                size="small"
                                            >
                                                <MessageIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('View Profile')}>
                                            <IconButton
                                                onClick={() => handleViewProfile(client)}
                                                size="small"
                                                color="primary"
                                            >
                                                <PersonIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('Remove Client')}>
                                            <IconButton
                                                onClick={() => handleDeleteClient(client.client_id)}
                                                size="small"
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {clients.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        {t('No clients found')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Notes Dialog */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                    <DialogTitle>
                        {t('Edit Notes for')} {selectedClient?.client_name}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label={t('Notes')}
                            fullWidth
                            multiline
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button onClick={handleSaveNotes} variant="contained" color="primary">
                            {t('Save')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Assign Training Plan Dialog */}
                <Dialog open={assignPlanDialogOpen} onClose={() => setAssignPlanDialogOpen(false)}>
                    <DialogTitle>
                        {t('Assign Training Plan to')} {selectedClient?.client_name}
                    </DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>{t('Training Plan')}</InputLabel>
                            <Select
                                value={selectedPlan}
                                onChange={(e) => setSelectedPlan(e.target.value)}
                                label={t('Training Plan')}
                            >
                                <MenuItem value="">{t('No plan')}</MenuItem>
                                {trainingPlans.map((plan) => (
                                    <MenuItem key={plan.plan_id} value={plan.plan_id}>
                                        {plan.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAssignPlanDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button onClick={handleSaveAssignedPlan} variant="contained" color="primary">
                            {t('Save')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Assign Meal Plan Dialog */}
                <Dialog open={assignMealPlanDialogOpen} onClose={() => setAssignMealPlanDialogOpen(false)}>
                    <DialogTitle>
                        {t('Assign Meal Plan to')} {selectedClient?.first_name} {selectedClient?.last_name}
                    </DialogTitle>
                    <DialogContent>
                        {mealPlans.length === 0 ? (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                {t('No meal plans available. Please create a meal plan first.')}
                            </Alert>
                        ) : (
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel id="meal-plan-select-label">{t('Meal Plan')}</InputLabel>
                                <Select
                                    labelId="meal-plan-select-label"
                                    id="meal-plan-select"
                                    value={selectedMealPlan}
                                    label={t('Meal Plan')}
                                    onChange={handleMealPlanChange}
                                >
                                    <MenuItem value="">
                                        <em>{t('No plan')}</em>
                                    </MenuItem>
                                    {mealPlans.map((plan) => (
                                        <MenuItem key={plan.id} value={plan.id}>
                                            {plan.name || plan.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            {t('Currently selected')}: {selectedMealPlan || t('No plan selected')}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAssignMealPlanDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={handleSaveAssignedMealPlan}
                            variant="contained"
                            color="primary"
                            disabled={mealPlans.length === 0}
                        >
                            {t('Save')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Profile Dialog */}
                <Dialog
                    open={profileDialogOpen}
                    onClose={() => {
                        setProfileDialogOpen(false);
                        setClientDetails(null);
                    }}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        {t('Client Profile')}
                    </DialogTitle>
                    <DialogContent>
                        {loadingProfile ? (
                            <Box display="flex" justifyContent="center" p={3}>
                                <CircularProgress />
                            </Box>
                        ) : clientDetails && (
                            <Grid container spacing={3} sx={{ mt: 1 }}>
                                {/* Left Column - Basic Info */}
                                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                                    <Avatar
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            margin: '0 auto',
                                            mb: 2
                                        }}
                                        src={clientDetails.profile_image_url}
                                    >
                                        {`${clientDetails.first_name?.[0]}${clientDetails.last_name?.[0]}`}
                                    </Avatar>
                                    <Typography variant="h6">
                                        {`${clientDetails.first_name} ${clientDetails.last_name}`}
                                    </Typography>
                                    <Typography color="textSecondary" gutterBottom>
                                        {clientDetails.email}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {t('Member since')}: {new Date(clientDetails.created_at).toLocaleDateString()}
                                    </Typography>
                                </Grid>

                                {/* Right Column - Detailed Info */}
                                <Grid item xs={12} md={8}>
                                    <Grid container spacing={3}>
                                        {/* Personal Information */}
                                        <Grid item xs={12}>
                                            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                                {t('Personal Information')}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Age')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.age || '-'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Gender')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.gender || '-'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Contact Number')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.contact_number || '-'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Emergency Contact')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.emergency_contact || '-'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Location')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.location || '-'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Timezone')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.timezone || '-'}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        {/* Physical Measurements */}
                                        <Grid item xs={12}>
                                            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                                {t('Physical Measurements')}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Height')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.height ? `${clientDetails.height} cm` : '-'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Weight')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.weight ? `${clientDetails.weight} kg` : '-'}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        {/* Fitness Profile */}
                                        <Grid item xs={12}>
                                            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                                {t('Fitness Profile')}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Fitness Level')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.fitness_level || '-'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Activity Level')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.activity_level || '-'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Workout Preferences')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.workout_preferences || '-'}
                                                    </Typography>
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
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Health Conditions')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.health_conditions || '-'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Allergies')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.allergies || '-'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Injury History')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.injury_history || '-'}
                                                    </Typography>
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
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Dietary Preferences')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.dietary_preferences || '-'}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        {/* Goals & Bio */}
                                        <Grid item xs={12}>
                                            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                                {t('Goals & Bio')}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Goals')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.goals || '-'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Bio')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {clientDetails.bio || '-'}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        {/* Training Information */}
                                        <Grid item xs={12}>
                                            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                                {t('Training Information')}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Assigned Training Plan')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {trainingPlans.find(plan => plan.plan_id === clientDetails.assigned_plan_id)?.title || t('No plan assigned')}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        {t('Assigned Meal Plan')}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {mealPlans.find(plan => plan.id === clientDetails.assigned_meal_plan_id)?.name || t('No plan assigned')}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setProfileDialogOpen(false);
                            setClientDetails(null);
                        }}>
                            {t('Close')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default CoachClients;
