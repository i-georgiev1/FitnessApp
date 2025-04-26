import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Rating,
    Tabs,
    Tab,
    Divider,
    Chip,
    FormHelperText,
    ImageList,
    ImageListItem,
    CardMedia,
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    TrendingUp,
    FitnessCenter,
    FilterList,
    PhotoCamera,
    MonitorWeight
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../../config/axios';
import { API_ENDPOINTS } from '../../../config/api';
import DashboardSidebar from './DashboardSidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const UserProgress = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [trainingPlan, setTrainingPlan] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [progressRecords, setProgressRecords] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        exercise_id: '',
        sets_completed: '',
        reps_completed: '',
        weight_used: '',
        duration_minutes: '',
        notes: '',
        rating: 3
    });
    const [editMode, setEditMode] = useState(false);
    const [editRecordId, setEditRecordId] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [selectedWeek, setSelectedWeek] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [availableDays, setAvailableDays] = useState([]);
    const [bodyMetrics, setBodyMetrics] = useState([]);
    const [bodyMetricsDialog, setBodyMetricsDialog] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [bodyMetricsForm, setBodyMetricsForm] = useState({
        weight: '',
        body_fat: '',
        muscle_mass: '',
        photo: null,
        notes: ''
    });
    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        const savedState = localStorage.getItem('userSidebarState');
        return savedState ? JSON.parse(savedState) : true;
    });

    useEffect(() => {
        fetchUserTrainingPlan();
        fetchProgressRecords();
        fetchBodyMetrics();
    }, []);

    useEffect(() => {
        if (trainingPlan && exercises.length > 0) {
            // Extract unique weeks from exercises
            const weeks = [...new Set(exercises.map(ex => ex.week_number))].sort((a, b) => a - b);
            setAvailableWeeks(weeks);
        }
    }, [trainingPlan, exercises]);

    useEffect(() => {
        if (selectedWeek !== '' && exercises.length > 0) {
            // Filter days based on selected week
            const days = [...new Set(
                exercises
                    .filter(ex => ex.week_number === parseInt(selectedWeek))
                    .map(ex => ex.day_number)
            )].sort((a, b) => a - b);
            setAvailableDays(days);
            setSelectedDay(''); // Reset day selection when week changes
            setFilteredExercises([]); // Reset filtered exercises
        } else {
            setAvailableDays([]);
        }
    }, [selectedWeek, exercises]);

    useEffect(() => {
        if (selectedWeek !== '' && selectedDay !== '' && exercises.length > 0) {
            // Filter exercises based on selected week and day
            const filtered = exercises.filter(
                ex => ex.week_number === parseInt(selectedWeek) &&
                    ex.day_number === parseInt(selectedDay)
            ).sort((a, b) => a.order_in_day - b.order_in_day);
            setFilteredExercises(filtered);
        } else {
            setFilteredExercises([]);
        }
    }, [selectedWeek, selectedDay, exercises]);

    const fetchUserTrainingPlan = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.user.trainingPlan);
            setTrainingPlan(response.data.training_plan);
            setExercises(response.data.exercises || []);
        } catch (error) {
            console.error('Error fetching training plan:', error);
            setError(t('Failed to load your training plan'));
        }
    };

    const fetchProgressRecords = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.user.progress);
            setProgressRecords(response.data.progress_records || []);
        } catch (error) {
            console.error('Error fetching progress records:', error);
            setError(t('Failed to load your progress records'));
        } finally {
            setLoading(false);
        }
    };

    const fetchBodyMetrics = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.user.bodyMetrics);
            setBodyMetrics(response.data.body_metrics || []);
        } catch (error) {
            console.error('Error fetching body metrics:', error);
            setError(t('Failed to load your body metrics'));
        }
    };

    const handleOpenDialog = (exercise = null) => {
        setSelectedExercise(exercise);
        setFormData({
            exercise_id: exercise ? exercise.exercise_id : '',
            sets_completed: '',
            reps_completed: '',
            weight_used: '',
            duration_minutes: '',
            notes: '',
            rating: 3
        });
        setEditMode(false);
        setDialogOpen(true);
    };

    const handleEditRecord = (record) => {
        setEditMode(true);
        setEditRecordId(record.tracking_id);
        setSelectedExercise(record.exercise);
        setFormData({
            exercise_id: record.exercise.exercise_id,
            sets_completed: record.sets_completed,
            reps_completed: record.reps_completed,
            weight_used: record.weight_used || '',
            duration_minutes: record.duration_minutes || '',
            notes: record.notes || '',
            rating: record.rating || 3
        });
        setDialogOpen(true);
    };

    const handleDeleteRecord = async (recordId) => {
        if (window.confirm(t('Are you sure you want to delete this progress record?'))) {
            try {
                await axiosInstance.delete(`${API_ENDPOINTS.user.progress}/${recordId}`);
                setProgressRecords(prevRecords => prevRecords.filter(record => record.tracking_id !== recordId));
            } catch (error) {
                console.error('Error deleting progress record:', error);
                setError(t('Failed to delete progress record'));
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (newValue) => {
        setFormData(prev => ({ ...prev, rating: newValue }));
    };

    const handleSubmit = async () => {
        try {
            // Validate form data
            if (!formData.exercise_id || !formData.sets_completed || !formData.reps_completed) {
                setError(t('Please fill in all required fields'));
                return;
            }

            if (editMode) {
                // Update existing record
                await axiosInstance.put(`${API_ENDPOINTS.user.progress}/${editRecordId}`, formData);
            } else {
                // Create new record
                await axiosInstance.post(API_ENDPOINTS.user.progress, formData);
            }

            // Refresh progress records
            fetchProgressRecords();
            setDialogOpen(false);
        } catch (error) {
            console.error('Error saving progress record:', error);
            setError(t('Failed to save progress record'));
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleWeekChange = (event) => {
        setSelectedWeek(event.target.value);
    };

    const handleDayChange = (event) => {
        setSelectedDay(event.target.value);
    };

    const handleBodyMetricsSubmit = async () => {
        try {
            const formData = new FormData();
            Object.keys(bodyMetricsForm).forEach(key => {
                if (bodyMetricsForm[key] !== null) {
                    formData.append(key, bodyMetricsForm[key]);
                }
            });

            if (editMode) {
                await axiosInstance.put(`${API_ENDPOINTS.user.bodyMetrics}/${editRecordId}`, formData);
            } else {
                await axiosInstance.post(API_ENDPOINTS.user.bodyMetrics, formData);
            }

            fetchBodyMetrics();
            setBodyMetricsDialog(false);
            setBodyMetricsForm({
                weight: '',
                body_fat: '',
                muscle_mass: '',
                photo: null,
                notes: ''
            });
            setPhotoPreview(null);
        } catch (error) {
            console.error('Error saving body metrics:', error);
            setError(t('Failed to save body metrics'));
        }
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setBodyMetricsForm(prev => ({ ...prev, photo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteBodyMetric = async (metricId) => {
        if (window.confirm(t('Are you sure you want to delete this body metric record?'))) {
            try {
                await axiosInstance.delete(`${API_ENDPOINTS.user.bodyMetrics}/${metricId}`);
                setBodyMetrics(prevMetrics => prevMetrics.filter(metric => metric.metric_id !== metricId));
            } catch (error) {
                console.error('Error deleting body metric:', error);
                setError(t('Failed to delete body metric'));
            }
        }
    };

    // Handle sidebar toggle
    const handleSidebarToggle = (expanded) => {
        setSidebarExpanded(expanded);
        localStorage.setItem('userSidebarState', JSON.stringify(expanded));
    };

    if (loading) {
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
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                        <CircularProgress />
                    </Box>
                </Box>
            </Box>
        );
    }

    if (!trainingPlan) {
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
                    <Alert severity="info" sx={{ mt: 2 }}>
                        {t('No training plan is currently assigned to you. Please contact your coach to get started with progress tracking.')}
                    </Alert>
                </Box>
            </Box>
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
                <Typography variant="h4" gutterBottom>
                    {t('Progress Tracking')}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Paper sx={{ mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} centered>
                        <Tab label={t('Progress Records')} />
                        <Tab label={t('Body Metrics')} />
                    </Tabs>
                </Paper>

                {tabValue === 0 && (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                {t('Your Progress Records')}
                            </Typography>
                        </Box>

                        {progressRecords.length === 0 ? (
                            <Alert severity="info">
                                {t('No progress records found. Go to your exercises to start tracking your progress.')}
                            </Alert>
                        ) : (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t('Date')}</TableCell>
                                            <TableCell>{t('Exercise')}</TableCell>
                                            <TableCell>{t('Week/Day')}</TableCell>
                                            <TableCell>{t('Sets')}</TableCell>
                                            <TableCell>{t('Reps')}</TableCell>
                                            <TableCell>{t('Weight')}</TableCell>
                                            <TableCell>{t('Duration')}</TableCell>
                                            <TableCell>{t('Rating')}</TableCell>
                                            <TableCell>{t('Actions')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {progressRecords.map((record) => {
                                            // Find the exercise to get week and day info
                                            const exercise = exercises.find(ex => ex.exercise_id === record.exercise_id);

                                            return (
                                                <TableRow key={record.tracking_id}>
                                                    <TableCell>
                                                        {new Date(record.date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>{record.exercise.name}</TableCell>
                                                    <TableCell>
                                                        {exercise ? `W${exercise.week_number}/D${exercise.day_number}` : '-'}
                                                    </TableCell>
                                                    <TableCell>{record.sets_completed}</TableCell>
                                                    <TableCell>{record.reps_completed}</TableCell>
                                                    <TableCell>
                                                        {record.weight_used ? `${record.weight_used} kg` : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {record.duration_minutes ? `${record.duration_minutes} min` : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Rating value={record.rating || 0} readOnly size="small" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditRecord(record)}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteRecord(record.tracking_id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </>
                )}

                {tabValue === 1 && (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                {t('Body Metrics Tracking')}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => setBodyMetricsDialog(true)}
                            >
                                {t('Add Body Metrics')}
                            </Button>
                        </Box>

                        {bodyMetrics.length === 0 ? (
                            <Alert severity="info">
                                {t('No body metrics records found. Start tracking your body metrics by adding your first record.')}
                            </Alert>
                        ) : (
                            <>
                                <Grid container spacing={3} sx={{ mb: 4 }}>
                                    <Grid item xs={12} md={8}>
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>{t('Date')}</TableCell>
                                                        <TableCell>{t('Weight (kg)')}</TableCell>
                                                        <TableCell>{t('BMI')}</TableCell>
                                                        <TableCell>{t('Body Fat %')}</TableCell>
                                                        <TableCell>{t('Muscle Mass (kg)')}</TableCell>
                                                        <TableCell>{t('Actions')}</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {bodyMetrics.map((metric) => (
                                                        <TableRow key={metric.metric_id}>
                                                            <TableCell>
                                                                {new Date(metric.date).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>{metric.weight}</TableCell>
                                                            <TableCell>{metric.bmi}</TableCell>
                                                            <TableCell>{metric.body_fat}</TableCell>
                                                            <TableCell>{metric.muscle_mass}</TableCell>
                                                            <TableCell>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        setEditMode(true);
                                                                        setEditRecordId(metric.metric_id);
                                                                        setBodyMetricsForm({
                                                                            weight: metric.weight,
                                                                            body_fat: metric.body_fat,
                                                                            muscle_mass: metric.muscle_mass,
                                                                            photo: null,
                                                                            notes: metric.notes
                                                                        });
                                                                        setPhotoPreview(metric.photo_url);
                                                                        setBodyMetricsDialog(true);
                                                                    }}
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleDeleteBodyMetric(metric.metric_id)}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Paper sx={{ p: 2 }}>
                                            <Typography variant="h6" gutterBottom>
                                                {t('Progress Photos')}
                                            </Typography>
                                            <ImageList cols={2} rowHeight={160}>
                                                {bodyMetrics
                                                    .filter(metric => metric.photo_url)
                                                    .map((metric) => (
                                                        <ImageListItem
                                                            key={metric.metric_id}
                                                            onClick={() => setSelectedPhoto(metric.photo_url)}
                                                            sx={{ cursor: 'pointer' }}
                                                        >
                                                            <img
                                                                src={metric.photo_url}
                                                                alt={`Progress photo from ${new Date(metric.date).toLocaleDateString()}`}
                                                                loading="lazy"
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                        </ImageListItem>
                                                    ))}
                                            </ImageList>
                                        </Paper>
                                    </Grid>
                                </Grid>

                                {/* Charts for body metrics */}
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {t('Body Metrics Trends')}
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart data={bodyMetrics.sort((a, b) => new Date(a.date) - new Date(b.date))}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(date) => new Date(date).toLocaleDateString()}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="weight"
                                                stroke="#8884d8"
                                                name={t('Weight (kg)')}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="bmi"
                                                stroke="#82ca9d"
                                                name={t('BMI')}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="body_fat"
                                                stroke="#ffc658"
                                                name={t('Body Fat %')}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="muscle_mass"
                                                stroke="#ff7300"
                                                name={t('Muscle Mass (kg)')}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </>
                        )}

                        {/* Body Metrics Dialog */}
                        <Dialog
                            open={bodyMetricsDialog}
                            onClose={() => {
                                setBodyMetricsDialog(false);
                                setEditMode(false);
                                setBodyMetricsForm({
                                    weight: '',
                                    body_fat: '',
                                    muscle_mass: '',
                                    photo: null,
                                    notes: ''
                                });
                                setPhotoPreview(null);
                            }}
                            maxWidth="sm"
                            fullWidth
                        >
                            <DialogTitle>
                                {editMode ? t('Edit Body Metrics') : t('Add Body Metrics')}
                            </DialogTitle>
                            <DialogContent>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label={t('Weight (kg)')}
                                            type="number"
                                            value={bodyMetricsForm.weight}
                                            onChange={(e) => setBodyMetricsForm(prev => ({
                                                ...prev,
                                                weight: e.target.value
                                            }))}
                                            inputProps={{ step: "0.1" }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label={t('Body Fat %')}
                                            type="number"
                                            value={bodyMetricsForm.body_fat}
                                            onChange={(e) => setBodyMetricsForm(prev => ({
                                                ...prev,
                                                body_fat: e.target.value
                                            }))}
                                            inputProps={{ step: "0.1" }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label={t('Muscle Mass (kg)')}
                                            type="number"
                                            value={bodyMetricsForm.muscle_mass}
                                            onChange={(e) => setBodyMetricsForm(prev => ({
                                                ...prev,
                                                muscle_mass: e.target.value
                                            }))}
                                            inputProps={{ step: "0.1" }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('Notes')}
                                            multiline
                                            rows={3}
                                            value={bodyMetricsForm.notes}
                                            onChange={(e) => setBodyMetricsForm(prev => ({
                                                ...prev,
                                                notes: e.target.value
                                            }))}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<PhotoCamera />}
                                            fullWidth
                                        >
                                            {t('Upload Progress Photo')}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                            />
                                        </Button>
                                        {photoPreview && (
                                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                                <img
                                                    src={photoPreview}
                                                    alt={t('Photo preview')}
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '200px',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => {
                                    setBodyMetricsDialog(false);
                                    setEditMode(false);
                                    setBodyMetricsForm({
                                        weight: '',
                                        body_fat: '',
                                        muscle_mass: '',
                                        photo: null,
                                        notes: ''
                                    });
                                    setPhotoPreview(null);
                                }}>
                                    {t('Cancel')}
                                </Button>
                                <Button
                                    onClick={handleBodyMetricsSubmit}
                                    variant="contained"
                                    color="primary"
                                >
                                    {editMode ? t('Update') : t('Save')}
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Photo Preview Dialog */}
                        <Dialog
                            open={Boolean(selectedPhoto)}
                            onClose={() => setSelectedPhoto(null)}
                            maxWidth="md"
                            fullWidth
                        >
                            <DialogContent>
                                {selectedPhoto && (
                                    <img
                                        src={selectedPhoto}
                                        alt={t('Progress photo')}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '80vh',
                                            objectFit: 'contain'
                                        }}
                                    />
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setSelectedPhoto(null)}>
                                    {t('Close')}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )}

                {/* Add/Edit Progress Dialog */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {editMode ? t('Edit Progress Record') : t('Add Progress Record')}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Sets Completed')}
                                        name="sets_completed"
                                        type="number"
                                        value={formData.sets_completed}
                                        onChange={handleInputChange}
                                        required
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Reps Completed')}
                                        name="reps_completed"
                                        type="number"
                                        value={formData.reps_completed}
                                        onChange={handleInputChange}
                                        required
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Weight Used (kg)')}
                                        name="weight_used"
                                        type="number"
                                        value={formData.weight_used}
                                        onChange={handleInputChange}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Duration (minutes)')}
                                        name="duration_minutes"
                                        type="number"
                                        value={formData.duration_minutes}
                                        onChange={handleInputChange}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                fullWidth
                                label={t('Notes')}
                                name="notes"
                                multiline
                                rows={3}
                                value={formData.notes}
                                onChange={handleInputChange}
                                sx={{ mb: 2 }}
                            />

                            <Box sx={{ mb: 2 }}>
                                <Typography component="legend">{t('Rating')}</Typography>
                                <Rating
                                    name="rating"
                                    value={formData.rating}
                                    onChange={(event, newValue) => {
                                        handleRatingChange(newValue);
                                    }}
                                />
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            color="primary"
                            disabled={!formData.sets_completed || !formData.reps_completed}
                        >
                            {editMode ? t('Update') : t('Save')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default UserProgress; 