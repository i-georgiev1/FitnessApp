import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Rating,
    Tabs,
    Tab,
    Chip,
    ImageList,
    ImageListItem,
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../config/axios';
import { API_ENDPOINTS } from '../../../../config/api';
import DashboardSidebar from '../CoachSidebar';

const ClientProgress = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [clientInfo, setClientInfo] = useState(null);
    const [progressRecords, setProgressRecords] = useState([]);
    const [bodyMetrics, setBodyMetrics] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState('all');
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [selectedWeek, setSelectedWeek] = useState('all');
    const [selectedDay, setSelectedDay] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedMetricsDate, setSelectedMetricsDate] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (selectedClientId) {
            fetchClientData(selectedClientId);
        }
    }, [selectedClientId]);

    const fetchClients = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.coach.clients);
            setClients(response.data.clients || []);
            // Remove auto-selection of first client
            setLoading(false);
        } catch (error) {
            console.error('Error fetching clients:', error);
            setError(t('Failed to load clients'));
            setLoading(false);
        }
    };

    const fetchClientData = async (clientId) => {
        try {
            setLoading(true);
            setError('');

            // Fetch client info
            const clientResponse = await axiosInstance.get(API_ENDPOINTS.coach.clientInfo(clientId));
            setClientInfo(clientResponse.data.client);

            // Fetch client's progress records
            const progressResponse = await axiosInstance.get(API_ENDPOINTS.coach.clientProgress(clientId));
            setProgressRecords(progressResponse.data.progress_records || []);

            // Fetch client's body metrics
            const metricsResponse = await axiosInstance.get(API_ENDPOINTS.coach.clientMetrics(clientId));
            setBodyMetrics(metricsResponse.data.body_metrics || []);

            // Fetch client's exercises
            const exercisesResponse = await axiosInstance.get(API_ENDPOINTS.coach.clientExercises(clientId));
            setExercises(exercisesResponse.data.exercises || []);
        } catch (error) {
            console.error('Error fetching client data:', error);
            setError(t('Failed to load client data'));
        } finally {
            setLoading(false);
        }
    };

    const handleClientChange = (event) => {
        const newClientId = event.target.value;
        setSelectedClientId(newClientId);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleWeekFilterChange = (event) => {
        setSelectedWeek(event.target.value);
    };

    const handleDayFilterChange = (event) => {
        setSelectedDay(event.target.value);
    };

    const handleDateFilterChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const handleMetricsDateFilterChange = (event) => {
        setSelectedMetricsDate(event.target.value);
    };

    // Get unique weeks and days from exercises
    const uniqueWeeks = [...new Set(exercises.map(ex => ex.week_number))].sort((a, b) => a - b);
    const uniqueDays = [...new Set(exercises.map(ex => ex.day_number))].sort((a, b) => a - b);

    // Filter progress records based on week, day and date
    const filteredProgressRecords = progressRecords.filter(record => {
        const exercise = exercises.find(ex => ex.exercise_id === record.exercise_id);
        if (!exercise) return false;

        const weekMatch = selectedWeek === 'all' || exercise.week_number === parseInt(selectedWeek);
        const dayMatch = selectedDay === 'all' || exercise.day_number === parseInt(selectedDay);
        const dateMatch = !selectedDate || new Date(record.date).toISOString().split('T')[0] === selectedDate;

        return weekMatch && dayMatch && dateMatch;
    });

    // Filter body metrics based on date
    const filteredBodyMetrics = bodyMetrics.filter(metric =>
        !selectedMetricsDate || new Date(metric.date).toISOString().split('T')[0] === selectedMetricsDate
    );

    if (loading && !clientInfo) {
        return (
            <Box display="flex">
                <DashboardSidebar expanded={sidebarExpanded} onToggle={(expanded) => setSidebarExpanded(expanded)} />
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
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                        <CircularProgress />
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box display="flex">
            <DashboardSidebar expanded={sidebarExpanded} onToggle={(expanded) => setSidebarExpanded(expanded)} />
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
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        {t('Client Progress')}
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>{t('Select Client')}</InputLabel>
                        <Select
                            value={selectedClientId}
                            onChange={handleClientChange}
                            label={t('Select Client')}
                        >
                            <MenuItem value="">
                                <em>{t('None')}</em>
                            </MenuItem>
                            {clients.map((client) => (
                                <MenuItem key={client.client_id} value={client.client_id}>
                                    {`${client.first_name} ${client.last_name}`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {!selectedClientId ? (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            {t('Please select a client to view their progress')}
                        </Alert>
                    ) : error ? (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    ) : null}
                </Box>

                {selectedClientId && clientInfo && (
                    <>
                        <Paper sx={{ mb: 3 }}>
                            <Tabs value={tabValue} onChange={handleTabChange} centered>
                                <Tab label={t('Progress Records')} />
                                <Tab label={t('Body Metrics')} />
                            </Tabs>
                        </Paper>

                        {tabValue === 0 && (
                            <>
                                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <FormControl sx={{ minWidth: 120 }}>
                                        <InputLabel>{t('Week')}</InputLabel>
                                        <Select
                                            value={selectedWeek}
                                            onChange={handleWeekFilterChange}
                                            label={t('Week')}
                                        >
                                            <MenuItem value="all">{t('All Weeks')}</MenuItem>
                                            {uniqueWeeks.map((week) => (
                                                <MenuItem key={week} value={week}>
                                                    {t('Week')} {week}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl sx={{ minWidth: 120 }}>
                                        <InputLabel>{t('Day')}</InputLabel>
                                        <Select
                                            value={selectedDay}
                                            onChange={handleDayFilterChange}
                                            label={t('Day')}
                                        >
                                            <MenuItem value="all">{t('All Days')}</MenuItem>
                                            {uniqueDays.map((day) => (
                                                <MenuItem key={day} value={day}>
                                                    {t('Day')} {day}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        type="date"
                                        label={t('Date')}
                                        value={selectedDate}
                                        onChange={handleDateFilterChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        sx={{ minWidth: 200 }}
                                    />

                                    {(selectedWeek !== 'all' || selectedDay !== 'all' || selectedDate) && (
                                        <Button
                                            variant="outlined"
                                            onClick={() => {
                                                setSelectedWeek('all');
                                                setSelectedDay('all');
                                                setSelectedDate('');
                                            }}
                                            sx={{ height: 56 }}
                                        >
                                            {t('Clear Filters')}
                                        </Button>
                                    )}
                                </Box>

                                {filteredProgressRecords.length === 0 ? (
                                    <Alert severity="info">
                                        {t('No progress records found for this client.')}
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
                                                    <TableCell>{t('Notes')}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredProgressRecords.map((record) => {
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
                                                            <TableCell>{record.notes || '-'}</TableCell>
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
                                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <TextField
                                        type="date"
                                        label={t('Filter by Date')}
                                        value={selectedMetricsDate}
                                        onChange={handleMetricsDateFilterChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        sx={{ minWidth: 200 }}
                                    />

                                    {selectedMetricsDate && (
                                        <Button
                                            variant="outlined"
                                            onClick={() => setSelectedMetricsDate('')}
                                            sx={{ height: 56 }}
                                        >
                                            {t('Clear Date Filter')}
                                        </Button>
                                    )}
                                </Box>

                                {filteredBodyMetrics.length === 0 ? (
                                    <Alert severity="info">
                                        {t('No body metrics records found for this client.')}
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
                                                                <TableCell>{t('Notes')}</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {filteredBodyMetrics.map((metric) => (
                                                                <TableRow key={metric.metric_id}>
                                                                    <TableCell>
                                                                        {new Date(metric.date).toLocaleDateString()}
                                                                    </TableCell>
                                                                    <TableCell>{metric.weight}</TableCell>
                                                                    <TableCell>{metric.bmi}</TableCell>
                                                                    <TableCell>{metric.body_fat}</TableCell>
                                                                    <TableCell>{metric.muscle_mass}</TableCell>
                                                                    <TableCell>{metric.notes || '-'}</TableCell>
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
                    </>
                )}
            </Box>
        </Box>
    );
};

export default ClientProgress;
